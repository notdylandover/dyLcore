const { Debug, Error, Live } = require('./logging');
const { LiveEmbed } = require('./embeds');

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const twitchClientID = process.env.TWITCHCLIENTID;
const twitchSecret = process.env.TWITCHCLIENTSECRET;
const liveConfigFilePath = './data/liveConfig.json';
const liveRoleConfigFilePath = './data/liveRoleConfig.json';
const twitchUsersFilePath = './data/twitchUsers.json'; // New file for Twitch user mappings

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
        Error(`Error fetching user profile: ${error.message}`);
        throw error;
    }
}

module.exports = async function isLive(client, channels) {
    try {
        const token = await getToken();
        const streams = await checkLiveStatus(token, channels);

        const liveConfig = JSON.parse(fs.readFileSync(liveConfigFilePath));
        const guildId = Object.keys(liveConfig)[0];
        const channelId = liveConfig[guildId]?.channelId;
        let messageIds = liveConfig[guildId]?.messageIds || [];

        const liveRoleConfig = JSON.parse(fs.readFileSync(liveRoleConfigFilePath));
        const liveRoleId = liveRoleConfig[guildId]?.roleId;

        const twitchUsers = JSON.parse(fs.readFileSync(twitchUsersFilePath));

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

                if (channelId) {
                    const existingMessageId = messageIds.find(msgId => msgId.stream === stream.user_name);
                    
                    if (existingMessageId) {
                        await updateMessage(client, channelId, existingMessageId.messageId, { content: '', embeds: [embed] });
                    } else {
                        const newMessageId = await sendMessage(client, channelId, '', embed);
                        messageIds.push({ stream: stream.user_name, messageId: newMessageId });
                        storeLiveConfig(guildId, channelId, messageIds);
                    }

                    const discordUserId = twitchUsers[stream.user_name]?.discordUserId;
                    if (discordUserId && liveRoleId) {
                        const guild = await client.guilds.fetch(guildId);
                        const member = await guild.members.fetch(discordUserId);
                        if (member) {
                            await member.roles.add(liveRoleId);
                        }
                    }
                } else {
                    Error('Channel ID not found in config.');
                }
            }));
        } else {
            if (messageIds.length > 0) {
                await Promise.all(messageIds.map(async msg => {
                    await deleteMessage(client, channelId, msg.messageId);
                }));
                storeLiveConfig(guildId, channelId, null);
                messageIds = [];
            }

            for (const twitchUser in twitchUsers) {
                const discordUserId = twitchUsers[twitchUser]?.discordUserId;
                if (discordUserId && liveRoleId) {
                    const guild = await client.guilds.fetch(guildId);
                    const member = await guild.members.fetch(discordUserId);
                    if (member) {
                        await member.roles.remove(liveRoleId);
                    }
                }
            }
        }

        return streams.map(stream => stream.user_name);
    } catch (error) {
        Error(`Error in isLive function: ${error.message}`);
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
        Error(`Error sending message: ${error.message}`);
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
        Error(`Error updating message: ${error.message}`);
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
        Error(`Error deleting message: ${error.message}`);
        throw error;
    }
}

function storeLiveConfig(guildId, channelId, messageIds) {
    try {
        let liveConfig = JSON.parse(fs.readFileSync(liveConfigFilePath, 'utf-8'));
        liveConfig[guildId] = { channelId, messageIds };
        fs.writeFileSync(liveConfigFilePath, JSON.stringify(liveConfig, null, 2));
    } catch (error) {
        Error(`Error storing live config: ${error.message}`);
        throw error;
    }
}