const { roleDelete } = require('../../utils/logging');

module.exports = {
    name: 'roleDelete',
    execute(role) {
        roleDelete(`Role deleted: ${role.name}`);
    }
};