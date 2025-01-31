const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require('discord.js');
const { ErrorEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

module.exports = {
    premium: false,
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of commands')
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .addStringOption(option => option
            .setName('command')
            .setDescription('The specific command')
            .setRequired(false)
        )
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const notyet = ErrorEmbed('This command does not work at the moment.');
            await interaction.editReply({ embeds: [notyet], flags: MessageFlags.Ephemeral });
        } catch(error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};