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
            const emojiName = reaction.emoji.name;
            
            let messageContent = reaction.message.content.replace(/[\r\n]+/g, " ");

            if (reaction.message.embeds.length > 0) {
                messageContent += ' EMBED '.bgYellow.black;
            }

            messageReactionAdd(`${guildName.cyan} - ${('#' + channelName).cyan} - ${username.cyan} - ${(`Reacted to ${(messageAuthor + `'s`).cyan}`).green}` + (` message `).green + messageContent.cyan + (` with `).green + emojiName.cyan);
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};
