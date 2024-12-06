const { guildAvailable } = require('../../utils/logging');
const colors = require('colors');

module.exports = {
    name: 'guildAvailable',
    execute(guild) {
        const guildId = `\x1b[3m${guild.id}\x1b[23m`;
        const guildName = guild.name;
        const guildMembers = guild.memberCount;
        guildAvailable(`${guildId} - ${guildName} - ${guildMembers} Members`);
    },
};