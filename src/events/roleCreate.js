const { roleCreate } = require('../../utils/logging');

module.exports = {
    name: 'roleCreate',
    execute(role) {
        roleCreate(`Role created: ${role.name}`);
    }
};