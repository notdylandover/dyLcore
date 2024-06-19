const { threadMemberUpdate } = require('../../utils/logging');

module.exports = {
    name: 'threadMemberUpdate',
    execute(oldMember, newMember) {
        threadMemberUpdate(`Thread member updated: ${oldMember.displayName} => ${newMember.displayName}`);
    }
};