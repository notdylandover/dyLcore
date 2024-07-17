const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed, CodeEmbed } = require("../utils/embeds");
const { Error, CommandError } = require("../utils/logging");
const compileCode = require('../utils/codeCompiler');
const { METADATA } = require('../utils/metadata');

const command = new SlashCommandBuilder()
    .setName("exec")
    .setDescription(METADATA.exec.description)
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
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
    );

module.exports = {
    data: command,
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

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.stack);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};