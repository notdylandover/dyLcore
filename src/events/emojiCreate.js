const { emojiCreate } = require('../../utils/logging');

module.exports = {
    name: 'emojiCreate',
    execute(emoji) {
        let animated;

        if (emoji.animated) {
            animated = 'Animated Emoji';
        } else {
            animated = 'Static Emoji';
        }
        
        emojiCreate(`${emoji.guild} - ${emoji.author} - ${emoji.name} Created (${animated})`);
    }
};