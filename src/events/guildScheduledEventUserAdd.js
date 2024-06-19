const { guildScheduledEventUserAdd } = require('../../utils/logging');

module.exports = {
    name: 'guildScheduledEventUserAdd',
    execute(event, user) {
        guildScheduledEventUserAdd(`User ${user.username} (${user.id}) added to scheduled event: ${event}`);
    }
};