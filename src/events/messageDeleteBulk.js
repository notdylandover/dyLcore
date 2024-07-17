const { messageDeleteBulk, Error } = require('../../utils/logging');

module.exports = {
    name: 'messageDeleteBulk',
    execute(messages) {
        try {
            messageDeleteBulk(`${messages.size} messages bulk deleted`);
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};