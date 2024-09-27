const { DebugNoDB, Error } = require('./logging');
const { LiveEmbed } = require('./embeds');

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const twitchClientID = process.env.TWITCHCLIENTID;
const twitchSecret = process.env.TWITCHCLIENTSECRET;
const serversDataPath = path.join(__dirname, '..', 'data', 'servers');
const twitchUsersFilePath = path.join(__dirname, '..', 'data', 'twitchUsers.json');

function ensureFileExists(filePath, initialData = '{}') {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, initialData, 'utf-8');
    }
}

function ensureGuildConfigDefaults(guildConfig) {
    if (!guildConfig.liveChannelId) guildConfig.liveChannelId = null;
    if (!guildConfig.liveRoleId) guildConfig.liveRoleId = null;
    if (!Array.isArray(guildConfig.messageIds)) guildConfig.messageIds = []; // Ensure messageIds is an array
}

async function getToken() {
    try {
        const params = new URLSearchParams();
        params.append('client_id', twitchClientID);
        params.append('client_secret', twitchSecret);
        params.append('grant_type', 'client_credentials');

        const response = await axios.post('https://id.twitch.tv/oauth2/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data.access_token;
    } catch (error) {
        Error(`Error fetching token: ${error.message}`);
        if (error.response) {
            Error(`Response data: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
}

async function checkLiveStatus(token, channels) {
    try {
        const params = new URLSearchParams();
        channels.forEach(channel => params.append('user_login', channel));

        const response = await axios.get('https://api.twitch.tv/helix/streams', {
            headers: {
                'Client-ID': twitchClientID,
                'Authorization': `Bearer ${token}`
            },
            params: params
        });

        return response.data.data;
    } catch (error) {
        Error(`Error checking live status: ${error.message}`);
        if (error.response) {
            Error(`Response data: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
}

async function getUserProfile(userLogin, token) {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/users?login=${userLogin}`, {
            headers: {
                'Client-ID': twitchClientID,
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data.data[0];
    } catch (error) {
        Error(`Error fetching user profile:\n${error.message}`);
        throw error;
    }
}

module.exports = async function isLive(client, channels) {
    try {
        const token = await getToken();
        const streams = await checkLiveStatus(token, channels);

        ensureFileExists(twitchUsersFilePath, '{}');
        const twitchUsers = JSON.parse(fs.readFileSync(twitchUsersFilePath, 'utf-8'));

        const guilds = await client.guilds.fetch();

        for (const guild of guilds.values()) {
            const configFile = path.join(serversDataPath, `${guild.id}.json`);

            ensureFileExists(configFile, JSON.stringify({
                liveChannelId: null,
                liveRoleId: null,
                messageIds: []
            }, null, 2));

            let guildConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            ensureGuildConfigDefaults(guildConfig);

            const { liveChannelId, liveRoleId } = guildConfig;

            if (!liveChannelId) {
                continue;
            }

            if (streams.length > 0) {
                await Promise.all(streams.map(async stream => {
                    const thumbnailURL = stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080');
                    const userProfile = await getUserProfile(stream.user_name, token);
                    const avatarURL = userProfile.profile_image_url;

                    const embed = new LiveEmbed({
                        username: stream.user_name,
                        avatarURL: avatarURL,
                        title: stream.title,
                        category: stream.game_name,
                        viewers: stream.viewer_count,
                        thumbnailURL: thumbnailURL
                    });

                    const existingMessageId = guildConfig.messageIds.find(msgId => msgId.stream === stream.user_name);

                    if (existingMessageId) {
                        await updateMessage(client, liveChannelId, existingMessageId.messageId, { content: '', embeds: [embed] });
                    } else {
                        const newMessageId = await sendMessage(client, liveChannelId, '', embed);
                        guildConfig.messageIds.push({ stream: stream.user_name, messageId: newMessageId });
                        storeLiveConfig(guild.id, guildConfig);
                    }

                    const discordUserId = twitchUsers[stream.user_name]?.discordUserId;
                    if (discordUserId && liveRoleId) {
                        const updatedGuild = await client.guilds.fetch(guild.id);
                        let member;
                        try {
                            member = await updatedGuild.members.fetch(discordUserId);
                        } catch (error) {
                            if (error.message.includes('Unknown Member')) {
                                return;
                            } else {
                                return Error(`Could not fetch member: ${error.message}`);
                            }
                        }

                        if (member) {
                            if (!member.roles.cache.has(liveRoleId)) {
                                await member.roles.add(liveRoleId)
                            }
                        }
                    }
                }));
            } else {
                if (guildConfig.messageIds && guildConfig.messageIds.length > 0) {
                    await Promise.all(guildConfig.messageIds.map(async msg => {
                        await deleteMessage(client, liveChannelId, msg.messageId);
                    }));
                    storeLiveConfig(guild.id, { ...guildConfig, messageIds: [] });
                }

                for (const twitchUser of Object.keys(twitchUsers)) {
                    const discordUserId = twitchUsers[twitchUser]?.discordUserId;
                    if (discordUserId && liveRoleId) {
                        const updatedGuild = await client.guilds.fetch(guild.id);
                        let member;
                        try {
                            member = await updatedGuild.members.fetch(discordUserId);
                        } catch (error) {
                            if (error.message.includes('Unknown Member')) {
                                return;
                            } else {
                                return Error(`Could not fetch member: ${error.message}`);
                            }
                        }

                        if (member) {
                            if (member.roles.cache.has(liveRoleId)) {
                                await member.roles.remove(liveRoleId)
                            }
                        }
                    }
                }
            }
        }

        return streams.map(stream => stream.user_name);
    } catch (error) {
        Error(`Error in isLive function:\n${error.message}`);
        throw error;
    }
}

async function sendMessage(client, channelId, content, embed) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            const message = await channel.send({ embeds: [embed] });
            return message.id;
        } else {
            throw new Error('Channel not found or is not a text channel.');
        }
    } catch (error) {
        Error(`Error sending message:\n${error.message}`);
        throw error;
    }
}

async function updateMessage(client, channelId, messageId, messageContent) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            const fetchedMessage = await channel.messages.fetch(messageId);
            if (fetchedMessage) {
                await fetchedMessage.edit(messageContent);
            } else {
                throw new Error('Message not found in channel.');
            }
        } else {
            throw new Error('Channel not found or is not a text channel.');
        }
    } catch (error) {
        Error(`Error updating message:\n${error.message}`);
        throw error;
    }
}

async function deleteMessage(client, channelId, messageId) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            const fetchedMessage = await channel.messages.fetch(messageId);
            if (fetchedMessage) {
                await fetchedMessage.delete();
            } else {
                throw new Error('Message not found in channel.');
            }
        } else {
            throw new Error('Channel not found or is not a text channel.');
        }
    } catch (error) {
        Error(`Error deleting message:\n${error.message}`);
        throw error;
    }
}

function storeLiveConfig(guildId, guildConfig) {
    try {
        const configFile = path.join(serversDataPath, `${guildId}.json`);
        fs.writeFileSync(configFile, JSON.stringify(guildConfig, null, 2));
    } catch (error) {
        Error(`Error storing live config:\n${error.message}`);
        throw error;
    }
}