const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { MediaEmbed, ErrorEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

module.exports = {
    premium: false,
    data: new ContextMenuCommandBuilder()
        .setName("View User Banner")
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const targetUser = await interaction.client.users.fetch(interaction.targetId, { force: true });
            const bannerURL = targetUser.bannerURL({ size: 4096 });

            if (!bannerURL) {
                const errorEmbed = ErrorEmbed(`Could not retrieve ${targetUser}'s banner`);

                if (interaction.deferred || interaction.replied) {
                    return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            const mediaEmbed = MediaEmbed(bannerURL);
            await interaction.editReply({ embeds: [mediaEmbed] });
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
