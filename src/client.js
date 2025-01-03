const { INTENTS } = require('./intents');
const { PARTIALS } = require('./partials');
const { Debug, Version, Invalid, Error, Warn, Info, Done } = require('../utils/logging');

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const Discord = require('discord.js');
const { version: DJSVersion } = Discord;

const client = new Discord.Client({ intents: INTENTS, partials: PARTIALS });

(async () => {
    try {
        const latestVersion = (await import('latest-version')).default;

        const latestDJSVersion = await latestVersion('discord.js');

        if (DJSVersion !== latestDJSVersion) {
            Version(`DiscordJS v${DJSVersion}` + `\t` + ` A new version is available: v${latestDJSVersion} `.bgGreen.black);
            Info(`Updating DiscordJS...`);
            exec(`npm install discord.js@latest`, (error, stdout, stderr) => {
                if (error) {
                    Error(`Error updating DiscordJS: ${error.message}`);
                    return;
                }
                if (stderr) {
                    Error(`stderr: ${stderr}`);
                    return;
                }
                Done(`DiscordJS updated to v${latestDJSVersion}`);
            });
        } else {  
            Version(`DiscordJS v${DJSVersion}`);
        }

        const latestNodeVersion = await latestVersion('node');
        const currentNodeVersion = process.version.replace(/^v/, '');

        if (currentNodeVersion !== latestNodeVersion) {
            Version(`NodeJS ${process.version}` + `\t\t` + ` A new version is available: v${latestNodeVersion} `.bgGreen.black);
            Debug(`https://nodejs.org/dist/${latestNodeVersion}/node-${latestNodeVersion}-x64.msi`);
        } else {
            Version(`NodeJS ${process.version}`);
        }
    } catch (error) {
        Error(`Failed to check for updates: ${error.message}`);
    }
})();

client.login(process.env.TOKEN);
client.commands = new Discord.Collection();

const eventFiles = fs.readdirSync(path.resolve(__dirname, 'events')).filter(file => file.endsWith('.js'));

const verifiedEvents = [];
const missingEvents = [];
const invalidEvents = [];

const debugMode = process.env.DEBUG_MODE === 'true';
const debugModePath = path.resolve(__dirname, '..', 'data', 'debugMode.json');

if (debugMode) {
    Debug(`Debug mode is ` + `Enabled`.green);
} else {
    Debug(`Debug mode is ` + `Disabled`.red);
}

let debugConfig = { disabledEvents: [] };

if (fs.existsSync(debugModePath)) {
    const data = fs.readFileSync(debugModePath);
    debugConfig = JSON.parse(data);
} else {
    Warn('No debugMode.json found. Using an empty list of disabled events.');
}

for (const file of eventFiles) {
    try {
        const event = require(`./events/${file}`);

        if (event.name && typeof event.execute === 'function') {
            const isEventDisabledInNormal = debugConfig.disabledEvents.includes(event.name);

            if (!debugMode && isEventDisabledInNormal) {
                continue;
            }

            verifiedEvents.push(event.name);

            client.on(event.name, async (...args) => {
                try {
                    await event.execute(...args);
                } catch (error) {
                    Error(`Error executing ${event.name} in ${file}:\n${error.stack}`);
                }
            });
        } else {
            invalidEvents.push(file);
        }
    } catch (error) {
        Error(`Error loading event ${file}:\n${error.stack}`);
        missingEvents.push(file);
    }
}

if (missingEvents.length > 0) {
    Invalid(missingEvents.join('\n'));
}

if (invalidEvents.length > 0) {
    Invalid(invalidEvents.join('\n'));
}

module.exports = client;