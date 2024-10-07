const { CommandError } = require('../../utils/logging');

module.exports = {
    name: 'me',
    async execute(message) {
        try {
            const botMessage = message.content.split(' ').slice(1).join(' ');

            if (!botMessage) {
                const warnEmbed = WarnEmbed('Please provide a message to send as the bot.');
                return message.reply({ embeds: [warnEmbed], allowedMentions: { repliedUser: false }});
            }
            
            message.delete();
            await message.channel.send(botMessage);
        } catch (error) {
            CommandError('react', error.stack);
            return await message.react('❌');
        }
    }
};