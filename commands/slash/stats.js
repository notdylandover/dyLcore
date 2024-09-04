const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { ErrorEmbed, StatsEmbed } = require('../../utils/embeds');
const { CommandError, Error } = require('../../utils/logging');
const { fetchCommandCount } = require('../../utils/registerCommands');

const axios = require('axios');

const command = new SlashCommandBuilder()
    .setName('stats')
    .setDescription(`Get information about dyLcore`)
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
            const botToken = client.token || process.env.TOKEN;

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

            const memoryUsage = process.memoryUsage();
            const ramUsageMB = (memoryUsage.rss / (1024 * 1024)).toFixed(0);

            const cpuUsage = process.cpuUsage();
            const totalCpuTime = cpuUsage.user + cpuUsage.system;
            const totalCpuPercent = ((totalCpuTime / (process.uptime() * 1000000)) * 100).toFixed(0);

            const slashCommandsCount = await fetchCommandCount(client);

            let installCount = 'N/A';

            try {
                const response = await axios.get(`https://canary.discord.com/api/v10/applications/@me`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });

                installCount = response.data.approximate_user_install_count || 'N/A';
            } catch (error) {
                Error(`Failed to fetch installation count: ${fetchError.message}`);
            }

            const statsEmbed = StatsEmbed(
                serversCount,
                installCount,
                shardsCount,
                uptimeFormatted,
                ramUsageMB,
                slashCommandsCount,
                totalCpuPercent,
                'N/A',
                'N/A'
            );

            await interaction.editReply({ embeds: [statsEmbed], ephemeral: true });
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