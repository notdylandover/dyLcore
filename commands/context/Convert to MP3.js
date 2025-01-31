const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require('discord.js');
const { MediaEmbed, ErrorEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");
const { exec } = require('child_process');

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const util = require('util');

const tempDir = path.join(__dirname, '..', '..', 'temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const execPromise = util.promisify(exec);

module.exports = {
    premium: false,
    enabled: true,
    data: new ContextMenuCommandBuilder()
        .setName("Convert to MP3")
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const message = await interaction.channel.messages.fetch(interaction.targetId);
            const attachments = message.attachments.filter(attachment => 
                attachment.contentType && attachment.contentType.startsWith('video/')
            );

            if (attachments.size === 0) {
                const errorEmbed = ErrorEmbed('No video attachments found to convert.');
                return await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            const attachment = attachments.first();
            const videoPath = path.join(tempDir, `${message.id}.mp4`);
            const mp3Path = path.join(tempDir, `${message.id}.mp3`);

            const response = await fetch(attachment.url);
            const buffer = await response.buffer();
            fs.writeFileSync(videoPath, buffer);

            await execPromise(`ffmpeg -i "${videoPath}" -q:a 0 -map a "${mp3Path}"`);

            if (fs.existsSync(mp3Path)) {
                await interaction.followUp({ files: [mp3Path] });
            } else {
                const errorEmbed = ErrorEmbed('MP3 file was not created successfully.');
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            fs.unlinkSync(videoPath);
            fs.unlinkSync(mp3Path);

        } catch (error) {
            CommandError(interaction.commandName, error.stack);
            const errorEmbed = ErrorEmbed(error.message);
            await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }
    }
};