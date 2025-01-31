const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require('discord.js');
const { ErrorEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");

const fs = require('fs');
const path = require('path');

const QRCode = require('qrcode');

module.exports = {
    premium: false,
    enabled: true,
    data: new SlashCommandBuilder()
        .setName("qr")
        .setDescription('Convert a link to a QR code')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .addStringOption(option => option
            .setName("link")
            .setDescription("The link to convert to a QR code")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("background")
            .setDescription("The color of the background")
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName("foreground")
            .setDescription("The color of the foreground")
            .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        
        const colorNameModule = await import('color-name');
        const colorName = colorNameModule.default;

        function getColorHex(colorNameString) {
            if (colorNameString === 'transparent') {
                return '#00000000';
            } else if (colorNameString === 'random') {
                return '#' + Math.floor(Math.random() * 16777215).toString(16);
            }

            const rgb = colorName[colorNameString.toLowerCase()];

            if (rgb) {
                const hex = rgb
                    .map((value) => value.toString(16).padStart(2, '0'))
                    .join('');
                return `#${hex}`;
            }

            return null;
        }

        try {
            const link = interaction.options.getString('link');
            const backgroundColorInput = interaction.options.getString('background') || '#232428';
            const foregroundColorInput = interaction.options.getString('foreground') || '#FFF';

            const backgroundColor = getColorHex(backgroundColorInput) || backgroundColorInput;
            const foregroundColor = getColorHex(foregroundColorInput) || foregroundColorInput;

            const options = {
                width: 2048,
                height: 2048,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor,
                },
            };

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const qrCodePath = path.join(tempDir, 'qrcode.png');

            QRCode.toFile(qrCodePath, link, options, async (error) => {
                if (error) {
                    Error(`Error generating QR code: ${error.message}`);
                    const errorEmbed = ErrorEmbed(error.message);
                    await interaction.editReply({
                        embeds: [errorEmbed],
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }

                await interaction.editReply({
                    embeds: [],
                    files: [qrCodePath],
                    flags: MessageFlags.Ephemeral,
                });

                fs.unlinkSync(qrCodePath);
            });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    embeds: [errorEmbed],
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed],
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    },
};
