const { stickerCreate } = require('../../utils/logging');

module.exports = {
    name: 'stickerCreate',
    execute(sticker) {
        stickerCreate(`Sticker created: ${sticker.name}`);
    }
};