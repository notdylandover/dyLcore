const { guildMemberUpdate, Error, Debug } = require('../../utils/logging');
const { memberUpdateAlert } = require('../../utils/alertEmbeds');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'guildMemberUpdate',
    execute: async (oldMember, newMember) => {
        const consoleChanges = [];
        const embedChanges = [];
        const fileChanges = [];

        let attachmentNote = '';

        if (oldMember.avatar !== newMember.avatar) {
            consoleChanges.push(`${newMember.user.username} updated their avatar`);
            embedChanges.push(`**${newMember.user.username} updated their avatar:**`);
            fileChanges.push(newMember.displayAvatarURL({ format: 'png', size: 4096 }));
        }

        if (oldMember.banner !== newMember.banner) {
            consoleChanges.push(`${newMember.user.username} updated their banner`);
            embedChanges.push(`**${newMember.user.username} updated their banner:**`);
            fileChanges.push(newMember.bannerURL({ format: 'png', size: 4096 }));
        }

        if (oldMember.displayName !== newMember.displayName) {
            consoleChanges.push(`${newMember.user.username} changed their display name: ${oldMember.displayName} → ${newMember.displayName}`);
            embedChanges.push(`**Changed their display name:**\n\`\`\`${oldMember.displayName} → ${newMember.displayName}\`\`\``);
        }

        if (oldMember.globalName !== newMember.globalName) {
            consoleChanges.push(`${newMember.user.username} changed their global name: ${oldMember.globalName} → ${newMember.globalName}`);
            embedChanges.push(`**Changed their global name:**\n\`\`\`${oldMember.globalName} → ${newMember.globalName}\`\`\``);
        }

        if (oldMember.user.username !== newMember.user.username) {
            consoleChanges.push(`${newMember.user.username} changed their username: ${oldMember.user.username} → ${newMember.user.username}`);
            embedChanges.push(`**Changed their username:**\n\`\`\`${oldMember.user.username} → ${newMember.user.username}\`\`\``);
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

            if (fileChanges.length > 0) {
                attachmentNote = `\n-# There are attachments on this message.`;
            }

            if (alertsChannelId) {
                const alertsChannel = newMember.guild.channels.cache.get(alertsChannelId);

                const embed = memberUpdateAlert(newMember, embedChanges, attachmentNote);
                await alertsChannel.send({ embeds: [embed], files: fileChanges });
            }
        }
    }
};
