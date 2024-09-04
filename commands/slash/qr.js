const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { ErrorEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");

const fs = require('fs');
const path = require('path');

const QRCode = require('qrcode');
const colorNameList = require('color-name-list');

function getColorHex(colorName) {
    if (colorName === 'transparent') {
        return '#00000000';
    }
    else if (colorName === 'random') {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    const colorEntry = colorNameList.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    
    if (colorEntry) {
        return colorEntry.hex;
    }
    
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("qr")
        .setDescription('Convert a link to a QR code')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
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

        try {
            const link = interaction.options.getString('link');
            let backgroundColor = interaction.options.getString('background') || '#232428';
            let foregroundColor = interaction.options.getString('foreground') || '#FFF';

            const backgroundHex = getColorHex(backgroundColor);
            const foregroundHex = getColorHex(foregroundColor);

            if (backgroundHex) backgroundColor = backgroundHex;
            if (foregroundHex) foregroundColor = foregroundHex;

            const options = {
                width: 2048,
                height: 2048,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor
                }
            };

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const qrCodePath = path.join(tempDir, 'qrcode.png');

            QRCode.toFile(qrCodePath, link, options, async (err) => {
                if (err) {
                    Error(`Error generating QR code: ${err.message}`);
                    const errorEmbed = ErrorEmbed('Error generating QR code', err.message);
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                    return;
                }

                await interaction.editReply({ embeds: [], files: [qrCodePath], ephemeral: true });

                fs.unlinkSync(qrCodePath);
            });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
