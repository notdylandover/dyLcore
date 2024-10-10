const { EmbedBuilder } = require('discord.js');
const { codeblock } = require('./markdown');
const { format } = require('./ansi');
const { COLORS, LINKS, TEXT, TWITCHTEST, EMOJIS } = require('./constants');

module.exports.PremiumFileEmbed = function(timeTook) {
    return embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`${EMOJIS.ico_clock} Took ${timeTook}s`)
        .setFooter({
            iconURL: LINKS.premium,
            text: TEXT.premium
        })
};