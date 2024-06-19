const { guildMemberRemove } = require('../../utils/logging');

module.exports = {
    name: 'guildMemberRemove',
    execute(member) {
        guildMemberRemove(`Member left: ${member.user.username} (${member.id})`);
    }
};