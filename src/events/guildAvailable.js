const { guildAvailable } = require('../../utils/logging');

module.exports = {
    name: 'guildAvailable',
    execute(guild) {
        guildAvailable(`✓ ${guild.name} - ${guild.id}`);
    }
};