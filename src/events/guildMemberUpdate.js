const { guildMemberUpdate } = require('../../utils/logging');

module.exports = {
    name: 'guildMemberUpdate',
    execute(oldMember, newMember) {
        const changes = [];

        if (oldMember.avatar !== newMember.avatar) {
            changes.push(`${newMember.user.username} updated their avatar`);
        }

        if (oldMember.banner !== newMember.banner) {
            changes.push(`${newMember.user.username} updated their banner`);
        }

        if (oldMember.displayName !== newMember.displayName) {
            changes.push(`${newMember.user.username} changed their display name: ${oldMember.displayName} → ${newMember.displayName}`);
        
        }

        if (oldMember.globalName !== newMember.globalName) {
            changes.push(`${newMember.user.username} changed their global name: ${oldMember.globalName} → ${newMember.globalName}`);
        }

        if (oldMember.username !== newMember.username) {
            changes.push(`${newMember.user.username} changed their username: ${oldMember.username} → ${newMember.username}`);
        }

        if (changes.length > 0) {
            guildMemberUpdate(`${(changes.join(', ')).green}`);
        }
    }
};