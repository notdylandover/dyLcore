const { Debug, Error, Warn } = require('./logging');
const { LiveEmbed } = require('./embeds');

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const twitchClientID = process.env.TWITCHCLIENTID;
const twitchSecret = process.env.TWITCHCLIENTSECRET;
const serversDataPath = path.join(__dirname, '..', 'data', 'servers');

function ensureFileExists(filePath, initialData = '{}') {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, initialData, 'utf-8');
    }
}

function ensureGuildConfigDefaults(guildConfig) {
    if (!guildConfig.liveChannelId) guildConfig.liveChannelId = null;
    if (!guildConfig.liveRoleId) guildConfig.liveRoleId = null;
    if (!Array.isArray(guildConfig.messageIds)) guildConfig.messageIds = [];
    if (!Array.isArray(guildConfig.twitchUsers)) guildConfig.twitchUsers = [];
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
        Error(`Error fetching user profile for ${userLogin}: ${error.message}`);
        throw error;
    }
}

module.exports = async function isLive(client) {
    try {
        const token = await getToken();
        const guilds = await client.guilds.fetch();

        for (const guild of guilds.values()) {
            const configFile = path.join(serversDataPath, `${guild.id}.json`);

            ensureFileExists(configFile, JSON.stringify({
                liveChannelId: null,
                liveRoleId: null,
                messageIds: [],
                twitchUsers: []
            }, null, 2));

            let guildConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            ensureGuildConfigDefaults(guildConfig);

            const { liveChannelId, liveRoleId, twitchUsers } = guildConfig;      

            if (!liveChannelId || twitchUsers.length === 0) {
                continue;
            }

            let twitchUsernames = [];
            if (twitchUsers.length === 0) {
                const allGuildFiles = fs.readdirSync(serversDataPath).filter(file => file.endsWith('.json'));
                let allTwitchUsers = [];

                for (const file of allGuildFiles) {
                    const data = JSON.parse(fs.readFileSync(path.join(serversDataPath, file), 'utf-8'));
                    if (Array.isArray(data.twitchUsers)) {
                        allTwitchUsers.push(...data.twitchUsers);
                    }
                }

                twitchUsernames = [...new Set(allTwitchUsers.map(u => u.twitchUsername))];
            } else {
                twitchUsernames = twitchUsers.map(u => u.twitchUsername);
            }

            const streams = await checkLiveStatus(token, twitchUsernames);

            const liveUsernames = streams.map(stream => stream.user_name.toLowerCase());

            const previouslyLiveMessages = guildConfig.messageIds.map(msg => msg.stream.toLowerCase());
            const noLongerLive = previouslyLiveMessages.filter(username => !liveUsernames.includes(username));

            for (const username of noLongerLive) {
                const liveUser = twitchUsers.find(user => user.twitchUsername.toLowerCase() === username);
                if (liveUser && liveUser.discordUserId && liveRoleId) {
                    const updatedGuild = await client.guilds.fetch(guild.id);
                    let member;

                    try {
                        member = await updatedGuild.members.fetch(liveUser.discordUserId);
                    } catch (error) {
                        if (error.message.includes('Unknown Member')) {
                            Warn(`Discord member ${liveUser.discordUserId} not found in guild ${guild.id}.`);
                        } else {
                            Error(`Could not fetch member ${liveUser.discordUserId}: ${error.message}`);
                            return null;
                        }
                    }

                    if (member) {
                        if (liveRoleId && member.roles.cache.has(liveRoleId)) {
                            await member.roles.remove(liveRoleId);
                        }

                        const nicknamePrefix = /^🔴\s+/;
                        if (nicknamePrefix.test(member.displayName)) {
                            const originalNickname = member.displayName.replace(nicknamePrefix, '');
                            await member.setNickname(originalNickname).catch(err => {
                                Error(`Error resetting nickname for ${member.id}: ${err.message}`);
                            });
                        }
                    }

                    const msgIndex = guildConfig.messageIds.findIndex(msg => msg.stream.toLowerCase() === username);
                    if (msgIndex !== -1) {
                        const messageId = guildConfig.messageIds[msgIndex].messageId;
                        await deleteMessage(client, liveChannelId, messageId).catch(err => {
                            if (!err.message.includes('Unknown Message') && !err.message.includes('Message not found')) {
                                Error(`Error deleting message ${messageId}: ${err.message}`);
                            }
                        });
                        guildConfig.messageIds.splice(msgIndex, 1);
                    }
                }
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

                    const existingMessage = guildConfig.messageIds ? guildConfig.messageIds.find(msg => msg.stream.toLowerCase() === stream.user_name.toLowerCase()) : null;

                    if (existingMessage) {
                        await updateMessage(client, liveChannelId, existingMessage.messageId, { content: '', embeds: [embed] });
                    } else {
                        const newMessageId = await sendMessage(client, liveChannelId, '', embed);
                        guildConfig.messageIds.push({ stream: stream.user_name, messageId: newMessageId });
                    }

                    if (liveRoleId) {
                        const liveUser = twitchUsers.find(user => user.twitchUsername.toLowerCase() === stream.user_name.toLowerCase());
                        if (liveUser && liveUser.discordUserId) {
                            const guildId = await client.guilds.fetch(guild.id);

                            const member = await guildId.members.fetch(liveUser.discordUserId).catch(err => {
                                if (err.message.includes('Unknown Member')) {
                                    return null;
                                } else {
                                    Error(`Could not fetch member ${liveUser.discordUserId}: ${err.message}`);
                                    return null;
                                }
                            });

                            if (member && !member.roles.cache.has(liveRoleId)) {
                                await member.roles.add(liveRoleId);
                                const nicknamePrefix = '🔴 ';
                                if (!member.displayName.startsWith(nicknamePrefix)) {
                                    const originalNickname = member.displayName || member.user.username;
                                    await member.setNickname(`${nicknamePrefix}${originalNickname}`).catch(err => {
                                        Error(`Error setting nickname for ${member.id}: ${err.message}`);
                                    });
                                }
                            }
                        }
                    }
                }));
            } else {            
                if (guildConfig.messageIds && guildConfig.messageIds.length > 0) {
                    await Promise.all(guildConfig.messageIds.map(async msg => {
                        await deleteMessage(client, liveChannelId, msg.messageId).catch(err => {
                            if (!err.message.includes('Unknown Message') && !err.message.includes('Message not found')) {
                                Error(`Error deleting message ${msg.messageId}: ${err.message}`);
                            }
                        });
                    }));
                    guildConfig.messageIds = [];

                    // Remove roles and reset nicknames for all twitchUsers
                    for (const liveUser of twitchUsers) {
                        const { discordUserId } = liveUser;
                    
                        if (!discordUserId || typeof discordUserId !== 'string') {
                            continue;
                        }
                    
                        if (liveRoleId) {
                            try {
                                const member = await guild.members.fetch(discordUserId).catch(err => {
                                    if (err.message.includes('Unknown Member')) {
                                        Warn(`Discord member ${discordUserId} not found in guild ${guild.id}.`);
                                        return null;
                                    } else {
                                        Error(`Could not fetch member ${discordUserId}: ${err.message}`);
                                        return null;
                                    }
                                });

                                if (member) {
                                    // Remove Role if exists
                                    if (member.roles.cache.has(liveRoleId)) {
                                        await member.roles.remove(liveRoleId).catch(err => {
                                            Error(`Error removing role from ${member.id}: ${err.message}`);
                                        });
                                    }

                                    // Reset Nickname if prefixed
                                    const nicknamePrefix = /^🔴\s+/;
                                    if (nicknamePrefix.test(member.displayName)) {
                                        const originalNickname = member.displayName.replace(nicknamePrefix, '');
                                        await member.setNickname(originalNickname).catch(err => {
                                            Error(`Error resetting nickname for ${member.id}: ${err.message}`);
                                        });
                                    }
                                }
                            } catch (error) {
                                Error(`Unexpected error processing member ${discordUserId} in guild ${guild.id}: ${error.message}`);
                            }
                        }
                    }
                }
            }

            storeLiveConfig(guild.id, guildConfig);
        }

        return;
    } catch (error) {
        if (error.message.includes('Missing Permissions')) {
            Warn(`Encountered Missing Permissions.`);
            return;
        }

        Error(`Error in isLive function:\n${error.stack}`);
        throw error;
    }
};

async function sendMessage(client, channelId, content, embed) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
            const message = await channel.send({ content, embeds: [embed] });
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
        if (channel && channel.isTextBased()) {
            const fetchedMessage = await channel.messages.fetch(messageId);
            if (fetchedMessage) {
                await fetchedMessage.edit(messageContent);
            }
        } else {
            throw new Error('Channel not found or is not a text channel.');
        }
    } catch (error) {
        Error(`Error updating message ${messageId}:\n${error.message}`);
        throw error;
    }
}

async function deleteMessage(client, channelId, messageId) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
            const fetchedMessage = await channel.messages.fetch(messageId);
            if (fetchedMessage) {
                await fetchedMessage.delete();
            }
        } else {
            throw new Error('Channel not found or is not a text channel.');
        }
    } catch (error) {
        Error(`Error deleting message ${messageId}:\n${error.message}`);
        throw error;
    }
}

function storeLiveConfig(guildId, guildConfig) {
    try {
        const configFile = path.join(serversDataPath, `${guildId}.json`);
        fs.writeFileSync(configFile, JSON.stringify(guildConfig, null, 2));
    } catch (error) {
        Error(`Error storing live config for guild ${guildId}:\n${error.message}`);
        throw error;
    }
}