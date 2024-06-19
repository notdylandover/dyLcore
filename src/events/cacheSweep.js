const { cacheSweep } = require('../../utils/logging');

module.exports = {
    name: 'cacheSweep',
    execute(message) {
        cacheSweep(message);
    }
};