const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ErrorEmbed, JSONEmbed } = require('../utils/embeds');
const { Debug, Error } = require('../utils/logging');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("View User JSON")
        .setType(ApplicationCommandType.User)
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let messageContent = interaction.targetUser;

        try {
            const jsonEmbed = JSONEmbed(JSON.stringify(messageContent, null, 2));
            await interaction.editReply({ embeds: [jsonEmbed] });
        } catch (error) {
            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            Error(`Error executing ${interaction.commandName}: ${error.message}`);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};