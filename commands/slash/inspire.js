const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed, InspireEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");

const command = new SlashCommandBuilder()
    .setName("inspire")
    .setDescription('Generate an inspirational image')
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const quoteResponse = await fetch('https://inspirobot.me/api?generate=true');
            if (!quoteResponse.ok) throw new Error('Failed to fetch quote');

            const quoteImageUrl = await quoteResponse.text();

            const imageResponse = await fetch(quoteImageUrl);
            if (!imageResponse.ok) throw new Error('Failed to fetch image');

            const quoteEmbed = InspireEmbed(quoteImageUrl);

            await interaction.editReply({ embeds: [quoteEmbed] });
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