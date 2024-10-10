const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = async function getBotInfo(client) {
    const botUser = await client.user.fetch();
    const username = botUser.username;
    const userDir = path.join(__dirname, '..', 'data', 'users', username);
    const mediaDir = path.join(userDir, 'media');

    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }
    
    if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
    }

    if (botUser.avatar) {
        const avatarUrl = botUser.displayAvatarURL({ format: 'png', size: 1024 });
        const avatarResponse = await axios({
            url: avatarUrl,
            method: 'GET',
            responseType: 'stream'
        });
        const avatarPath = path.join(mediaDir, 'avatar.png');
        const writer = fs.createWriteStream(avatarPath);

        avatarResponse.data.pipe(writer);
    }

    if (botUser.banner) {
        const bannerUrl = botUser.bannerURL({ format: 'png', size: 1024 });
        const bannerResponse = await axios({
            url: bannerUrl,
            method: 'GET',
            responseType: 'stream'
        });
        const bannerPath = path.join(mediaDir, 'banner.png');
        const writer = fs.createWriteStream(bannerPath);

        bannerResponse.data.pipe(writer);
    }
};