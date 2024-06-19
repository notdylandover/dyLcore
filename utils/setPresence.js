const { Error } = require('./logging');

// 0 - Playing
// 1 - Streaming
// 2 - Listening
// 3 - Watching
// 4 - Custom Status

module.exports = async (client) => {
    try {
        const serverCount = client.guilds.cache.size;
        client.user.setPresence({
            activities: [
                {
                    name: `Moderating ${serverCount} servers`,
                    type: 4,
                    url: 'https://twitch.tv/not_dyLn'
                }
            ],
            status: "online"
        });
    } catch (e) {
        Error(`Error updating presence: ${e.message}`);
    }
};
