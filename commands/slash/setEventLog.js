const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { ErrorEmbed, SuccessEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');
const fs = require('fs');
const path = require('path');

const command = new SlashCommandBuilder()
    .setName('seteventlog')
    .setDescription('Set the channel where you want event logs')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The channel where event logs will be sent')
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const channel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id;

            const settingsFilePath = path.join(__dirname, '..', '..', 'data', guildId, 'settings.json');
            fs.mkdirSync(path.dirname(settingsFilePath), { recursive: true });

            let settings = {};

            if (fs.existsSync(settingsFilePath)) {
                settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
            }

            settings.eventLogChannel = channel.id;

            fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));

            const successEmbed = SuccessEmbed('Event Logs Channel Set', `Event logs will be sent to <#${channel.id}>.`);
            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
