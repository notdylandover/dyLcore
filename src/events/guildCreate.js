const { guildCreate } = require('../../utils/logging');

module.exports = {
    name: 'guildCreate',
    execute(guild) {
        guildCreate(`Joined guild: ${guild.name} (${guild.id})`);
    }
};