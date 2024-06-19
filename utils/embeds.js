const { EmbedBuilder } = require('discord.js');
const { codeblock } = require('./markdown');
const { format } = require('./ansi');
const { COLORS, ICONS, LINKS, TEXT } = require('./constants');

const fs = require('fs');
const path = require('path');

module.exports.JSONEmbed = function(fields) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`\`\`\`json\n${fields}\n\`\`\``)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.DetailedHelpEmbed = function(title, description, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${title}\n\n` + `${description}\n` + `${message}`)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.HelpEmbed = function(title, description, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${title}\n\n` + `${description}\n\n` + `${message}`)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.UpdateEmbed = function() {
    const updateNotesPath = path.join(__dirname, '..', 'updateNotes.md');
    const updateNotes = fs.readFileSync(updateNotesPath, 'utf8');

    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(updateNotes)
};

module.exports.FileEmbed = function(fileSize, timeTook) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`Size: ${fileSize}MB • Took ${timeTook}s`)
};

module.exports.DetailsEmbed = function(userTag, userId, highestRole, badges, createdTimestamp, joinedTimestamp, avatarURL, bannerURL) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(
            `${ICONS.member} **@${userTag}**\n\` ${userId} \`\n`
        )
        .addFields(
            {
                name: `${ICONS.calendar} **Dates**`,
                value: `**Joined Discord**: ${createdTimestamp}\n` + `**Joined server**: ${joinedTimestamp}\n`
            },
        )
        .addFields(
            {
                name: `${ICONS.members} **Highest Role**`,
                value: `\` ${highestRole} \``,
                inline: true
            },

            {
                name: `${ICONS.members} **Badges**`,
                value: badges,
                inline: true
            },
        )
        .setThumbnail(avatarURL)
        .setImage(bannerURL)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.MediaEmbed = function(URL) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setImage(URL)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.PingEmbed = function(ws, rest, wscolor) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${ICONS.globe} **Pong!**\n` + codeblock("ansi", [`rest\t\t${format(`${rest}ms`, "m")}`, `websocket   ${format(`${ws}ms`, wscolor)}`]))
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.CoinflipEmbed = function(result) {
    let emoji;

    if (result === 'Heads') {
        emoji = ICONS.heads;
    } else if (result === 'Tails') {
        emoji = ICONS.tails;
    }

    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`# ${emoji} ${result}`)
};

module.exports.Leaderboard = function(title, description, fields) {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    
    const formattedTitle = title
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');

    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle(`${ICONS.trophy} ${formattedTitle}`)
        .setDescription(description)
        .addFields(fields)
};

module.exports.StatsEmbed = function(serverCount, shardCount, uptime) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(
            `${ICONS.home} **Server Count**: \` ${serverCount} \`\n` +
            `${ICONS.shard} **Shard Count**: \` ${shardCount} \`\n` +
            `${ICONS.clock} **Uptime**: \` ${uptime} \`\n` +
            `${ICONS.github} **Version**: \` ${TEXT.version} \``
        )
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.RestartEmbed = function(message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${ICONS.restart} **${message}**`)
};

module.exports.LoadingEmbed = function(title) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${ICONS.loading} **${title}**`)
};

module.exports.SuccessEmbed = function(title, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.done)
        .setDescription(`${ICONS.checkmark} **${title}**\n` + `${message}`)
};

module.exports.InfoEmbed = function(info) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(info)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.botname
        })
};

module.exports.ErrorEmbed = function(title, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`${ICONS.xmark} **${title}**\n` + `\`\`\`\n${message}\n\`\`\``)
};