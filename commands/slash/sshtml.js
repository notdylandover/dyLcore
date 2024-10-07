const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, FileEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

const puppeteer = require('puppeteer');

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName("sshtml")
        .setDescription("Generate a screenshot of provided HTML code")
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .addStringOption(option => option
            .setName('html')
            .setDescription('The HTML code to screenshot')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const htmlCode = interaction.options.getString('html');

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.setViewport({ width: 1920, height: 1080 });
            await page.setContent(htmlCode);

            const screenshotBuffer = await page.screenshot({ encoding: 'base64' });
            const screenshotSize = Buffer.byteLength(screenshotBuffer, 'base64') / (1024 * 1024);

            await browser.close();

            const embed = FileEmbed(screenshotSize.toFixed(2), ((Date.now() - interaction.createdAt) / 1000).toFixed(2));

            await interaction.editReply({ embeds: [embed], files: [{ attachment: Buffer.from(screenshotBuffer, 'base64'), name: 'screenshot.png' }]});
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};