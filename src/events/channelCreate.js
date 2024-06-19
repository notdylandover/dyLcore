const { channelCreate } = require('../../utils/logging');

module.exports = {
    name: 'channelCreate',
    execute(channel) {
        const guildName = channel.guild.name;
        const channelName = channel.name;
        
        channelCreate(`${guildName.cyan} - ${('#' + channelName).cyan} Created`);
    }
};