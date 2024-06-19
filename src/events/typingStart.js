const { Error, typingStart } = require('../../utils/logging');

module.exports = {
    name: 'typingStart',
    async execute(typing) {
        if (typing.guild) {
            const guildName = typing.guild.name;
            const channelName = typing.channel.name;
            const userTag = typing.user.tag;
            const message = 'Typing...';

            typingStart(`${guildName.cyan} - ${'#'.cyan + channelName.cyan} - ${userTag.cyan} - ${message.grey}`);
        } else {
            const userTag = typing.user.tag;
            const channelName = 'DM';
            const message = 'Typing...';

            typingStart(`${channelName.cyan} - ${userTag.cyan} - ${message.grey}`);
        }
    }
};