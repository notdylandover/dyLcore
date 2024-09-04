const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ErrorEmbed, JSONEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const command = new ContextMenuCommandBuilder()
    .setName("View User JSON")
    .setType(ApplicationCommandType.User)
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let messageContent = interaction.targetUser;

        try {
            const jsonEmbed = JSONEmbed(JSON.stringify(messageContent, null, 2));
            await interaction.editReply({ embeds: [jsonEmbed] });
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