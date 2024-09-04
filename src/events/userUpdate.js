const { userUpdate } = require('../../utils/logging');

module.exports = {
    name: 'userUpdate',
    execute(oldUser, newUser) {
        const changes = [];

        if (oldUser.avatar !== newUser.avatar) {
            changes.push(`${newUser.username} updated their avatar`);
        }

        if (oldUser.banner !== newUser.banner) {
            changes.push(`${newUser.username} updated their banner`);
        }

        if (oldUser.displayName !== newUser.displayName) {
            changes.push(`${newUser.username} changed their display name: ${oldUser.displayName} → ${newUser.displayName}`);
        }

        if (oldUser.globalName !== newUser.globalName) {
            changes.push(`${newUser.username} changed their global name: ${oldUser.globalName} → ${newUser.globalName}`);
        }

        if (oldUser.username !== newUser.username) {
            changes.push(`${newUser.username} changed their username: ${oldUser.username} → ${newUser.username}`);
        }

        if (changes.length > 0) {
            userUpdate(`${(changes.join(', ')).green}`);
        }
    }
};