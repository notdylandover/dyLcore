const { EmbedBuilder } = require('discord.js');
const { codeblock } = require('./markdown');
const { format } = require('./ansi');
const { COLORS, LINKS, TEXT, TWITCHTEST, EMOJIS } = require('./constants');

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

module.exports.messageUpdateAlert = function(channel, authorAvatar, authorUsername, oldMessage, newMessage, attachmentNote) {
    return new EmbedBuilder()
        .setColor(COLORS.default)
        .setAuthor({
            name: authorUsername,
            iconURL: authorAvatar
        })
        .setTitle(`Message Updated in <#${channel}>`)
        .setDescription(
            `**Old Message**:\n` + 
            `\`\`\`\n${oldMessage}\n\`\`\`\n` + 
            `**New Message**:\n` + 
            `\`\`\`\n${newMessage}\n\`\`\`\n${attachmentNote}`
        )
        .setTimestamp()
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        });
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