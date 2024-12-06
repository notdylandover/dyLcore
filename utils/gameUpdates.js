const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

const { LINKS } = require('./constants');
const { GameUpdateEmbed } = require('./embeds');
const { Info, Error } = require('./logging');

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

function formatPatchNotes(contents) {
    contents = contents.replace(/\n\s*\n/g, '\n');
    contents = contents.replace(/\[list\]/g, '').replace(/\[\/list\]/g, '');
    contents = contents.replace(/\[\*\]/g, '-');
    contents = contents.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '[$2]($1)');
    contents = contents.replace(/\[ (.*?) \]/g, '### $1');
    contents = contents.replace(/\[\/?\w+(=.*?)?\]/g, '');

    return contents.trim();
}

async function checkForRobloxUpdates(universeId) {
    const apiUrl = `https://games.roblox.com/v1/games?universeIds=${universeId}`;

    try {
        const data = await readJSON(DATA_FILE);
        const lastKnownUpdate = data.Roblox?.[universeId]?.lastUpdatedTimestamp || 0;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch from Roblox API: ${response.status} ${response.statusText}`);
        }

        const apiData = await response.json();
        const gameData = apiData?.data?.[0];

        if (gameData) {
            const latestUpdateTimestamp = new Date(gameData.updated).getTime();

            if (latestUpdateTimestamp > lastKnownUpdate) {
                data.Roblox = data.Roblox || {};
                data.Roblox[universeId] = {
                    lastUpdatedTimestamp: latestUpdateTimestamp,
                    ...gameData,
                };
                await writeJSON(DATA_FILE, data);

                return { updated: true, latestUpdate: gameData.updated, apiData: gameData };
            } else {
                return { updated: false };
            }
        } else {
            throw new Error("Invalid response format from Roblox API.");
        }
    } catch (error) {
        Error(`Error checking updates for Universe ID ${universeId}:`, error.message);
        return { updated: false };
    }
}

async function checkForSteamUpdates(appId) {
    const newsApiUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=5&format=json`;
    const appDetailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;

    try {
        const data = await readJSON(DATA_FILE);
        const lastKnownUpdate = data.Steam?.[appId]?.lastUpdatedTimestamp || 0;

        const [newsResponse, appDetailsResponse] = await Promise.all([
            fetch(newsApiUrl),
            fetch(appDetailsUrl)
        ]);

        if (!newsResponse.ok) {
            throw new Error(`Failed to fetch from Steam News API: ${newsResponse.status} ${newsResponse.statusText}`);
        }
        if (!appDetailsResponse.ok) {
            throw new Error(`Failed to fetch from Steam App Details API: ${appDetailsResponse.status} ${appDetailsResponse.statusText}`);
        }

        const newsData = await newsResponse.json();
        const appDetailsData = await appDetailsResponse.json();

        let newsItems = newsData?.appnews?.newsitems;
        const appDetails = appDetailsData?.[appId]?.data;

        if (newsItems && newsItems.length > 0 && appDetails) {
            if (appId === 730) {
                newsItems = newsItems.filter(item => item.title === 'Counter-Strike 2 Update');
            }

            if (newsItems.length === 0) {
                return { updated: false };
            }

            const latestNews = newsItems[0];
            const latestUpdateTimestamp = latestNews.date * 1000;

            if (latestUpdateTimestamp > lastKnownUpdate) {
                data.Steam = data.Steam || {};
                data.Steam[appId] = {
                    lastUpdatedTimestamp: latestUpdateTimestamp,
                    latestNews,
                    appDetails
                };
                await writeJSON(DATA_FILE, data);

                return {
                    updated: true,
                    latestUpdate: new Date(latestUpdateTimestamp).toISOString(),
                    latestNews,
                    appDetails
                };
            } else {
                return { updated: false };
            }
        } else {
            throw new Error("No news items or app details found for this app.");
        }
    } catch (error) {
        Error(`Error checking updates for Steam App ID ${appId}:`, error.message);
        return { updated: false };
    }
}

async function fetchGameUpdates(client) {
    try {
        const monitoredData = await readJSON(MONITORED_FILE);
        const robloxUniverseIds = monitoredData.Roblox || [];
        const steamAppIds = monitoredData.Steam || [];

        for (const universeId of robloxUniverseIds) {
            const result = await checkForRobloxUpdates(universeId);
            if (result.updated) {
                await sendUpdateToGuilds(client, result.apiData, 'Roblox');
            }
        }

        for (const appId of steamAppIds) {
            const result = await checkForSteamUpdates(appId);
            if (result.updated) {
                await sendUpdateToGuilds(client, result, 'Steam');
            }
        }
    } catch (error) {
        console.error("Error fetching game updates:", error);
    }
}

async function sendUpdateToGuilds(client, result, platform) {
    client.guilds.cache.forEach(async (guild) => {
        const serverConfigPath = path.join(SERVERS_DATA_PATH, `${guild.id}.json`);
        const serverConfig = await readJSON(serverConfigPath);
        const gameUpdatesChannelId = serverConfig.gameUpdatesChannel;

        if (gameUpdatesChannelId) {
            const gameUpdatesChannel = guild.channels.cache.get(gameUpdatesChannelId);

            if (gameUpdatesChannel) {
                let embed;
                if (platform === 'Roblox') {
                    embed = GameUpdateEmbed(
                        result.creator.name,
                        result.name,
                        `https://www.roblox.com/games/${result.rootPlaceId}`,
                        ' ',
                        LINKS.roblox_header,
                        platform
                    );
                } else if (platform === 'Steam') {
                    const formattedContents = formatPatchNotes(result.latestNews.contents);
                    embed = GameUpdateEmbed(
                        result.appDetails.developers ? result.appDetails.developers.join(', ') : 'Unknown Developer',
                        result.appDetails.name,
                        `https://store.steampowered.com/app/${result.appDetails.steam_appid}`,
                        formattedContents,
                        result.appDetails.header_image,
                        platform
                    );
                }
                await gameUpdatesChannel.send({ embeds: [embed] });
            }
        }
    });
}

module.exports = { fetchGameUpdates };