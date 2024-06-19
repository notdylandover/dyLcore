const { messageReactionRemoveEmoji } = require('../../utils/logging');

module.exports = {
    name: 'messageReactionRemoveEmoji',
    execute(reaction) {
        messageReactionRemoveEmoji(`All reactions removed for emoji: ${reaction.emoji.name}`);
    }
};