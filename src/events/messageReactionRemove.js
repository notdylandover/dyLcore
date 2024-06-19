const { messageReactionRemove } = require('../../utils/logging');

module.exports = {
    name: 'messageReactionRemove',
    async execute(reaction, user) {
        const username = user.username || 'Unknown user';

        const guildName = reaction.message.guild.name;
        const channelName = reaction.message.channel.name;

        const messageAuthor = reaction.message.author.username || 'Unknown user';
        const messageContent = reaction.message.content;

        const emojiName = reaction.emoji.name;
        const emojiId = reaction.emoji.id;
        const emoji = `<:${emojiName}:${emojiId}>`;

        messageReactionRemove(`${guildName.cyan} - ${('#' + channelName).cyan} - ${username.cyan} - ${(`Removed their reaction to ${(messageAuthor + `'s`).cyan}`).red}` + (` message `).red + messageContent.cyan + `${(` that was ` + emoji.cyan).red}`);
    }
};