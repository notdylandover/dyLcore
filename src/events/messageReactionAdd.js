const { messageReactionAdd, Error } = require('../../utils/logging');
const { StarboardMessage } = require('../../utils/embeds');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'messageReactionAdd',
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
            const emojiName = reaction.emoji.name;
            const messageLink = reaction.message.url;
            
            let messageContent = reaction.message.content.replace(/[\r\n]+/g, " ");

            if (reaction.message.embeds.length > 0) {
                messageContent += ' EMBED '.bgYellow.black;
            }

            if (emojiName === '⭐') {
                const serverId = reaction.message.guild.id;
                const settingsPath = path.join(__dirname, '..', '..', 'data', serverId, 'settings.json');
                const starboardMessagesPath = path.join(__dirname, '..', '..', 'data', serverId, 'starboard_messages.json');

                fs.mkdirSync(path.dirname(starboardMessagesPath), { recursive: true });

                let starboardMessages = [];
                if (fs.existsSync(starboardMessagesPath)) {
                    starboardMessages = JSON.parse(fs.readFileSync(starboardMessagesPath));
                }

                let existingMessage = starboardMessages.find(m => m.id === reaction.message.id);
                if (!existingMessage) {
                    existingMessage = {
                        id: reaction.message.id,
                        content: reaction.message.content,
                        author: reaction.message.author.tag,
                        timestamp: reaction.message.createdTimestamp,
                        sent: false,
                        replies: await reaction.message.fetch(true).then(msg => msg.replies.size).catch(() => 0)
                    };
                    starboardMessages.push(existingMessage);
                    fs.writeFileSync(starboardMessagesPath, JSON.stringify(starboardMessages, null, 2));
                }

                let settings = {};
                if (fs.existsSync(settingsPath)) {
                    settings = JSON.parse(fs.readFileSync(settingsPath));
                }

                if (reaction.count >= settings.starboard_reactions_required && settings.starboard_channel_id) {
                    const starboardChannel = reaction.message.guild.channels.cache.get(settings.starboard_channel_id);

                    if (starboardChannel) {
                        const embed = StarboardMessage(messageAuthor, authorAvatar, messageContent, reaction.count, messageLink, existingMessage.replies);

                        if (!existingMessage.sent) {
                            const starMessage = await starboardChannel.send({ embeds: [embed] });
                            existingMessage.sent = true;
                            existingMessage.starMessageId = starMessage.id;
                        } else {
                            const starMessage = await starboardChannel.messages.fetch(existingMessage.starMessageId);
                            if (starMessage) {
                                await starMessage.edit({ embeds: [embed] });
                            }
                        }
                        
                        fs.writeFileSync(starboardMessagesPath, JSON.stringify(starboardMessages, null, 2));
                    }
                }
            }

            messageReactionAdd(`${guildName.cyan} - ${('#' + channelName).cyan} - ${username.cyan} - ${(`Reacted to ${(messageAuthor + `'s`).cyan}`).green}` + (` message `).green + messageContent.cyan + (` with `).green + emojiName.cyan);
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};
