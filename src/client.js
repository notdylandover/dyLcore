const { INTENTS } = require('./intents');
const { PARTIALS } = require('./partials');
const { Debug, DiscordJS, Valid, Invalid, Error, debug } = require('../utils/logging');

const Discord = require('discord.js');
const { version: DJSVersion } = Discord;

const fs = require('fs');
const path = require('path');

require('dotenv').config();

const client = new Discord.Client({
    intents: INTENTS,
    partials: PARTIALS,
});

DiscordJS(`DiscordJS v${DJSVersion}`);
client.login(process.env.TOKEN);

client.commands = new Discord.Collection();

const eventFiles = fs.readdirSync(path.resolve(__dirname, 'events')).filter(file => file.endsWith('.js'));

const verifiedEvents = [];
const missingEvents = [];
const invalidEvents = [];

for (const file of eventFiles) {
    try {
        const event = require(`./events/${file}`);
        if (event.name && typeof event.execute === 'function') {
            verifiedEvents.push(event.name);
            client.on(event.name, async (...args) => {
                try {
                    await event.execute(...args);
                } catch (error) {
                    Error(`Error executing event ${event.name}: ${error.message}`);
                }
            });
        } else {
            invalidEvents.push(file);
        }
    } catch (error) {
        Error(error.message);
        missingEvents.push(file);
    }
}

const allClientEvents = Object.keys(Discord.Client.prototype.constructor.name ? Discord.Client.prototype : Discord.Client);
const implementedEvents = new Set(verifiedEvents);

const missingClientEvents = allClientEvents.filter(event => !implementedEvents.has(event));

Valid(verifiedEvents.join('\n'));
Valid(INTENTS.join('\n'));
Valid(PARTIALS.join('\n'));

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

module.exports = client;