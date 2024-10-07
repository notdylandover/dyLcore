const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, InspireEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName("inspire")
        .setDescription('Generate an inspirational image')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const quoteResponse = await fetch('https://inspirobot.me/api?generate=true');
            if (!quoteResponse.ok) throw new Error('Failed to fetch quote');

            const quoteImageUrl = await quoteResponse.text();

            const imageResponse = await fetch(quoteImageUrl);
            if (!imageResponse.ok) throw new Error('Failed to fetch image');

            const quoteEmbed = InspireEmbed(quoteImageUrl);

            await interaction.editReply({ embeds: [quoteEmbed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};