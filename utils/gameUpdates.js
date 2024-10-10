const { Error, DebugNoDB } = require('./logging');

const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const APP_ID = 730;
const LAST_UPDATE_FILE = path.join(__dirname, '..', 'data', 'lastUpdate.json');

async function fetchGameUpdates() {
    try {
        const response = await axios.get(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/`, {
            params: {
                appid: APP_ID,
                count: 1,
                maxlength: 300,
                format: 'json',
                key: process.env.STEAM_API_KEY
            }
        });
        

        const newsItems = response.data.appnews.newsitems;
        if (newsItems && newsItems.length > 0) {
            const latestNews = newsItems[0];
            const lastUpdateID = readLastUpdateID();

            if (latestNews.gid !== lastUpdateID) {
                DebugNoDB("New update found!");
                DebugNoDB(`Title: ${latestNews.title}`);
                DebugNoDB(`Content: ${latestNews.contents}`);
                DebugNoDB(`Link: ${latestNews.url}`);
                
                saveLastUpdateID(latestNews.gid);
            } else {
                return;
            }
        } else {
            return;
        }
    } catch (error) {
        Error("Error fetching game updates:", error);
    }
}

function readLastUpdateID() {
    if (fs.existsSync(LAST_UPDATE_FILE)) {
        const data = fs.readFileSync(LAST_UPDATE_FILE, 'utf8');
        const json = JSON.parse(data);
        return json.lastUpdateID;
    }
    return null;
}

function saveLastUpdateID(gid) {
    const data = { lastUpdateID: gid };
    fs.writeFileSync(LAST_UPDATE_FILE, JSON.stringify(data));
}

module.exports = { fetchGameUpdates };