const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, CoinflipEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            const resultEmbed = CoinflipEmbed(result);

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