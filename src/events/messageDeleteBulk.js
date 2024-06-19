const { messageDeleteBulk } = require('../../utils/logging');

module.exports = {
    name: 'messageDeleteBulk',
    execute(messages) {
        messageDeleteBulk(`${messages.size} messages bulk deleted`);
    }
};