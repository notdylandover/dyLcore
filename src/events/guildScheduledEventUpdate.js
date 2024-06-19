const { guildScheduledEventUpdate } = require('../../utils/logging');

module.exports = {
    name: 'guildScheduledEventUpdate',
    execute(oldEvent, newEvent) {
        guildScheduledEventUpdate(`Scheduled event updated: ${newEvent}`);
    }
};