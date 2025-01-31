const { EmbedBuilder } = require('discord.js');
const { COLORS, LINKS, TEXT } = require('./constants');

module.exports.messageDeleteAlert = function(channel, authorAvatar, authorUsername, message, attachmentNote) {
    return new EmbedBuilder()
        .setColor(COLORS.default)
        .setAuthor({
            name: authorUsername,
            iconURL: authorAvatar
        })
        .setTitle(`Message Deleted in <#${channel}>`)
        .setDescription(`\`\`\`\n${message}\n\`\`\`${attachmentNote}`)
        .setTimestamp()
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        });
};

module.exports.messageUpdateAlert = function(messageLink, channel, authorAvatar, authorUsername, oldMessage, newMessage, attachmentNote) {
    return new EmbedBuilder()
        .setColor(COLORS.default)
        .setAuthor({
            name: authorUsername,
            iconURL: authorAvatar
        })
        .setTitle(`Message Updated in <#${channel}>`)
        .setDescription(
            `[\` Jump to Message \`](${messageLink})\n\n` +
            `**Old Message**:\n` + 
            `\`\`\`\n${oldMessage} \n\`\`\`\n` + 
            `**New Message**:\n` + 
            `\`\`\`\n${newMessage} \n\`\`\`\n${attachmentNote}`
        )
        .setTimestamp()
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        });
};


module.exports.memberUpdateMediaAlert = function(change, username, URL) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setAuthor({
            name: username,
            iconURL: URL
        })
        .setDescription(change)
        .setImage(URL)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
        .setTimestamp()
};

module.exports.memberUpdateAlert = function(newMember, changes, attachmentNote) {
    return new EmbedBuilder()
        .setColor(COLORS.default)
        .setAuthor({
            name: newMember.user.username,
            iconURL: newMember.displayAvatarURL()
        })
        .setDescription(`${changes.join('\n')}\n${attachmentNote}`)
        .setTimestamp()
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        });
};