const { PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ErrorEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

function renderCommandList(commands, descriptions) {
    let maxLength = Math.max(...(commands.map(el => el.length))) + 3;
    let render = [];
    let i = 0;

    for (const c of commands) {
        let pad = maxLength - c.length;
        let desc = descriptions[i];
        if (desc.includes('\n')) desc = desc.split('\n')[0];
        if (desc.length >= 41) desc = desc.slice(0, 40) + '...';

        render.push(`\` ${c}${' '.repeat(pad)}\` ${desc}`);
        i++;
    }

    return render.join('\n');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of commands')
        .addStringOption(option => option
            .setName('command')
            .setDescription('The specific command')
            .setRequired(false)
        )
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, 'This command does not work at the moment.');
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