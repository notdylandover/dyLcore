const { registerCommands } = require('../../utils/registerCommands');
const { Error } = require('../../utils/logging');
const { fetchAllEntitlements } = require('../../utils/entitlement');
const { fetchGameUpdates } = require('../../utils/gameUpdates');

const isLive = require('../../utils/isLive');
const setPresence = require("../../utils/setPresence");

const cron = require("node-cron");
const getBotInfo = require('../../utils/getBotInfo');

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
    'wotuh'
];

module.exports = {
    name: 'ready',
    async execute(client) {
        try {
            await setPresence(client);
            await getBotInfo(client);
            await fetchAllEntitlements(client);
            await registerCommands(client);
            fetchGameUpdates();

            cron.schedule("*/15 * * * * *", async () => {
                await isLive(client, channels);
                setPresence(client);
                fetchGameUpdates();
            });
        } catch (error) {
            return Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};