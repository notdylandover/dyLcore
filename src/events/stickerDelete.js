const { stickerDelete } = require('../../utils/logging');

module.exports = {
    name: 'stickerDelete',
    execute(sticker) {
        stickerDelete(`Sticker deleted: ${sticker.name}`);
    }
};