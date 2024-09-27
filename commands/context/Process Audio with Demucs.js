const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, SuccessEmbed, FileEmbed } = require("../../utils/embeds");
const { CommandError, DebugNoDB, Error } = require("../../utils/logging");
const { exec } = require('child_process');

const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Process Audio with Demucs")
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.AttachFiles),
    async execute(interaction) {
        let filePath;
        let tempDir;

        await interaction.deferReply();

        const startTime = Date.now();

        try {
            const targetMessage = await interaction.channel.messages.fetch(interaction.targetId);
            const messageContent = targetMessage.content;

            const audioUrls = extractAudioUrls(messageContent).concat(
                targetMessage.attachments.filter(att => att.url.includes('.mp3')).map(att => att.url)
            );

            if (audioUrls.length !== 1) {
                const errorEmbed = ErrorEmbed('This command only works with one audio attachment.');
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            const audioUrl = audioUrls[0];

            const fileName = `temp-${interaction.id}.mp3`;
            tempDir = path.join(__dirname, '..', '..', 'temp');
            filePath = path.join(tempDir, fileName);

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const fileStream = fs.createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                https.get(audioUrl, (response) => {
                    response.pipe(fileStream);
                    fileStream.on('finish', resolve);
                    fileStream.on('error', reject);
                });
            });

            const modal = "mdx_extra_q";
            const demucsCommand = `demucs --two-stems=vocals -n ${modal} --mp3 ${filePath} -o ${tempDir}`;

            exec(demucsCommand, async (error, stdout, stderr) => {
                fs.unlink(filePath, (error) => {
                    if (error) {
                        Error(`Error deleting the temporary file: ${error.message}`);
                    }
                });

                if (error) {
                    Error(`Error processing the audio file with Demucs:\n${stderr || error.message}`);
                    const errorEmbed = ErrorEmbed('Error processing the audio file with Demucs.');
                    return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                }

                const separatedDir = path.join(tempDir, modal, path.basename(filePath, '.mp3'));
                const vocalPath = path.join(separatedDir, 'vocals.mp3');
                const accompanimentPath = path.join(separatedDir, 'no_vocals.mp3');

                if (!fs.existsSync(vocalPath) || !fs.existsSync(accompanimentPath)) {
                    const errorEmbed = ErrorEmbed('Failed to process the audio file.');
                    return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                }

                const stopTime = Date.now();
                const timeTook = (stopTime - startTime) / 1000;
                const fileEmbed = FileEmbed(timeTook.toFixed(2));

                await interaction.editReply({
                    embeds: [fileEmbed],
                    files: [
                        { attachment: vocalPath, name: 'vocals.mp3' },
                        { attachment: accompanimentPath, name: 'no_vocals.mp3' }
                    ]
                });

                fs.unlink(vocalPath, (error) => {
                    if (error) {
                        Error(`Error deleting the temporary vocal file: ${error.message}`);
                    }
                });
                fs.unlink(accompanimentPath, (error) => {
                    if (error) {
                        Error(`Error deleting the temporary accompaniment file: ${error.message}`);
                    }
                });
            });

        } catch (error) {
            CommandError(interaction.commandName, error.stack);
            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (filePath && fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) DebugNoDB(`Error deleting temp file during error handling: ${filePath}`);
                    else DebugNoDB(`Deleted temp file during error handling: ${filePath}`);
                });
            }
        }
    }
};

// Helper function to extract all MP3 URLs from the content
function extractAudioUrls(content) {
    const urlRegex = /(https?:\/\/[^\s]+\.mp3)/gi;
    return content.match(urlRegex) || [];
}