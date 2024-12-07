const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, SpeedTestEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const speedTest = require('speedtest-net');

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName('speedtest')
        .setDescription('Run a network speed test')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const result = await speedTest({ acceptLicense: true });

            const downloadSpeed = (result.download.bandwidth * 8 / 1e6).toFixed(2);
            const uploadSpeed = (result.upload.bandwidth * 8 / 1e6).toFixed(2);
            const ping = result.ping.latency.toFixed(2);

            const resultEmbed = SpeedTestEmbed(downloadSpeed, uploadSpeed, ping);

            await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
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