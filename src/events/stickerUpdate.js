const { stickerUpdate } = require('../../utils/logging');

module.exports = {
    name: 'stickerUpdate',
    execute(oldSticker, newSticker) {
        stickerUpdate(`Sticker updated: ${oldSticker.name} => ${newSticker.name}`);
    }
};