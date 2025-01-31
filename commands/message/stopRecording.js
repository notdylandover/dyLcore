const { stopRecording } = require('../../utils/recording');
const { DoneEmbed } = require('../../utils/embeds');

module.exports = {
    name: 'stoprecord',
    enabled: true,
    private: true,
    async execute(message) {
        await stopRecording(message.guild);

        const embed = DoneEmbed('Stopped recording and left the voice channel.');
        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};