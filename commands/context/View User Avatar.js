const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { MediaEmbed, ErrorEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("View User Avatar")
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const targetUser = await interaction.client.users.fetch(interaction.targetId, { force: true });
            const avatarURL = targetUser.avatarURL({ size: 4096 });

            if (!avatarURL) {
                const errorEmbed = ErrorEmbed("Error", `Could not retrieve ${targetUser}'s avatar`);

                if (interaction.deferred || interaction.replied) {
                    return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            const mediaEmbed = MediaEmbed(avatarURL);
            await interaction.editReply({ embeds: [mediaEmbed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.stack);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
