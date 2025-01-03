const { guildMemberUpdate, Error, Debug } = require('../../utils/logging');
const { memberUpdateMediaAlert } = require('../../utils/alertEmbeds');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'guildMemberUpdate',
    execute: async (oldMember, newMember) => {
        try {
            const consoleChanges = [];
            const embedChanges = [];
            const fileChanges = [];

            Debug(JSON.stringify(newMember, null, 4));

            if (oldMember.avatar !== newMember.avatar) {
                consoleChanges.push(`${newMember.user.username} updated their avatar`);
                embedChanges.push(`**<@${newMember.user.id}> updated their avatar:**`);
                fileChanges.push(newMember.displayAvatarURL({ format: 'png', size: 4096 }));
            }

            if (oldMember.banner !== newMember.banner) {
                consoleChanges.push(`${newMember.user.username} updated their banner`);
                embedChanges.push(`**<@${newMember.user.id}> updated their banner:**`);
                fileChanges.push(newMember.bannerURL({ format: 'png', size: 4096 }));
            }

            if (oldMember.displayName !== newMember.displayName) {
                consoleChanges.push(`${newMember.user.username} changed their display name: ${oldMember.displayName} → ${newMember.displayName}`);
                embedChanges.push(`**<@${newMember.user.id}> changed their display name:**\n\`\`\`${oldMember.displayName} → ${newMember.displayName}\`\`\``);
            }

            if (oldMember.globalName !== newMember.globalName) {
                consoleChanges.push(`${newMember.user.username} changed their global name: ${oldMember.globalName} → ${newMember.globalName}`);
                embedChanges.push(`**<@${newMember.user.id}> changed their global name:**\n\`\`\`${oldMember.globalName} → ${newMember.globalName}\`\`\``);
            }

            if (oldMember.user.username !== newMember.user.username) {
                consoleChanges.push(`${newMember.user.username} changed their username: ${oldMember.user.username} → ${newMember.user.username}`);
                embedChanges.push(`**<@${newMember.user.id}> changed their username:**\n\`\`\`${oldMember.user.username} → ${newMember.user.username}\`\`\``);
            }

            if (consoleChanges.length > 0) {
                guildMemberUpdate(`${(consoleChanges.join(', ')).green}`);
            
                const guildId = newMember.guild.id;
                const settingsFilePath = path.resolve(__dirname, `../../data/servers/${guildId}.json`);
            
                if (!fs.existsSync(settingsFilePath)) {
                    return;
                }
            
                const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
                const alertsChannelId = settings.alertsChannel;
            
                if (alertsChannelId) {
                    const alertsChannel = newMember.guild.channels.cache.get(alertsChannelId);
            
                    for (const url of fileChanges) {
                        const embed = memberUpdateMediaAlert(embedChanges.join('\n'), newMember.user.username, url);
                        await alertsChannel.send({ embeds: [embed] });
                    }
                }
            }
        } catch (error) {
            Error(`Error executing guildMemberUpdate event: ${error.message}`);
        }
    }
};
