const { EmbedTest } = require("../../utils/embeds");
const { Error } = require("../../utils/logging");

const fetch = require('node-fetch');

module.exports = {
    name: 'embed',
    async execute(message) {
        try {
            const quoteResponse = await fetch('https://inspirobot.me/api?generate=true');
            if (!quoteResponse.ok) throw new Error('Failed to fetch quote');

            const quoteImageUrl = await quoteResponse.text();

            const embed = EmbedTest(quoteImageUrl);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }});
            return await message.react('✅');
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
            return message.react('❌');
        }
    }
};