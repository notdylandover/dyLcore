const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, BallEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');
const { EIGHTBALL } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the 8ball a question')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .addStringOption(option => option
            .setName('question')
            .setDescription('The question you want to ask the 8ball')
            .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const author = interaction.user;
            const question = interaction.options.getString('question');
            const response = EIGHTBALL[Math.floor(Math.random() * EIGHTBALL.length)];

            const ballEmbed = BallEmbed(author, question, response);
            await interaction.editReply({ embeds: [ballEmbed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};