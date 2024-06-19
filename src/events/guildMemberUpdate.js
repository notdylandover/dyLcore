const { guildMemberUpdate } = require('../../utils/logging');

module.exports = {
    name: 'guildMemberUpdate',
    execute(oldMember, newMember) {
        guildMemberUpdate(`Member ${newMember.user.username} (${newMember.id}) updated`);
    }
};