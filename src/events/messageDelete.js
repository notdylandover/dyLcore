const { messageDelete, Error, Debug } = require('../../utils/logging');
const { messageDeleteAlert } = require('../../utils/alertEmbeds');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        try {
            let serverName = message.guild ? message.guild.name : "Direct Message";
            let channelId = message.channel ? message.channel.id : null;
            let channelName = message.channel ? message.channel.name : "Direct Message";

            if (message.partial) {
                return messageDelete(`${serverName.cyan} - ${('#' + channelName).cyan} - ${'(Deleted)'.red}`);
            }

            let authorUsername = message.author ? message.author.username : 'Unknown user';
            let authorAvatar = message.author ? message.author.displayAvatarURL() : message.author.defaultAvatarURL();
            let messageContent = message.content ? message.content.replace(/[\r\n]+/g, ' ') : '';

            if (message.embeds.length > 0) {
                messageContent += ' EMBED '.bgYellow.black;
            }

            if (message.poll) {
                const pollQuestion = message.poll.question.text.replace(/[\r\n]+/g, " ");
                const pollAnswers = message.poll.answers.map(answer => answer.text).join(', ');
                messageContent += ` POLL ${pollQuestion} - ${pollAnswers}`;
            }

            let attachmentNote = '';
            if (message.attachments.size > 0) {
                attachmentNote = '\n-# This message also included attachments that were deleted.';
            }

            if (!message.inGuild()) {
                return messageDelete(`${`DM`.magenta} - ${authorUsername.cyan} - ${messageContent.white} ${'(Deleted)'.red}`);
            }

            if (message.author && message.author.bot) {
                return messageDelete(`${serverName.cyan} - ${('#' + channelName).cyan} - ${authorUsername.cyan} - ${messageContent} ${'(Deleted)'.red}`);
            }

            messageDelete(`${serverName.cyan} - ${('#' + channelName).cyan} - ${authorUsername.cyan} - ${messageContent} ${'(Deleted)'.red}`);

            const guildId = message.guild.id;
            const settingsFilePath = path.resolve(__dirname, `../../data/servers/${guildId}.json`);

            if (!fs.existsSync(settingsFilePath)) {
                return;
            }

            const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
            const alertsChannelId = settings.alertsChannel;

            if (alertsChannelId) {
                const alertsChannel = message.guild.channels.cache.get(alertsChannelId);
                
                if (alertsChannel) {
                    const embed = messageDeleteAlert(channelId, authorAvatar, authorUsername, messageContent, attachmentNote);
                    await alertsChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};