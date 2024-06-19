const { guildScheduledEventCreate } = require('../../utils/logging');

module.exports = {
    name: 'guildScheduledEventCreate',
    execute(event) {
        guildScheduledEventCreate(`Scheduled event created: ${event}`);
    }
};