const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs').promises;
const { ErrorEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const SERVERS_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'servers');

async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

async function writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setgameupdateschannel')
        .setDescription('Sets the channel for game updates')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to send game updates to')
            .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id;
            const serverConfigPath = path.join(SERVERS_DATA_PATH, `${guildId}.json`);

            let serverConfig = {};
            try {
                serverConfig = await readJSON(serverConfigPath);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }

            serverConfig.gameUpdatesChannel = channel.id;
            await writeJSON(serverConfigPath, serverConfig);

            await interaction.reply(`Game updates channel has been set to ${channel}`);
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};