const { inviteCreate } = require('../../utils/logging');

module.exports = {
    name: 'inviteCreate',
    execute(invite) {
        inviteCreate(`Invite created: ${invite.url}`);
    }
};