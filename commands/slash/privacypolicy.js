const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed, PolicyEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("privacypolicy")
        .setDescription('Get the bot\'s privacy policy')
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const policyEmbed = PolicyEmbed();
            await interaction.editReply({ embeds: [policyEmbed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
