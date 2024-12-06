const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { Error, Info, Done } = require('./logging');
require('dotenv').config();

const userCache = {};

async function updateEntitlement(username, entitlementStatus) {
    try {
        const userDir = path.join(__dirname, '..', 'data', 'users', username);
        const settingsFilePath = path.join(userDir, 'settings.json');

        await fs.mkdir(userDir, { recursive: true });

        if (!await fileExists(settingsFilePath)) {
            await fs.writeFile(settingsFilePath, JSON.stringify({}, null, 2), 'utf-8');
        }

        const fileContent = await fs.readFile(settingsFilePath, 'utf-8');
        const userData = JSON.parse(fileContent);

        userData.entitlement = entitlementStatus || null;

        await fs.writeFile(settingsFilePath, JSON.stringify(userData, null, 2), 'utf-8');

    } catch (error) {
        Error(`Failed to update entitlement for user ${username}:\n${error.message}`);
    }
}

async function getUserEntitlement(username) {
    try {
        if (userCache[username]) {
            return userCache[username];
        }

        const settingsFilePath = path.join(__dirname, '..', 'data', 'users', username, 'settings.json');

        if (!await fileExists(settingsFilePath)) {
            return null;
        }

        const userData = JSON.parse(await fs.readFile(settingsFilePath, 'utf-8'));
        const entitlements = await fetchAllEntitlements();
        const entitlement = entitlements.find(ent => ent.user_id === userData.user_id);

        userCache[username] = entitlement || null;

        return userCache[username];
    } catch (error) {
        Error(`Failed to retrieve entitlement for user ${username}:\n${error.message}`);
        return null;
    }
}

async function fetchAllEntitlements() {
    const options = {
        hostname: 'discord.com',
        path: `/api/v10/applications/${process.env.APPID}/entitlements`,
        method: 'GET',
        headers: {
            'Authorization': `Bot ${process.env.TOKEN}`,
            'Content-Type': 'application/json',
        }
    };

    Info('Fetching entitlements...');

    new Promise((resolve, reject) => {
        const req = https.request(options, async (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', async () => {
                if (res.statusCode === 200) {
                    try {
                        const entitlements = JSON.parse(data);
                        resolve(entitlements);

                        await updateUserEntitlements(entitlements);
                    } catch (error) {
                        reject(new Error('Failed to parse entitlement data.'));
                    }
                } else {
                    reject(new Error(`Failed to fetch entitlements: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();

        Done('Fetched entitlements');
    });
}

async function updateUserEntitlements(entitlements) {
    try {
        const usersDirectory = path.join(__dirname, '..', 'data', 'users');
        const userDirs = await fs.readdir(usersDirectory);

        for (const userDir of userDirs) {
            const userPath = path.join(usersDirectory, userDir);
            const settingsFilePath = path.join(userPath, 'settings.json');

            if (!(await fileExists(userPath)) || !(await fileExists(settingsFilePath))) {
                continue;
            }

            const userData = JSON.parse(await fs.readFile(settingsFilePath, 'utf-8'));

            const entitlement = entitlements.find(ent => ent.user_id === userData.id);

            if (entitlement) {
                await updateEntitlement(userDir, entitlement);
            } else {
                await updateEntitlement(userDir, null);
            }
        }
    } catch (error) {
        Error(`Failed to update user entitlements:\n${error.message}`);
    }
}


async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function enableGuildPremium(guildId) {
    const options = {
        hostname: 'discord.com',
        path: `/api/v10/applications/${process.env.APPID}/guilds/${guildId}/premium`,
        method: 'POST',
        headers: {
            'Authorization': `Bot ${process.env.TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Add any necessary payload here, like SKU details
        }),
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode === 204) {
                resolve(true); // Success
            } else {
                reject(new Error(`Failed to enable premium for guild ${guildId}: ${res.statusCode}`));
            }
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function isGuildPremiumEnabled(entitlements, guildId) {
    return entitlements.some(ent => ent.guild_id === guildId && !ent.deleted && ent.starts_at <= new Date().toISOString());
}

async function checkAndEnablePremiumForGuilds() {
    try {
        const entitlements = await fetchAllEntitlements();
        
        // Assuming your entitlements object contains guilds and relevant information
        const guildIds = entitlements.map(ent => ent.guild_id);
        
        for (const guildId of guildIds) {
            const premiumEnabled = await isGuildPremiumEnabled(entitlements, guildId);
            
            if (!premiumEnabled) {
                await enableGuildPremium(guildId);
                console.log(`Premium enabled for guild: ${guildId}`);
            } else {
                console.log(`Guild ${guildId} already has premium enabled.`);
            }
        }
    } catch (error) {
        Error(`Error during premium check and enablement: ${error.message}`);
    }
}

module.exports = { updateEntitlement, getUserEntitlement, fetchAllEntitlements, checkAndEnablePremiumForGuilds };