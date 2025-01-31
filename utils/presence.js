const { Error, Debug } = require('./logging');

require('dotenv').config();

// Types
//
// 0 - Playing
// 1 - Streaming
// 2 - Listening
// 3 - Watching
// 4 - Custom Status

// Example Status:
//
// client.user.setPresence({
//     status: 'online',
//     activities: [{
//         name: 'You.',
//         type: 3,
//         url: 'https://www.twitch.tv/not_dyLn'
//     }]
// });

let presenceMode = 0;

module.exports = async (client) => {
    try {
        let totalMembers = 0;
        const totalGuilds = client.guilds.cache.size;

        if (presenceMode === 0) {
            const uniqueUsers = new Set();
            client.guilds.cache.forEach(guild => {
                guild.members.cache.forEach(member => {
                    uniqueUsers.add(member.user.id);
                });
            });
            totalMembers = uniqueUsers.size;
        }

        let activityName = '';
        let activityType = 4;

        switch (presenceMode) {
            case 0:
                activityName = `${totalMembers} users`;
                activityType = 3;
                break;
            case 1:
                activityName = `${totalGuilds} servers`;
                activityType = 3;
                break;
        }

        presenceMode = (presenceMode + 1) % 2;

        client.user.setPresence({
            status: 'online',
            activities: [{
                name: activityName,
                type: activityType,
                url: 'https://www.twitch.tv/not_dyLn'
            }]
        });
    } catch (error) {
        Error(`Error updating presence:\n${error.stack}`);
    }
};