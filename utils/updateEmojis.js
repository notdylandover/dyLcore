const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Debug, Error, Done } = require('./logging');
require('dotenv').config();

const applicationId = process.env.APPID;
const botToken = process.env.TOKEN;

const emojiDirectory = path.join(__dirname, '..', 'data', 'bot', 'emojis');
const localFiles = fs.readdirSync(emojiDirectory).map(file => ({
    name: path.basename(file, path.extname(file)),
    data: fs.readFileSync(path.join(emojiDirectory, file))
}));

async function getCurrentEmoji() {
    try {
        const response = await axios.get(`https://discord.com/api/v10/applications/${applicationId}/emojis`, {
            headers: {
                Authorization: `Bot ${botToken}`
            }
        });
        return response.data.items;
    } catch (error) {
        if (error.response) {
            Error('Error response:', error.response.data);
            Error('Status code:', error.response.status);
        } else if (error.request) {
            Error('No response received:', error.request);
        } else {
            Error('Error:', error.message);
        }
        throw error;
    }
}

async function deleteEmoji(emojiId) {
    try {
        await axios.delete(`https://discord.com/api/v10/applications/${applicationId}/emojis/${emojiId}`, {
            headers: {
                Authorization: `Bot ${botToken}`
            }
        });
        Debug(`Deleted emoji with ID: ${emojiId}`);
    } catch (error) {
        Error(`Error deleting emoji with ID ${emojiId}:`, error.message);
    }
}

async function deleteAllEmojis() {
    try {
        const currentEmoji = await getCurrentEmoji();

        if (Array.isArray(currentEmoji)) {
            for (const emoji of currentEmoji) {
                await deleteEmoji(emoji.id);
            }
            Done('All emojis deleted.');
        } else {
            Error('Unexpected response format. Expected an array of emojis.');
        }
    } catch (error) {
        Error('Error deleting all emojis:', error);
    }
}

async function uploadEmoji(file) {
    try {
        const response = await axios.post(`https://discord.com/api/v10/applications/${applicationId}/emojis`, {
            name: file.name,
            image: `data:image/png;base64,${file.data.toString('base64')}`
        }, {
            headers: {
                Authorization: `Bot ${botToken}`
            }
        });
        Debug(`Uploaded emoji ${file.name}`);
        return response.data;
    } catch (error) {
        Error(`Error uploading emoji ${file.name}:`, error.message);
    }
}

async function updateEmojisInConstants(emojis) {
    const constantsPath = path.join(__dirname, 'constants.js');

    let constantsContent = fs.readFileSync(constantsPath, 'utf8');

    const emojiString = `module.exports.EMOJIS = Object.freeze(${JSON.stringify(emojis, null, 4)});`;

    const updatedContent = constantsContent.replace(
        /module\.exports\.EMOJIS\s*=\s*Object\.freeze\(\{[\s\S]*?\}\);/,
        emojiString
    );

    fs.writeFileSync(constantsPath, updatedContent.trim());
    Done('Emojis markdown updated in constants.js.');
}

module.exports.updateEmojis = async function () {
    const emojis = {};

    try {
        await deleteAllEmojis();

        for (const file of localFiles) {
            const emojiData = await uploadEmoji(file);
            if (emojiData && emojiData.id) {
                const emojiMarkdown = `<:${emojiData.name}:${emojiData.id}>`;
                emojis[emojiData.name] = emojiMarkdown;
            }
        }

        Done('All emojis uploaded.');
        await updateEmojisInConstants(emojis);
    } catch (error) {
        Error('Error uploading emojis:', error);
    }
}