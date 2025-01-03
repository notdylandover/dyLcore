const { userUpdate } = require('../../utils/logging');

const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: 'userUpdate',
    execute: async (oldUser, newUser) => {
        const changes = [];
        const username = newUser.username;
        const userDir = path.join(__dirname, '../../data/users', username);
        const mediaDir = path.join(userDir, 'media');

        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir);
        }

        if (oldUser.avatar !== newUser.avatar) {
            changes.push(`${username} updated their avatar`);
            const avatarUrl = newUser.displayAvatarURL({ format: 'png', size: 4096 });
            const avatarPath = path.join(mediaDir, 'avatar.png');
            await downloadFile(avatarUrl, avatarPath);
        }

        if (oldUser.banner !== newUser.banner) {
            changes.push(`${username} updated their banner`);
            const bannerUrl = newUser.bannerURL({ format: 'png', size: 4096 });
            const bannerPath = path.join(mediaDir, 'banner.png');
            await downloadFile(bannerUrl, bannerPath);
        }

        if (oldUser.displayName !== newUser.displayName) {
            changes.push(`${username} changed their display name: ${oldUser.displayName} → ${newUser.displayName}`);
        }

        if (oldUser.globalName !== newUser.globalName) {
            changes.push(`${username} changed their global name: ${oldUser.globalName} → ${newUser.globalName}`);
        }

        if (oldUser.username !== newUser.username) {
            changes.push(`${username} changed their username: ${oldUser.username} → ${newUser.username}`);
        }

        if (changes.length > 0) {
            userUpdate(`${(changes.join(', ')).green}`);
        }
    }
};

const downloadFile = async (url, outputPath) => {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};