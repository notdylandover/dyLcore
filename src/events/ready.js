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

            cron.schedule("*/10 * * * * *", async () => {
                const now = Date.now();

                const threshold = 10 * 60000;

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
                                    if (member.id == '351068799493210113' || member.id == '458854676557856790') {
                                        await member.send('<:fuckyou:1337159479384473601>');
                                    } else {
                                        await member.send(`Hi ${member.user.displayName}, I've disconnected you from the AFK channel in ${guild.name} due to longer inactivity.`);
                                    }
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