const { channelPinsUpdate } = require('../../utils/logging');

module.exports = {
    name: 'channelPinsUpdate',
    execute(channel, date) {
        channelPinsUpdate(`${channel.guild} - #${channel.name} - Pinned Message`);
    }
};