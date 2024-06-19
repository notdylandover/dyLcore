const { messageReactionRemoveAll } = require('../../utils/logging');

module.exports = {
    name: 'messageReactionRemoveAll',
    execute(message) {
        messageReactionRemoveAll(`All reactions removed from message: ${message.content}`);
    }
};