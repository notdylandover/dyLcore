const { guildScheduledEventUserRemove } = require('../../utils/logging');

module.exports = {
    name: 'guildScheduledEventUserRemove',
    execute(event, user) {
        guildScheduledEventUserRemove(`User ${user.username} (${user.id}) removed from scheduled event: ${event}`);
    }
};