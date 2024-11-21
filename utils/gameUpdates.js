const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

const { LINKS } = require('./constants');
const { GameUpdateEmbed } = require('./embeds');

const DATA_FILE = path.join(__dirname, "..", "data", "lastGameUpdates.json");
const MONITORED_FILE = path.join(__dirname, "..", "data", "gameUpdates.json");
const SERVERS_DATA_PATH = path.join(__dirname, "..", "data", "servers");

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

async function checkForRobloxUpdates(universeId) {
    const apiUrl = `https://games.roblox.com/v1/games?universeIds=${universeId}`;
    let lastKnownUpdate;

    try {
        const data = await readJSON(DATA_FILE);

        lastKnownUpdate = data.Roblox?.[universeId]?.updated || null;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch from ROBLOX API: ${response.status} ${response.statusText}`);
        }

        const apiData = await response.json();
        if (apiData && apiData.data && apiData.data[0]) {
            const latestUpdate = apiData.data[0].updated;

            if (latestUpdate !== lastKnownUpdate) {
                console.log(`New update detected for Universe ID ${universeId}!`);

                data.Roblox = data.Roblox || {};
                data.Roblox[universeId] = apiData.data[0];
                await writeJSON(DATA_FILE, data);

                return { updated: true, latestUpdate, apiData: apiData.data[0] };
            } else {
                return { updated: false };
            }
        } else {
            throw new Error("Invalid response format from ROBLOX API.");
        }
    } catch (error) {
        console.error(`Error checking updates for Universe ID ${universeId}:`, error);
        return { updated: false };
    }
}

async function fetchGameUpdates(client) {
    try {
        const monitoredData = await readJSON(MONITORED_FILE);
        const universeIds = monitoredData.Roblox || [];

        if (universeIds.length === 0) {
            return;
        }

        const results = {};

        for (const universeId of universeIds) {
            const result = await checkForRobloxUpdates(universeId);
            results[universeId] = result;
        }

        for (const [id, result] of Object.entries(results)) {
            if (result.updated) {
                console.log(`Universe ID ${id}: Updated! Latest timestamp: ${result.latestUpdate}`);

                client.guilds.cache.forEach(async (guild) => {
                    const serverConfigPath = path.join(SERVERS_DATA_PATH, `${guild.id}.json`);
                    const serverConfig = await readJSON(serverConfigPath);
                    const gameUpdatesChannelId = serverConfig.gameUpdatesChannel;

                    console.log(gameUpdatesChannelId);

                    if (gameUpdatesChannelId) {
                        const gameUpdatesChannel = guild.channels.cache.get(gameUpdatesChannelId);

                        if (gameUpdatesChannel) {
                            const embed = GameUpdateEmbed(result.apiData.creator.name, result.apiData.name, `https://www.roblox.com/games/${result.apiData.rootPlaceId}`, ' ', LINKS.roblox_header, 'ROBLOX');

                            await gameUpdatesChannel.send({ embeds: [embed] });
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error fetching game updates:", error);
    }
}

module.exports = {
    fetchGameUpdates,
};