const { messageUpdate, Error, Debug } = require('../../utils/logging');
const { messageUpdateAlert } = require('../../utils/alertEmbeds');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        try {
            if (newMessage.partial) await newMessage.fetch();
            if (oldMessage.partial) await oldMessage.fetch();

            if (newMessage.author && newMessage.author.bot) {
                return;
            }

            if (newMessage.embeds.length > 0) {
                return;
            }

            let serverName = newMessage.guild ? newMessage.guild.name : "Direct Message";
            let channelId = newMessage.channel ? newMessage.channel.id : null;
            let channelName = newMessage.channel ? newMessage.channel.name : "Direct Message";
            let globalUsername = newMessage.author.tag;
            let authorAvatar = newMessage.author ? newMessage.author.displayAvatarURL() : newMessage.author.defaultAvatarURL();

            let oldMessageContent = oldMessage ? oldMessage.content.replace(/[\r\n]+/g, ' ') : "[No Content]";
            let newMessageContent = newMessage ? newMessage.content.replace(/[\r\n]+/g, ' ') : "[No Content]";

            if (oldMessage.embeds.length > 0) {
                oldMessageContent += ' EMBED '.bgYellow.black;
            }
            if (newMessage.embeds.length > 0) {
                newMessageContent += ' EMBED '.bgYellow.black;
            }

            if (oldMessageContent === newMessageContent && oldMessage.embeds.length === newMessage.embeds.length) {
                return;
            }

            let attachmentNote = '';

            if (oldMessage.attachments.size > 0 && newMessage.attachments.size === 0) {
                attachmentNote = '\n-# This message had attachments.';
            }

            if (newMessage.attachments.size > 0 && oldMessage.attachments.size === 0) {
                attachmentNote += '\n-# This message has attachments.';
            }

            messageUpdate(`${serverName.cyan} - ${('#' + channelName).cyan} - ${globalUsername.cyan} - ${oldMessageContent} -> ${newMessageContent.green} (Updated)`);

            const guildId = newMessage.guild.id;
            const settingsFilePath = path.resolve(__dirname, `../../data/servers/${guildId}.json`);

            if (!fs.existsSync(settingsFilePath)) {
                return;
            }

            const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
            const alertsChannelId = settings.alertsChannel;

            if (alertsChannelId) {
                const alertsChannel = newMessage.guild.channels.cache.get(alertsChannelId);
                
                if (alertsChannel) {
                    const messageLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;
                    const embed = messageUpdateAlert(messageLink, channelId, authorAvatar, globalUsername, oldMessageContent, newMessageContent, attachmentNote);
                    await alertsChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};