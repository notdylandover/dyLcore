const { registerCommands } = require('../../utils/registerCommands');
const { Error } = require('../../utils/logging');
const { applyBirthdayRoles } = require('../../utils/birthday');

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
            await getBotInfo(client);
            await registerCommands(client);
            setPresence(client);

            cron.schedule('*/15 * * * *', () => {
                applyBirthdayRoles(client);
            });
            
            cron.schedule("*/15 * * * * *", async () => {
                setPresence(client);
                await isLive(client, channels);
            });
        } catch (error) {
            return Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};