const { startRecording } = require('../../utils/recording');
const { DoneEmbed } = require('../../utils/embeds');

module.exports = {
    name: 'startrecord',
    enabled: true,
    private: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply({ content: 'You need to be in a voice channel to start recording.', allowedMentions: { repliedUser: false } });
        }

        await startRecording(message.guild, voiceChannel);

        const embed = DoneEmbed('Started recording voice chat.');
        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};