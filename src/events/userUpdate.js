const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { userUpdate } = require('../../utils/logging');

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

        // Update avatar
        if (oldUser.avatar !== newUser.avatar) {
            changes.push(`${username} updated their avatar`);
            const avatarUrl = newUser.displayAvatarURL({ format: 'png', size: 1024 });
            const avatarPath = path.join(mediaDir, 'avatar.png');
            await downloadFile(avatarUrl, avatarPath);
        }

        // Update banner
        if (oldUser.banner !== newUser.banner) {
            changes.push(`${username} updated their banner`);
            const bannerUrl = newUser.bannerURL({ format: 'png', size: 1024 });
            const bannerPath = path.join(mediaDir, 'banner.png');
            await downloadFile(bannerUrl, bannerPath);
        }

        // Track other changes
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

// Helper function to download files
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