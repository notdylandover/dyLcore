const { registerCommands } = require('../../utils/registerCommands');
const { ready, Error, Debug } = require('../../utils/logging');
const setPresence = require('../../utils/setPresence');

const { WebSocketManager } = require('@discordjs/ws');

module.exports = {
    name: 'ready',
    async execute(client) {
        try {
            await registerCommands(client);
            setPresence(client);
        } catch (error) {
            return Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};