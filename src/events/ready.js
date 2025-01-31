const { registerCommands } = require('../../utils/registerCommands');
const { Debug, Error } = require('../../utils/logging');
const { fetchAllEntitlements } = require('../../utils/entitlement');
const { fetchGameUpdates } = require('../../utils/gameUpdates');
const { afkJoinTimes } = require('../../utils/afkTracker');

const isLive = require('../../utils/isLive');
const setPresence = require("../../utils/presence");

const cron = require("node-cron");

module.exports = {
    name: 'ready',
    async execute(client) {
        try {
            await setPresence(client);
            await fetchAllEntitlements(client);
            await registerCommands(client);
            await fetchGameUpdates(client);

            cron.schedule("*/10 * * * * *", async () => {
                await setPresence(client);
                await isLive(client);
                await fetchGameUpdates(client);
            });

            cron.schedule("*/1 * * * *", async () => {
                const now = Date.now();

                const threshold = 10 * 60000; // 10 Minutes

                for (const [key, joinTime] of afkJoinTimes.entries()) {
                    if (now - joinTime > threshold) {
                        const [guildId, memberId] = key.split('-');
                        const guild = client.guilds.cache.get(guildId);
                        if (guild) {
                            const member = guild.members.cache.get(memberId);

                            if (member && member.voice && member.voice.channel && member.voice.channel.id === guild.afkChannelId) {
                                try {
                                    Debug(`Disconnecting ${member.user.tag} from AFK channel (idle too long)`);
                                    await member.voice.disconnect();
                                } catch (error) {
                                    Error(`Error disconnecting AFK member ${member.user.tag}: ${error.message}`);
                                }
                            }
                        }

                        afkJoinTimes.delete(key);
                    }
                }
            });
        } catch (error) {
            return Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};