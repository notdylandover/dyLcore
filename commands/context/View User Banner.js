const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { MediaEmbed, ErrorEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

const command = new ContextMenuCommandBuilder()
    .setName("View User Banner")
    .setType(ApplicationCommandType.User)
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const targetUser = await interaction.client.users.fetch(interaction.targetId, { force: true });
            const bannerURL = targetUser.bannerURL({ size: 4096 });

            if (!bannerURL) {
                const errorEmbed = ErrorEmbed("Error", `Could not retrieve ${targetUser}'s banner`);

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

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.stack);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
