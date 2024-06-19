const { applicationCommandPermissionsUpdate } = require('../../utils/logging');

module.exports = {
    name: 'applicationCommandPermissionsUpdate',
    execute(data) {
        const applicationId = data.applicationId;
        const guildId = data.guildId;
        const id = data.id;
        const permissions = data.permissions;

        applicationCommandPermissionsUpdate(`${guildId} - ${applicationId} - ${id} -  ${permissions}`);
    }
};