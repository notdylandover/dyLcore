const { EmbedBuilder } = require('discord.js');
const { codeblock } = require('./markdown');
const { format } = require('./ansi');
const { COLORS, ICONS, LINKS, TEXT, TWITCHTEST } = require('./constants');

const fs = require('fs');
const path = require('path');

module.exports.StarboardMessage = function(messageAuthor, authorAvatar, messageContent, reactionCount, messageLink) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setAuthor({
            name: messageAuthor,
            iconURL: authorAvatar
        })
        .setDescription(
            `${messageContent}\n\n` +
            `⭐ ${reactionCount}\n\n` +
            `-# [Go to message](${messageLink})`
        )
};

module.exports.EmbedTest = async function(URL) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.test)
        .setTitle(`This is a title`)
        .setURL('https://dylandover.dev')
        .setAuthor({
            name: 'This is author text with an icon and URL shortcut',
            iconURL: LINKS.brand,
            url: 'https://dylandover.dev'
        })
        .setDescription('This is a description')
        .setImage(URL)
        .setFooter({
            iconURL: LINKS.brand,
            text: 'This is footer text with an icon'
        })
}

module.exports.LiveHelpTitle = function() {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle(`How to automatically notify this channel when you go live:`)
}

module.exports.LiveHelpStep1 = function() {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle(`1. Link your Twitch account to Discord:`)
        .setDescription(`> ${ICONS.gear} User Settings → ${ICONS.chain} Connections → ${ICONS.twitch} Twitch`)
        .setImage(TWITCHTEST.LinkTwitch)
}

module.exports.LiveHelpStep2 = function() {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle(`2. Receive the Linked Role on this server:`)
        .setDescription(`> ${ICONS.down} Server Header (*Top Left*) → ${ICONS.chain} Linked Roles → ${ICONS.twitch} Twitch`)
        .setImage(TWITCHTEST.LinkRole)
}

module.exports.LiveHelpStep3 = function() {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle(`3. Done!`)
        .setDescription(`**Please note that I have to manually give <@${TEXT.appid}> your Twitch username.*`)
}

module.exports.JSONEmbed = function(fields) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`\`\`\`json\n${fields}\n\`\`\``)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
};

module.exports.DetailedHelpEmbed = function(title, description, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${title}\n\n` + `${description}\n` + `${message}`)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
};

module.exports.HelpEmbed = function(title, description, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${title}\n\n` + `${description}\n\n` + `${message}`)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
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

module.exports.CodeEmbed = function(output) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`\`\`\`\n${output}\n\`\`\``)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand + ' • CodeX'
        });
};

module.exports.InspireEmbed = function(URL) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setImage(URL)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand + ' • InspiroBot'
        })
};

module.exports.LiveEmbed = function(streamInfo) {
    return new EmbedBuilder()
        .setColor(COLORS.twitch)
        .setAuthor({
            name: `${streamInfo.username} is live!`
        })
        .setThumbnail(streamInfo.avatarURL)
        .setTitle(streamInfo.title)
        .setURL(`https://twitch.tv/${streamInfo.username}`)
        .addFields(
            { name: 'Game', value: streamInfo.category, inline: true },
            { name: 'Viewers', value: streamInfo.viewers.toString(), inline: true },
        )
        .setImage(streamInfo.thumbnailURL)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand + ' • Twitch'
        })
};

module.exports.UserEmbed = function(userTag, userId, highestRole, badges, createdTimestamp, joinedTimestamp, avatarURL, bannerURL) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(
            `${ICONS.user} **@${userTag}**\n\` ${userId} \`\n`
        )
        .addFields(
            {
                name: `${ICONS.calendar} **Dates**`,
                value: `**Joined Discord**: ${createdTimestamp}\n` + `**Joined server**: ${joinedTimestamp}\n`
            },
        )
        .addFields(
            {
                name: `${ICONS.users} **Highest Role**`,
                value: `\` ${highestRole} \``,
                inline: true
            },

            {
                name: `${ICONS.users} **Badges**`,
                value: badges,
                inline: true
            },
        )
        .setThumbnail(avatarURL)
        .setImage(bannerURL)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
};

module.exports.ServerEmbed = function(guildName, guildId, roles, userCount, emojiCount, stickerCount, guildDescription, guildIcon, guildBanner, guildOwner, formattedGuildCreatedAt, features, channels) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(
            `${ICONS.home} **${guildName}** \` ${guildId} \`\n` +
            `${ICONS.users} \` ${userCount} \` ${ICONS.user} \` ${roles} \`\n` +
            `${ICONS.emoji} \` ${emojiCount} \` ${ICONS.sticker} \` ${stickerCount} \`\n` +
            `${ICONS.crown} ${guildOwner}\n` +
            `${guildDescription}\n`
        )
        .addFields(
            {
                name: ' ',
                value: `${ICONS.calendar} **Server Created**: ${formattedGuildCreatedAt}\n`
            },
        )
        .addFields(
            {
                name: `${ICONS.hashtag} **Channels**`,
                value: channels
            },
        )
        .addFields(
            {
                name: `${ICONS.home} **Features**`,
                value: features
            },
        )
        .setThumbnail(guildIcon)
        .setImage(guildBanner)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
};

module.exports.MediaEmbed = function(URL) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setImage(URL)
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
};

module.exports.PingEmbed = function(ws, rest, wscolor) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`
            ${ICONS.globe} **Pong!**\n` + 
            codeblock("ansi",
                [
                    `REST\t\t${format(`${rest}ms`, "m")}`,
                    `WebSocket   ${format(`${ws}ms`, wscolor)}`
                ]
            )
        )
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
};

module.exports.PolicyEmbed = function() {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`-# For more information about the privacy policy, please refer to the [Privacy Policy](https://dylandover.dev/privacypolicy).`)
};

module.exports.LoadingPingEmbed = function() {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`
            ${ICONS.globe} **Pong!**\n` +
            `\`\`\`ansi\n` +
            `REST API\tLoading...\n` +
            `WebSocket   Loading...\n` +
            `\`\`\``
        )
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
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

module.exports.BallEmbed = function(author, question, result) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setAuthor({
            name: `${author.tag}: ${question}`,
            iconURL: author.displayAvatarURL()
        })
        .setDescription(`# 🎱 ${result}`)
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
            `${ICONS.clock} **Uptime**: \` ${uptime} \`\n`
        )
        .setFooter({
            iconURL: LINKS.brand,
            text: TEXT.brand
        })
};

module.exports.RestartEmbed = function(message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${ICONS.restart} **${message}**`)
};

module.exports.LoadingEmbed = function(title, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${ICONS.loading} **${title}**\n` + message)
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
            text: TEXT.brand
        })
};

module.exports.ErrorEmbed = function(title, message) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`${ICONS.xmark} **${title}**\n` + `\`\`\`\n${message}\n\`\`\``)
};