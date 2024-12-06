const { Error, Debug, Info } = require('./logging');

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

module.exports = async (client) => {
    try {
        const uniqueUsers = new Set();

        client.guilds.cache.forEach(guild => {
            guild.members.cache.forEach(member => {
                uniqueUsers.add(member.user.id);
            });
        });

        const totalMembers = uniqueUsers.size;

        client.user.setPresence({
            status: 'online',
            activities: [{
                name: `${totalMembers} members`,
                type: 3,
                url: 'https://www.twitch.tv/not_dyLn'
            }]
        });
    } catch (error) {
        Error(`Error updating presence:\n${error.stack}`);
    }
};