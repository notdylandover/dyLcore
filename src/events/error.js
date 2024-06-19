const { Error } = require('../../utils/logging');

module.exports = {
    name: 'error',
    execute(error) {
        Error(error);
    }
};