const { Error } = require('../../utils/logging');
const { sendEmail } = require('../../utils/sendEmail');

module.exports = {
    name: 'error',
    execute(error) {
        Error(error);
        sendEmail(module.exports.name, error);
    }
};