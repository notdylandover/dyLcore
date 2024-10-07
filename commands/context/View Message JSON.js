const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, JSONEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

module.exports = {
    premium: false,
    data: new ContextMenuCommandBuilder()
        .setName("View Message JSON")
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let messageContent = interaction.targetMessage;

        try {
            const jsonEmbed = JSONEmbed(JSON.stringify(messageContent, null, 2));
            await interaction.editReply({ embeds: [jsonEmbed] });
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