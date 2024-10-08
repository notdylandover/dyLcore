const { INTENTS } = require('./intents');
const { PARTIALS } = require('./partials');
const { DiscordJS, Invalid, Error, Warn } = require('../utils/logging');
const startServer = require('../utils/server');

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Discord = require('discord.js');
const { version: DJSVersion } = Discord;

const client = new Discord.Client({ intents: INTENTS, partials: PARTIALS });

startServer(client);

DiscordJS(`DiscordJS v${DJSVersion}`);
client.login(process.env.TOKEN);

client.commands = new Discord.Collection();

const eventFiles = fs.readdirSync(path.resolve(__dirname, 'events')).filter(file => file.endsWith('.js'));

const verifiedEvents = [];
const missingEvents = [];
const invalidEvents = [];

const debugMode = process.env.DEBUG_MODE === 'true';
const debugModePath = path.resolve(__dirname, '..', 'data', 'debugMode.json');

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
            const isEventInDebugList = debugConfig.disabledEvents.includes(event.name);

            if (debugMode && isEventInDebugList) {
                continue;
            }

            verifiedEvents.push(event.name);

            client.on(event.name, async (...args) => {
                try {
                    await event.execute(...args);
                } catch (error) {
                    Error(`Error executing ${event.name}: ${error.message}`);
                }
            });
        } else {
            invalidEvents.push(file);
        }
    } catch (error) {
        Error(`Error loading event ${file}: ${error.message}`);
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