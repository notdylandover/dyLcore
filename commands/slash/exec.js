const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { ErrorEmbed, CodeEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");

const compileCode = require('../../utils/codeCompiler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("exec")
        .setDescription('Execute provided code')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .addStringOption(option => option
            .setName('code')
            .setDescription('Code to compile')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('language')
            .setDescription('Programming language of the code')
            .setRequired(true)
            .addChoices([
                { name: "Java", value: "java" },
                { name: "Python", value: "py" },
                { name: "C++", value: "cpp" },
                { name: "C", value: "c" },
                { name: "C#", value: "cs" },
                { name: "JavaScript", value: "js" },
            ])
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const language = interaction.options.getString('language');
            const code = interaction.options.getString('code');

            if (!code.trim()) {
                throw new Error('The provided code cannot be empty or whitespace.');
            }

            const compilationResult = await compileCode(language, code);
            const outputEmbed = CodeEmbed(compilationResult);

            await interaction.editReply({ embeds: [outputEmbed]});
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