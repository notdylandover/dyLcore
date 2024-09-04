const { CommandError } = require('../../utils/logging');

module.exports = {
    name: 'me',
    async execute(message) {
        try {
            const botMessage = message.content.split(' ').slice(1).join(' ');

            if (!botMessage) {
                return message.reply('Please provide a message to send as the bot.');
            }
            
            message.delete();
            await message.channel.send(botMessage);
        } catch (error) {
            CommandError('react', error.stack);
            return await message.react('❌');
        }
    }
};