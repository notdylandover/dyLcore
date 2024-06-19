const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed, InfoEmbed } = require("../utils/embeds");
const { Error } = require("../utils/logging");
const { METADATA } = require('../utils/metadata');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("privacypolicy")
        .setDescription(METADATA.privacypolicy.description)
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const policyEmbed = InfoEmbed(`For more information about the privacy policy, please visit https://dylandover.dev/privacypolicy`);
            await interaction.editReply({ embeds: [policyEmbed] });
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
