const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { ErrorEmbed, CoinflipEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const command = new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin')
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
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            const resultEmbed = CoinflipEmbed(result);

            await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
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