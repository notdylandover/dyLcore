const { guildUnavailable } = require('../../utils/logging');

module.exports = {
    name: 'guildUnavailable',
    execute(guild) {
        guildUnavailable(`\u2716\t${guild.name} - ${guild.id}`);
    }
};