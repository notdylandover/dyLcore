const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { ErrorEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of commands')
        .addStringOption(option => option
            .setName('command')
            .setDescription('The specific command')
            .setRequired(false)
        )
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const notyet = ErrorEmbed(`Error executing ${interaction.commandName}`, 'This command does not work at the moment.');
            await interaction.editReply({ embeds: [notyet], ephemeral: true });
        } catch(error) {
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