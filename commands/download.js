const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed, FileEmbed } = require("../utils/embeds");
const { Error, CommandError } = require("../utils/logging");
const { METADATA } = require('../utils/metadata');
const { spawn } = require('child_process');

// Doesn't work right now

const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE_MB = 25;
const MAX_DURATION_SECONDS = 600;

const command = new SlashCommandBuilder()
    .setName("download")
    .setDescription(METADATA.download.description)
    .addStringOption(option => option
        .setName("link")
        .setDescription("The link to download")
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName("format")
        .setDescription("The format to download as")
        .setRequired(true)
        .addChoices(
            { name: "MP3", value: "mp3" },
            { name: "MP4", value: "mp4" }
        )
    )
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        const startTime = Date.now();

        const cleanUp = (paths) => {
            paths.forEach((filePath) => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        };

        const downloadStream = async (url, options, outputPath) => {
            return new Promise((resolve, reject) => {
                const fileStream = fs.createWriteStream(outputPath, { flags: 'w' });
                const stream = ytdl(url, options);

                stream.pipe(fileStream);

                stream.on('end', () => {
                    resolve();
                });
                stream.on('error', (err) => {
                    Error(`Download error for ${outputPath}:`, err);
                    reject(err);
                });
            });
        };

        try {
            const link = interaction.options.getString('link');
            const format = interaction.options.getString('format');

            const info = await ytdl.getInfo(link);
            const duration = info.videoDetails.lengthSeconds;
            const isLive = info.videoDetails.isLiveContent;

            if (isLive) {
                const errorEmbed = ErrorEmbed('Error downloading link', 'YouTube live videos cannot be downloaded.');
                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            if (duration > MAX_DURATION_SECONDS) {
                const errorEmbed = ErrorEmbed('Error downloading link', `Video is too long. Maximum duration is ${MAX_DURATION_SECONDS / 60} minutes.`);
                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            const title = info.videoDetails.title.replace(/[\/\\?%*:|"<>]/g, '-').replace(/[\s\W]/g, '');
            const tempDir = path.join(__dirname, '../temp');
            const videoPath = path.join(tempDir, `${title}.video`);
            const audioPath = path.join(tempDir, `${title}.audio`);
            const outputPath = path.join(tempDir, `${title}.${format}`);
            const mp3Path = path.join(tempDir, `${title}.mp3`);

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            await downloadStream(link, { filter: 'audioonly' }, audioPath);
            await downloadStream(link, { filter: 'videoonly' }, videoPath);

            const ffmpegArgs = format === 'mp3'
                ? ['-y', '-i', audioPath, '-q:a', '0', mp3Path]
                : ['-y', '-i', videoPath, '-i', audioPath, '-c', 'copy', outputPath];

            const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

            ffmpegProcess.on('close', async (code) => {
                if (code !== 0) {
                    Error(`FFmpeg process exited with code ${code}`);

                    const errorEmbed = ErrorEmbed('Error', `FFmpeg process exited with code ${code}`);
                    await interaction.editReply({ embeds: [errorEmbed] });

                    cleanUp([videoPath, audioPath, outputPath, mp3Path]);
                } else {
                    const filePath = format === 'mp3' ? mp3Path : outputPath;
                    const fileSize = fs.statSync(filePath).size / (1024 * 1024);

                    if (fileSize > MAX_FILE_SIZE_MB) {
                        const errorEmbed = ErrorEmbed('Error', `File size is too large. Maximum file size is ${MAX_FILE_SIZE_MB} MB.`);
                        await interaction.editReply({ embeds: [errorEmbed] });

                        cleanUp([videoPath, audioPath, outputPath, mp3Path]);
                    } else {
                        if (fs.existsSync(filePath)) {
                            const stopTime = new Date();
                            const timeTook = (stopTime - startTime) / 1000;

                            const fileEmbed = FileEmbed(fileSize.toFixed(2), timeTook.toFixed(2));
                            await interaction.editReply({ embeds: [fileEmbed], files: [filePath] });

                            cleanUp([videoPath, audioPath, outputPath, mp3Path]);

                            return;
                        } else {
                            const errorEmbed = ErrorEmbed('Error', 'File not found.');
                            await interaction.editReply({ embeds: [errorEmbed] });
                        }
                    }
                }
            });

            ffmpegProcess.on('error', async (error) => {
                Error(`FFmpeg error: ${error.message}`);
                const errorEmbed = ErrorEmbed('Error', `FFmpeg error: ${error.message}`);
                await interaction.editReply({ embeds: [errorEmbed] });
                cleanUp([videoPath, audioPath, outputPath, mp3Path]);
            });

        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.stack);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};