const { joinVoiceChannel, getVoiceConnection, VoiceReceiver, EndBehaviorType } = require('@discordjs/voice');
const prism = require('prism-media');
const fs = require('fs');
const path = require('path');

module.exports.startRecording = async function (guild, channel) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        const receiver = connection.receiver;

        receiver.speaking.on('start', userId => {
            const user = guild.members.cache.get(userId);
            if (!user) return;

            const opusStream = receiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 5000,
                },
            });

            const pcmStream = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });

            const outputPath = path.join(__dirname, '..', 'recordings', `${userId}-${Date.now()}.pcm`);
            const writeStream = fs.createWriteStream(outputPath);

            opusStream.pipe(pcmStream).pipe(writeStream);

            opusStream.on('end', () => {
                console.log(`Recording for user ${userId} has ended.`);
            });
        });

        console.log(`Joined voice channel: ${channel.name} and started recording.`);
    } catch (error) {
        console.error(`Error joining voice channel: ${error.message}`);
    }
};

module.exports.stopRecording = function (guild) {
    const connection = getVoiceConnection(guild.id);
    if (connection) {
        connection.destroy();
        console.log(`Disconnected from guild: ${guild.name}`);
    } else {
        console.log(`No active voice connection found for guild: ${guild.name}`);
    }
};