const { registerCommands } = require('../../utils/registerCommands');
const { Error } = require('../../utils/logging');
const { fetchAllEntitlements } = require('../../utils/entitlement');
const { fetchGameUpdates } = require('../../utils/gameUpdates');

const isLive = require('../../utils/isLive');
const setPresence = require("../../utils/presence");

const cron = require("node-cron");

const channels = [
    'atuesports',
    'bunkroger',
    'cowboyblaze',
    'theladyelaine',
    'maio_streams',
    'drifloom_',
    'tkrak3n',
    'crumbdumbster',
    'not_dyLn',
    'nerdyc160',
    'wotuh',
    'tbucket2314'
];

module.exports = {
    name: 'ready',
    async execute(client) {
        try {
            await setPresence(client);
            await fetchAllEntitlements(client);
            await registerCommands(client);
            await fetchGameUpdates(client);

            cron.schedule("*/10 * * * * *", async () => {
                await isLive(client, channels);
                await setPresence(client);
                await fetchGameUpdates(client);
            });
        } catch (error) {
            return Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};