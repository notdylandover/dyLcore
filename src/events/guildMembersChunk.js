const { guildMembersChunk } = require('../../utils/logging');

module.exports = {
    name: 'guildMembersChunk',
    execute(members, guild) {
        guildMembersChunk(`Received ${guild.count} members in a chunk for guild: ${guild.name} (${guild.id})`);
    }
};