const { Warn } = require('../../utils/logging');
const { sendEmail } = require('../../utils/sendEmail');

module.exports = {
    name: 'warn',
    execute(info) {
        Warn(info);
        sendEmail(module.exports.name, info);
    }
};
