const { Error } = require('./logging');
const { DefaultWebSocketManagerOptions: { identifyProperties } } = require("@discordjs/ws");

require('dotenv').config();

// Discord iOS
// Discord Android
// null = Discord Desktop 

identifyProperties.browser = 'Discord iOS';

// 0 - Playing
// 1 - Streaming
// 2 - Listening
// 3 - Watching
// 4 - Custom Status

module.exports = async (client) => {
    try {
        client.user.setPresence({
            status: 'online'
        });
    } catch (error) {
        Error(`Error updating presence:\n${error.stack}`);
    }
};