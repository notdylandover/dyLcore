const { channelUpdate } = require('../../utils/logging');

module.exports = {
    name: 'channelUpdate',
    execute(oldChannel, newChannel) {
        const changes = [];

        if (oldChannel.name !== newChannel.name) {
            changes.push(`#${oldChannel.name} => #${newChannel.name}`);
        }

        if (oldChannel.nsfw !== newChannel.nsfw) {
            changes.push(`is now ${newChannel.nsfw ? 'NSFW'.red : 'NFW'.green}`);
        }

        if (oldChannel.position !== newChannel.position) {
            changes.push(`#${oldChannel.name} is now in position ${newChannel.position}`);
        }

        if (changes.length > 0) {
            channelUpdate(`${(oldChannel.guild.name).cyan} - ${('#' + oldChannel.name).cyan} ${changes.join(', ')}`);
        }
    }
};