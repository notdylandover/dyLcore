const { Error, DebugNoDB, WarnNoDB, Debug } = require('./logging');
const { GameUpdateEmbed } = require('./embeds');

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GAME_UPDATES_FILE = path.join(__dirname, '..', 'data', 'gameUpdates.json');
const LAST_UPDATE_FILE = path.join(__dirname, '..', 'data', 'lastUpdate.json');
const SERVER_SETTINGS_DIR = path.join(__dirname, '..', 'data', 'servers');

async function fetchGameUpdates(client) {
    try {
        const appIds = readAppIds();
        const lastUpdates = readLastUpdateIDs();

        for (const guild of client.guilds.cache.values()) {
            const guildId = guild.id;

            for (const appId of appIds) {
                const response = await axios.get(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/`, {
                    params: {
                        appid: appId,
                        count: 1,
                        format: 'json',
                    }
                });

                const newsItems = response.data.appnews.newsitems;
                if (newsItems && newsItems.length > 0) {
                    const latestNews = newsItems[0];
                    const lastUpdateID = lastUpdates[appId] || null;

                    if (latestNews.gid !== lastUpdateID) {

                        saveLastUpdateID(appId, latestNews.gid);

                        await sendGameUpdateToChannel(guildId, appId, latestNews, client);
                    } else {
                        return;
                    }
                } else {
                    DebugNoDB(`No news items found for appId ${appId} in guild ${guildId}.`);
                }
            }
        }
    } catch (error) {
        Error(`Error fetching game updates:\n${error.stack}`);
    }
}

async function getGameName(appId) {
    try {
        const response = await axios.get(`https://store.steampowered.com/api/appdetails/`, {
            params: {
                appids: appId,
            },
        });

        if (response.data && response.data[appId] && response.data[appId].data) {
            return response.data[appId].data.name;
        } else {
            DebugNoDB(`No game name found for appId ${appId}.`);
            return 'Unknown Game';
        }
    } catch (error) {
        Error(`Error fetching game name for appId ${appId}: ${error.stack}`);
        return 'Unknown Game';
    }
}

async function getHeaderImage(appId) {
    try {
        const response = await axios.get(`https://store.steampowered.com/api/appdetails/`, {
            params: {
                appids: appId
            }
        });

        if (response.data && response.data[appId] && response.data[appId].data) {
            return response.data[appId].data.header_image;
        } else {
            console.error(`Failed to fetch app details for appId ${appId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching app icon for appId ${appId}:`, error);
        return null;
    }
}

function formatNewsContent(rawContent) {
    let formattedContent = rawContent
        .replace(/\[list\]/g, '') // Remove [list] tags
        .replace(/\[\/list\]/g, '') // Remove [/list] tags
        .replace(/\[\*\]/g, '> ') // Replace list item markers with ">"
        .replace(/\[ ([^\]]+) \]/g, '### $1:') // Format headers
        .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
        .trim(); // Trim any leading/trailing whitespace

    return formattedContent;
}

async function sendGameUpdateToChannel(guildId, appId, latestNews, client) {
    const settingsFilePath = path.join(SERVER_SETTINGS_DIR, `${guildId}.json`);

    if (fs.existsSync(settingsFilePath)) {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
        const gameUpdatesChannelId = settings.gameUpdatesChannel;

        if (gameUpdatesChannelId) {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(gameUpdatesChannelId);
            
            if (channel) {
                const lastSentUpdates = settings.lastSentUpdates || {};
                const lastSentUpdateId = lastSentUpdates[appId];

                if (latestNews.gid !== lastSentUpdateId) {
                    const name = await getGameName(appId);
                    const title = latestNews.title;
                    const url = latestNews.url;
                    const headerImage = await getHeaderImage(appId);
                    const rawDescription = latestNews.contents;
                    const description = formatNewsContent(rawDescription);

                    const gameUpdateEmbed = GameUpdateEmbed(name, title, url, description, headerImage);

                    await channel.send({ embeds: [gameUpdateEmbed] });

                    lastSentUpdates[appId] = latestNews.gid;
                    settings.lastSentUpdates = lastSentUpdates;

                    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
                } else {
                    return;
                }
            } else {
                delete settings.gameUpdatesChannel;
                fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
            }
        } else {
            return;
        }
    } else {
        return;
    }
}

function readAppIds() {
    if (fs.existsSync(GAME_UPDATES_FILE)) {
        const data = fs.readFileSync(GAME_UPDATES_FILE, 'utf8');
        const json = JSON.parse(data);
        return json.appIds;
    }
    return [];
}

function readLastUpdateIDs() {
    if (fs.existsSync(LAST_UPDATE_FILE)) {
        const data = fs.readFileSync(LAST_UPDATE_FILE, 'utf8');
        return JSON.parse(data);
    }
    return {};
}

function saveLastUpdateID(appId, gid) {
    let lastUpdates = readLastUpdateIDs();
    lastUpdates[appId] = gid;
    fs.writeFileSync(LAST_UPDATE_FILE, JSON.stringify(lastUpdates, null, 2));
}

module.exports = { fetchGameUpdates };