const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ErrorEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");
const { createCanvas, loadImage } = require('canvas');

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');

const command = new ContextMenuCommandBuilder()
    .setName("Make It A Quote")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const message = await interaction.channel.messages.fetch(interaction.targetId);
            const user = message.author;

            let avatarUrl = user.avatarURL({ format: 'png', size: 4096 });

            const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
            let buffer = Buffer.from(response.data);

            const isWebP = buffer.length >= 12 && buffer.slice(0, 4).toString('hex') === '52494646' && buffer.slice(8, 12).toString('hex') === '57454250';

            if (isWebP) {
                buffer = await sharp(buffer).png().toBuffer();
            }

            buffer = await sharp(buffer).grayscale().toBuffer();

            avatarUrl = `data:image/png;base64,${buffer.toString('base64')}`;

            const canvasWidth = 680;
            const canvasHeight = 240;
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            ctx.fillStyle = '#fff';

            const avatarSize = canvasHeight;
            const avatarX = 0;
            const avatarY = (canvasHeight - avatarSize) / 2;

            const avatarImage = await loadImage(avatarUrl);
            ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);

            const gradient = ctx.createLinearGradient(avatarX, 0, avatarX + avatarSize, 0);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

            ctx.fillStyle = gradient;
            ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);

            function wrapText(text, x, y, maxWidth, lineHeight) {
                ctx.font = '20px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';

                const words = text.split(' ');
                let line = '';
                let lines = [];

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth && i > 0) {
                        lines.push(line);
                        line = words[i] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                for (let j = 0; j < lines.length; j++) {
                    ctx.fillText(lines[j], x, y + (j * lineHeight));
                }
            }

            const lineHeight = 30;
            const padding = 10;
            const contentX = canvasHeight + padding;
            const contentY = 0 + padding;
            const authorY = canvasHeight - lineHeight;
            const maxWidth = canvasWidth - (canvasHeight + padding);
            
            wrapText(message.content, contentX, contentY, maxWidth, lineHeight);

            ctx.font = '16px Arial';
            ctx.fillText(`- ${user.displayName}`, contentX, authorY);

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const quoteImagePath = path.join(tempDir, 'quote.png');
            const out = fs.createWriteStream(quoteImagePath);
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            out.on('finish', async () => {
                await interaction.editReply({ files: [quoteImagePath] });

                fs.unlinkSync(quoteImagePath);
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