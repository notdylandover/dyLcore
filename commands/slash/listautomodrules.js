const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits } = require('discord.js');
const { ErrorEmbed, AutomodRulesEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');
const { getAutomodRules } = require('../../utils/automod');

module.exports = {
    premium: false,
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
                return await interaction.editReply({ content: 'No automod rules set for this server.', ephemeral: true });
            }

            const automodEmbed = AutomodRulesEmbed(automodRules);
            await interaction.editReply({ embeds: [automodEmbed] });

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
