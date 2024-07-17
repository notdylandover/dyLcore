const { Error } = require('./logging');
const { DefaultWebSocketManagerOptions: { identifyProperties } } = require("@discordjs/ws");

// Discord iOS
// Discord Android
// null = Discord Desktop 

identifyProperties.browser = 'Discord iOS';

// 0 - Playing
// 1 - Streaming
// 2 - Listening
// 3 - Watching
// 4 - Custom Status

let currentIndex = 0;

module.exports = async (client) => {
    try {
        const serverCount = client.guilds.cache.size;
        const userCount = client.users.cache.size;
        const ping = client.ws.ping;

        const statusMessages = [
            { text: `${serverCount} servers`, type: 4 },
            { text: `${userCount} users`, type: 4 },
            { text: `/help • dyLcore`, type: 4 },
            { text: `on Twitch`, type: 1 },
            { text: `${ping}ms`, type: 4 },
        ];

        const currentStatus = statusMessages[currentIndex];
        currentIndex = (currentIndex + 1) % statusMessages.length;

        client.user.setPresence({
            activities: [
                {
                    name: currentStatus.text,
                    type: currentStatus.type,
                    url: 'https://twitch.tv/not_dyLn'
                }
            ],
            status: "online"
        });
    } catch (e) {
        Error(`Error updating presence: ${e.message}`);
    }
};
