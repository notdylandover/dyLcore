const { guildDelete } = require('../../utils/logging');

module.exports = {
    name: 'guildDelete',
    execute(guild) {
        guildDelete(`Left guild: ${guild.name} (${guild.id})`);
    }
};