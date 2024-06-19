const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed, RestartEmbed } = require("../utils/embeds");
const { End, Error, Info } = require("../utils/logging");
const { METADATA } = require('../utils/metadata');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription(METADATA.restart.description)
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const allowedUserId = process.env.OWNERID;
            if (interaction.user.id !== allowedUserId) {
                const errorEmbed = ErrorEmbed("Error", "You do not have permission to use this command.");
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                const restartEmbed = RestartEmbed("Restarted");
                await interaction.editReply({ embeds: [restartEmbed], ephemeral: true });

                await interaction.client.destroy();
                await new Promise((resolve) => setTimeout(resolve, 0));
                process.exit();
            }
        } catch (error) {
            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            Error(`Error executing ${interaction.commandName}: ${error.message}`);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            process.exit();
        }
    },
};
