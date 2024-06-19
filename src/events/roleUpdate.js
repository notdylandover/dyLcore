const { roleUpdate } = require('../../utils/logging');

module.exports = {
    name: 'roleUpdate',
    execute(oldRole, newRole) {
        roleUpdate(`Role updated: ${oldRole.name} => ${newRole.name}`);
    }
};