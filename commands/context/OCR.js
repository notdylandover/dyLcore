const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { analyzeOCR } = require('../../utils/analyzeImage');
const { ErrorEmbed, OCR } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const path = require('path');
const fs = require('fs');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('OCR')
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const { default: fetch } = await import('node-fetch');
            
            const message = await interaction.client.channels.cache.get(interaction.channelId).messages.fetch(interaction.targetId);
            const attachment = message.attachments.first();

            if (!attachment) {
                const errorEmbed = ErrorEmbed('No image attachment found in the selected message.');
                return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            const fileExtension = path.extname(attachment.name).toLowerCase();
            const validImageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];

            if (!validImageExtensions.includes(fileExtension)) {
                const errorEmbed = ErrorEmbed(`Unsupported file format.\nSupported formats: ${validImageExtensions.join(', ')}.`);
                return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            const filePath = path.join(__dirname, `../../temp/${attachment.id}${fileExtension}`);
            const fileStream = fs.createWriteStream(filePath);

            const response = await fetch(attachment.url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(filePath, buffer);

            const ocrText = await analyzeOCR(filePath);

            fs.unlinkSync(filePath);

            const ocrEmbed = OCR(ocrText, attachment.url);
            return interaction.editReply({ embeds: [ocrEmbed] });

        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);
            return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
