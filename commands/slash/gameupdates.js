const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const { Error } = require('../../utils/logging');

const SERVERS_DATA_PATH = path.join(__dirname, "..", "..", "data", "servers");

async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            return {};
        }
        throw error;
    }
}

async function writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), "utf8");
}

async function getUniverseId(placeId) {
    const url = `https://api.roblox.com/universes/get-universe-containing-place?placeId=${placeId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success === false) {
            throw new Error(data.message || 'Failed to retrieve universeId.');
        }
        return data.universeId;
    } catch (error) {
        throw new Error(`Error fetching universeId: ${error.message}`);
    }
}

module.exports = {
    premium: false,
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('gameupdates')
        .setDescription('Configure the game updates in this server')
        .addSubcommand(subcommand => subcommand
            .setName('cs2')
            .setDescription('Set the channel for CS2')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Channel for Counter-Strike 2 updates')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('roblox')
            .setDescription('Set the channel for a Roblox place ID')
            .addIntegerOption(option => option
                .setName('placeid')
                .setDescription('Roblox place ID')
                .setRequired(true)
            )
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Channel for this Roblox game')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('marvel')
            .setDescription('Set the channel for Marvel Rivals updates')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Channel for Marvel Rivals')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const subcommand = interaction.options.getSubcommand();

        const serverConfigPath = path.join(SERVERS_DATA_PATH, `${interaction.guild.id}.json`);
        let serverConfig;
        try {
            serverConfig = await readJSON(serverConfigPath);
        } catch {
            serverConfig = {};
        }
        if (!serverConfig.gameUpdates) {
            serverConfig.gameUpdates = {};
        }

        let msg = '';
        if (subcommand === 'cs2') {
            const channel = interaction.options.getChannel('channel');
            if (!serverConfig.gameUpdates.Steam) serverConfig.gameUpdates.Steam = {};
            serverConfig.gameUpdates.Steam["730"] = { channelId: channel.id };
            msg = `CS2 updates channel set to <#${channel.id}>.`;
        } else if (subcommand === 'roblox') {
            const placeId = interaction.options.getInteger('placeid');
            const channel = interaction.options.getChannel('channel');
            try {
                const universeId = await getUniverseId(placeId);
                if (!serverConfig.gameUpdates.Roblox) serverConfig.gameUpdates.Roblox = {};
                serverConfig.gameUpdates.Roblox[universeId] = { channelId: channel.id };
                msg = `Roblox game (Universe ID: ${universeId}) updates channel set to <#${channel.id}>.`;
            } catch (err) {
                Error(err.message);
                await interaction.editReply({ content: `Error: ${err.message}` });
                return;
            }
        } else if (subcommand === 'marvel') {
            const channel = interaction.options.getChannel('channel');
            serverConfig.gameUpdates.MarvelRivals = { channelId: channel.id };
            msg = `Marvel Rivals updates channel set to <#${channel.id}>.`;
        }

        try {
            await writeJSON(serverConfigPath, serverConfig);
            await interaction.editReply({ content: msg });
        } catch (err) {
            Error(err.message);
            await interaction.editReply({ content: 'Error updating game updates configuration.' });
        }
    }
};