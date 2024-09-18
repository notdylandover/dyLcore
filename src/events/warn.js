const { Warn } = require('../../utils/logging');

module.exports = {
    name: 'warn',
    execute(info) {
        Warn(info);
    }
};
