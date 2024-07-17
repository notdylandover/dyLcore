const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ErrorEmbed, FileEmbed } = require("../utils/embeds");
const { Error, CommandError } = require('../utils/logging');
const { METADATA } = require('../utils/metadata');

const puppeteer = require('puppeteer');

const command = new SlashCommandBuilder()
    .setName('ss')
    .setDescription(METADATA.ss.description)
    .addStringOption(option => option
        .setName('url')
        .setDescription('The URL of the webpage')
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        const url = interaction.options.getString('url');
        let screenshotPath = '';

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle2' });

            await page.setViewport({
                width: 1920,
                height: 1080,
            });

            const screenshotBuffer = await page.screenshot({ encoding: 'base64' });
            const screenshotSize = Buffer.byteLength(screenshotBuffer, 'base64') / (1024 * 1024);

            const embed = FileEmbed(screenshotSize.toFixed(2), ((Date.now() - interaction.createdAt) / 1000).toFixed(2));

            await interaction.editReply({
                embeds: [embed],
                files: [
                    { name: "screenshot.png", attachment: Buffer.from(screenshotBuffer, 'base64') }
                ],
                ephemeral: true
            });

        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.stack);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

        } finally {
            await browser.close();

            if (screenshotPath) {
                try {
                    fs.unlinkSync(screenshotPath);
                } catch (err) {
                    Error(`Error deleting screenshot: ${err.message}`);
                }
            }
        }
    }
};