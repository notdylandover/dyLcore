const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { PingEmbed, LoadingPingEmbed, ErrorEmbed } = require('../../utils/embeds');
const { CommandError } = require("../../utils/logging");

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Get the bot\'s ping')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
    async execute(interaction) {
        const start = Date.now();
        await interaction.deferReply();

        try {
            const loadingEmbed = LoadingPingEmbed();
            await interaction.editReply({ embeds: [loadingEmbed] });
            const wsping = interaction.client.ws.ping;

            if (wsping < 1) {
                const waitEmbed = ErrorEmbed('A ping hasn\'t been determined yet, Please wait a minute.');
                await interaction.editReply({ embeds: [waitEmbed], ephemeral: true });
                return;
            }

            let color = wsping < 75 ? 'green' : 'red';

            const restPing = Date.now() - start;
            const pingEmbed = PingEmbed(wsping, restPing, color);
            await interaction.editReply({ embeds: [pingEmbed] });
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