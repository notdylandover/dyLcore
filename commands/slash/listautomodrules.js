const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { ErrorEmbed, AutomodRulesEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');
const { getAutomodRules } = require('../../utils/automod');

module.exports = {
    premium: false,
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('listautomodrules')
        .setDescription('Lists the automod rules for the server')
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const guildId = interaction.guildId;
            const client = interaction.client;
            const automodRules = await getAutomodRules(guildId, client);
            
            if (!automodRules || automodRules.length === 0) {
                return await interaction.editReply({ content: 'No automod rules set for this server.', flags: MessageFlags.Ephemeral });
            }

            const automodEmbed = AutomodRulesEmbed(automodRules);
            await interaction.editReply({ embeds: [automodEmbed] });

        } catch (error) {
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
