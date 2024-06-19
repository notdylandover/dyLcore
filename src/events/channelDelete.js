const { channelDelete } = require('../../utils/logging');

module.exports = {
    name: 'channelDelete',
    execute(channel) {
        const guildName = channel.guild.name;
        const channelName = channel.name;

        channelDelete(`${guildName.cyan} - ${('#' + channelName).cyan} Deleted`);
    }
};