const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { ErrorEmbed, UpdateEmbed } = require('../utils/embeds');
const { End, Error, Info } = require('../utils/logging');
const { METADATA } = require('../utils/metadata');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription(METADATA.update.description)
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const updateEmbed = UpdateEmbed();
            await interaction.editReply({ embeds: [updateEmbed] });
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