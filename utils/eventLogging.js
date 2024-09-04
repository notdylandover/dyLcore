const { messageDelete, messageUpdate, guildMemberUpdateMedia, guildMemberUpdateName } = require('./embeds')
const { Error } = require('./logging');

const fs = require('fs');
const path = require('path');

const getEventLogChannel = (guildId) => {
    try {
        const settingsFilePath = path.join(__dirname, '..', 'data', guildId, 'settings.json');
        if (fs.existsSync(settingsFilePath)) {
            const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
            return settings.eventLogChannel;
        }
        return null;
    } catch (error) {
        Error(`Error fetching event log channel for guild ${guildId}:\n${error.stack}`);
        return null;
    }
};

module.exports.messageDeleteLog = async function(message) {
    try {
        if (!message.guild || message.partial) return;
        if (message.author.bot) return;

        const logChannelId = getEventLogChannel(message.guild.id);
        if (!logChannelId) return;

        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = messageDelete(message);
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        Error(`Error logging message delete:\n${error.stack}`);
    }
};

module.exports.messageUpdateLog = async function(oldMessage, newMessage) {
    try {
        const logChannelId = getEventLogChannel(newMessage.guild.id);
        if (!logChannelId) return;

        const logChannel = newMessage.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = messageUpdate(oldMessage, newMessage);
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        Error(`Error logging message delete:\n${error.stack}`);
    }
};

module.exports.guildMemberUpdateMediaLog = async function(guild, change, member, URL) {
    try {
        const logChannelId = getEventLogChannel(guild.id);
        if (!logChannelId) return;

        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = guildMemberUpdateMedia(change, member, URL);
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        Error(`Error logging message delete:\n${error.stack}`);
    }
};

module.exports.guildMemberUpdateNameLog = async function(guild, change, username, oldMemberName, newMemberName) {
    try {
        const logChannelId = getEventLogChannel(guild.id);
        if (!logChannelId) return;

        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = guildMemberUpdateName(change, username, oldMemberName, newMemberName);
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        Error(`Error logging message delete:\n${error.stack}`);
    }
};