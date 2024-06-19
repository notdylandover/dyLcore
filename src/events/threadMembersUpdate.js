const { threadMembersUpdate } = require('../../utils/logging');

module.exports = {
    name: 'threadMembersUpdate',
    execute(thread, oldMembers, newMembers) {
        threadMembersUpdate(`Thread members updated for ${thread.name}`);
    }
};