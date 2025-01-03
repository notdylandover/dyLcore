const { CommandError } = require('../../utils/logging');
const { WarnEmbed } = require('../../utils/embeds');

module.exports = {
    name: 'me',
    enabled: true,
    private: true,
    async execute(message) {
        try {
            const botMessage = message.content.split(' ').slice(1).join(' ');

            if (!botMessage) {
                const warnEmbed = WarnEmbed('A message wasn\'t detected.');
                return message.reply({ embeds: [warnEmbed], allowedMentions: { repliedUser: false }});
            }
            
            message.delete();
            await message.channel.send(botMessage);
        } catch (error) {
            CommandError(module.exports.name, error.stack);
            return await message.react('❌');
        }
    }
};