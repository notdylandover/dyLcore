const { emojiUpdate } = require('../../utils/logging');

module.exports = {
    name: 'emojiUpdate',
    execute(oldEmoji, newEmoji) {
        const changes = [];

        if (oldEmoji.name !== newEmoji.name) {
            changes.push(`Emoji name updated: ${oldEmoji.name} => ${newEmoji.name}`);
        }

        if (changes.length > 0) {
            emojiUpdate(`Emoji ${newEmoji.name} (${newEmoji.id}) updated: ${changes.join(', ')}`);
        }
    }
};