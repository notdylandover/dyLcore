const { messageReactionAdd } = require('../../utils/logging');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        const username = user.username || 'Unknown user';

        const guildName = reaction.message.guild.name;
        const channelName = reaction.message.channel.name;

        const messageAuthor = reaction.message.author.username || 'Unknown user';
        const messageContent = reaction.message.content;

        const emojiName = reaction.emoji.name;
        const emojiId = reaction.emoji.id;
        const emoji = `<:${emojiName}:${emojiId}>`;

        messageReactionAdd(`${guildName.cyan} - ${('#' + channelName).cyan} - ${username.cyan} - ${(`Reacted to ${(messageAuthor + `'s`).cyan}`).green}` + (` message `).green + messageContent.cyan + `${(` with ` + emoji.cyan).green}`);
    }
};