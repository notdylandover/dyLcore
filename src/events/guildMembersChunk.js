const { guildMembersChunk } = require('../../utils/logging');

module.exports = {
    name: 'guildMembersChunk',
    execute(members, guild) {
        guildMembersChunk(`Received ${members.length} members in a chunk for guild: ${guild.name} (${guild.id})`);
    }
};