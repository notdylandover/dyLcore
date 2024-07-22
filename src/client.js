const { INTENTS } = require('./intents');
const { PARTIALS } = require('./partials');
const { DiscordJS, Invalid, Error } = require('../utils/logging');

const isLive = require('../utils/isLive');
const setPresence = require("../utils/setPresence");
const cron = require("node-cron");
const fs = require('fs');
const path = require('path');

// require('../utils/update');
require('dotenv').config();

const Discord = require('discord.js');
const { version: DJSVersion } = Discord;

const client = new Discord.Client({ intents: INTENTS, partials: PARTIALS });

DiscordJS(`DiscordJS v${DJSVersion}`);
client.login(process.env.TOKEN);

client.commands = new Discord.Collection();

const eventFiles = fs.readdirSync(path.resolve(__dirname, 'events')).filter(file => file.endsWith('.js'));

const verifiedEvents = [];
const missingEvents = [];
const invalidEvents = [];
const channels = [
    'atuesports',
    'bunkroger',
    'cowboyblaze',
    'theladyelaine',
    'maiotheone',
    'drifloom_',
    'tkrak3n',
    'crumbdumbster',
    'not_dyln',
    'nerdyc160',
    'wotuh'
];

for (const file of eventFiles) {
    try {
        const event = require(`./events/${file}`);
        if (event.name && typeof event.execute === 'function') {
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
        Error(`Error executing ${file}: ${error.message}`);
        missingEvents.push(file);
    }
}

const allClientEvents = Object.keys(Discord.Client.prototype.constructor.name ? Discord.Client.prototype : Discord.Client);
const implementedEvents = new Set(verifiedEvents);

const missingClientEvents = allClientEvents.filter(event => !implementedEvents.has(event));

if (missingEvents.length > 0) {
    Invalid(missingEvents.join('\n'));
}

if (invalidEvents.length > 0) {
    Invalid(invalidEvents.join('\n'));
}

if (missingClientEvents.length > 0) {
    Invalid(missingClientEvents.join('\n'));
}

if (missingEvents.length > 0) {
    missingEvents.forEach(file => Invalid(file));
}

if (invalidEvents.length > 0) {
    invalidEvents.forEach(file => Invalid(file));
}

cron.schedule("*/15 * * * * *", async () => {
    setPresence(client);
    await isLive(client, channels);
});

module.exports = client;