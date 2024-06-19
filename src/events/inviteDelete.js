const { inviteDelete } = require('../../utils/logging');

module.exports = {
    name: 'inviteDelete',
    execute(invite) {
        inviteDelete(`Invite deleted: ${invite.url}`);
    }
};