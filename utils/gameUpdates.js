const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

const { LINKS } = require('./constants');
const { GameUpdateEmbed } = require('./embeds');
const { Debug, Error } = require('./logging');

const DATA_FILE = path.join(__dirname, "..", "data", "lastGameUpdates.json");
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

async function MarvelRivals() {
    return { updated: true, /* other data */ };
}

async function Roblox(universeId) {
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

async function Steam(appId, serverConfig) {
    const newsApiUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=5&format=json`;
    const appDetailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;

    try {
        const steamData = serverConfig.gameUpdates.Steam?.[appId];
        const lastKnownUpdate = steamData?.lastUpdatedTimestamp || 0;

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
            let gameName = appDetails.name;

            if (parseInt(appId) === 730) {
                gameName = "Counter-Strike 2";
            }

            const latestNews = newsItems[0];
            const latestUpdateTimestamp = latestNews.date * 1000;

            if (latestUpdateTimestamp > lastKnownUpdate) {
                serverConfig.gameUpdates.Steam[appId].lastUpdatedTimestamp = latestUpdateTimestamp;
                await writeJSON(path.join(SERVERS_DATA_PATH, `${serverConfig.guildId}.json`), serverConfig);

                return {
                    updated: true,
                    gameName,
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
        Error(`Error checking updates for Steam App ID ${appId}:\n${error.stack}`);
        return { updated: false };
    }
}

async function fetchGameUpdates(client) {
    try {
        for (const [guildId, guild] of client.guilds.cache) {
            const serverConfigPath = path.join(SERVERS_DATA_PATH, `${guildId}.json`);

            let serverConfig;
            try {
                serverConfig = await readJSON(serverConfigPath);
                serverConfig.guildId = guildId;
            } catch {
                continue;
            }

            if (!serverConfig.gameUpdates) {
                serverConfig.gameUpdates = {};
                await writeJSON(serverConfigPath, serverConfig);
            }

            const gameUpdates = serverConfig.gameUpdates;

            if (gameUpdates.Steam) {
                for (const appId of Object.keys(gameUpdates.Steam)) {
                    const result = await Steam(appId, serverConfig);
                    if (result.updated) {
                        await sendUpdateToGuilds(client, result, 'Steam', appId, serverConfig);
                    }
                }
            }

            if (gameUpdates.Roblox) {
                for (const universeId of Object.keys(gameUpdates.Roblox)) {
                    const result = await Roblox(universeId, serverConfig);
                    if (result.updated) {
                        await sendUpdateToGuilds(client, result, 'Roblox', universeId, serverConfig);
                    }
                }
            }

            if (gameUpdates.MarvelRivals) {
                const result = await MarvelRivals(serverConfig);
                if (result.updated) {
                    await sendUpdateToGuilds(client, result, 'MarvelRivals', null, serverConfig);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching game updates:", error);
    }
}

async function sendUpdateToGuilds(client, result, platform, id) {
    client.guilds.cache.forEach(async (guild) => {
        const serverConfigPath = path.join(SERVERS_DATA_PATH, `${guild.id}.json`);
        const serverConfig = await readJSON(serverConfigPath);

        if (!serverConfig.gameUpdates) {
            serverConfig.gameUpdates = {};
            await writeJSON(serverConfigPath, serverConfig);
        }

        let channelId;
        const gameUpdates = serverConfig.gameUpdates[platform] || {};

        if (id && gameUpdates[id]) {
            channelId = gameUpdates[id].channelId;
        }

        else if (platform === 'MarvelRivals' && serverConfig.gameUpdates.MarvelRivals?.channelId) {
            channelId = serverConfig.gameUpdates.MarvelRivals.channelId;
        }

        channelId = channelId || serverConfig.gameUpdatesChannel;

        if (channelId) {
            const gameUpdatesChannel = guild.channels.cache.get(channelId);
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
                        result.appDetails.developers?.join(', ') || 'Unknown',
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