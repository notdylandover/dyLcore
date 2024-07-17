const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { StatsEmbed, ErrorEmbed } = require('../utils/embeds');
const { CommandError } = require('../utils/logging');
const { METADATA } = require('../utils/metadata');

const command = new SlashCommandBuilder()
    .setName('stats')
    .setDescription(METADATA.stats.description)
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
            const { client } = interaction;

            const serversCount = client.guilds.cache.size;
            const shardsCount = client.ws.shards.size;
            let uptimeSeconds = process.uptime();

            let uptimeFormatted = '';

            if (uptimeSeconds >= 86400) {
                const days = Math.floor(uptimeSeconds / 86400);
                uptimeFormatted += `${days}d `;
                uptimeSeconds %= 86400;
            }

            if (uptimeSeconds >= 3600) {
                const hours = Math.floor(uptimeSeconds / 3600);
                uptimeFormatted += `${hours}h `;
                uptimeSeconds %= 3600;
            }

            if (uptimeSeconds >= 60) {
                const minutes = Math.floor(uptimeSeconds / 60);
                uptimeFormatted += `${minutes}m `;
                uptimeSeconds %= 60;
            }

            if (uptimeSeconds > 0 || uptimeFormatted === '') {
                uptimeFormatted += `${uptimeSeconds.toFixed(0)}s`;
            }

            const botInfoEmbed = StatsEmbed(serversCount, shardsCount, uptimeFormatted);
            await interaction.editReply({ embeds: [botInfoEmbed], ephemeral: true });
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