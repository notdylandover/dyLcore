const { guildScheduledEventDelete } = require('../../utils/logging');

module.exports = {
    name: 'guildScheduledEventDelete',
    execute(event) {
        guildScheduledEventDelete(`Scheduled event deleted: ${event}`);
    }
};