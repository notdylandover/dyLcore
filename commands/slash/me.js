const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { ErrorEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("me")
        .setDescription('Say something as the bot')
        .addStringOption((option) => option
            .setName("message")
            .setDescription("The message to send")
            .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const allowedUserId = process.env.OWNERID;
            const userMessage = interaction.options.getString("message");;

            if (interaction.user.id !== allowedUserId) {
                const errorEmbed = ErrorEmbed('Error', 'You do not have permission to use this command.');
                return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.channel.send(userMessage);
                await interaction.deleteReply();
            }
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
