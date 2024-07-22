const { messageReactionRemove, Error } = require('../../utils/logging');
const { StarboardMessage } = require('../../utils/embeds');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'messageReactionRemove',
    async execute(reaction, user) {
        try {
            if (reaction.partial) {
                await reaction.fetch();
            }
            if (user.partial) {
                await user.fetch();
            }

            const username = user.username || 'Unknown user';
            const guildName = reaction.message.guild.name;
            const channelName = reaction.message.channel.name;
            const messageAuthor = reaction.message.author.username || 'Unknown user';
            const authorAvatar = reaction.message.author.displayAvatarURL();
            const messageContent = reaction.message.content.replace(/[\r\n]+/g, " ");
            const emojiName = reaction.emoji.name;
            const messageLink = reaction.message.url;

            if (emojiName === '⭐') {
                const serverId = reaction.message.guild.id;
                const settingsPath = path.join(__dirname, '..', '..', 'data', serverId, 'settings.json');
                const starboardMessagesPath = path.join(__dirname, '..', '..', 'data', serverId, 'starboard_messages.json');

                fs.mkdirSync(path.dirname(starboardMessagesPath), { recursive: true });

                let starboardMessages = [];
                if (fs.existsSync(starboardMessagesPath)) {
                    starboardMessages = JSON.parse(fs.readFileSync(starboardMessagesPath));
                }

                let settings = {};
                if (fs.existsSync(settingsPath)) {
                    settings = JSON.parse(fs.readFileSync(settingsPath));
                }

                const existingMessage = starboardMessages.find(m => m.id === reaction.message.id);

                if (existingMessage) {
                    if (reaction.count < settings.starboard_reactions_required) {
                        if (existingMessage.sent) {
                            const starboardChannel = reaction.message.guild.channels.cache.get(settings.starboard_channel_id);
                            if (starboardChannel) {
                                const starMessage = await starboardChannel.messages.fetch(existingMessage.starMessageId);
                                if (starMessage) {
                                    await starMessage.delete();
                                }
                            }
                        }

                        const messageIndex = starboardMessages.findIndex(m => m.id === reaction.message.id);
                        if (messageIndex !== -1) {
                            starboardMessages.splice(messageIndex, 1);
                        }
                    } else {
                        const starboardChannel = reaction.message.guild.channels.cache.get(settings.starboard_channel_id);
                        if (starboardChannel) {
                            const starMessage = await starboardChannel.messages.fetch(existingMessage.starMessageId);
                            if (starMessage) {
                                const embed = StarboardMessage(messageAuthor, authorAvatar, messageContent, reaction.count, messageLink, existingMessage.replies);
                                await starMessage.edit({ embeds: [embed] });
                            }
                        }
                    }

                    fs.writeFileSync(starboardMessagesPath, JSON.stringify(starboardMessages, null, 2));
                }
            }

            messageReactionRemove(`${guildName.cyan} - ${('#' + channelName).cyan} - ${username.cyan} - ${(`Removed their reaction to ${(messageAuthor + `'s`).cyan}`).red}` + (` message `).red + messageContent.cyan + `${(` that was ⭐`).red}`);
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};