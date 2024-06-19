const { guildMemberAvailable } = require('../../utils/logging');

module.exports = {
    name: 'guildMemberAvailable',
    execute(member) {
        guildMemberAvailable(`Member became available: ${member.user.username} (${member.id})`);
    }
};