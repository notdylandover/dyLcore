const { DoneEmbed } = require('../../utils/embeds');

require('dotenv').config();

module.exports = {
    name: 'rl',
    async execute(message) {
        const embed = DoneEmbed(`Reloaded Manager`);
        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }});
        message.client.destroy();
        return process.exit(0);
    }
};