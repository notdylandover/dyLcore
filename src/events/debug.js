const { debug } = require('../../utils/logging');

module.exports = {
    name: 'debug',
    execute(info) {
        debug(info);
    }
};