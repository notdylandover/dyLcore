const { guildAvailable } = require('../../utils/logging');

module.exports = {
    name: 'guildAvailable',
    execute(guild) {
        guildAvailable(`\u2713\t${guild.name} - ${guild.id}`);
    }
};