const { messageDelete, Error } = require('../../utils/logging');
const { sendEmail } = require('../../utils/sendEmail');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        try {
            let serverName = message.guild ? message.guild.name : "Direct Message";
            let channelName = message.channel ? message.channel.name : "Direct Message";

            if (message.partial) {
                return messageDelete(`${serverName.cyan} - ${('#' + channelName).cyan} - ${'(Deleted)'.red}`);
            } else {
                let authorUsername = message.author ? message.author.username : 'Unknown user';
                let messageContent = message.content ? message.content.replace(/[\r\n]+/g, ' ') : '';

                if (message.embeds.length > 0) {
                    messageContent += ' EMBED '.bgRed.black;
                }

                if (message.poll) {
                    const pollQuestion = message.poll.question.text.replace(/[\r\n]+/g, " ");;
                    const pollAnswers = message.poll.answers.map(answer => answer.text).join(', ');
        
                    messageContent += ' POLL '.bgRed.black + ` ${pollQuestion.cyan} - ${pollAnswers.cyan}`;
                }

                if (!message.inGuild()) {
                    return messageDelete(`${`DM`.magenta} - ${authorUsername.cyan} - ${messageContent.white} ${'(Deleted)'.red}`);
                }

                messageDelete(`${serverName.cyan} - ${('#' + channelName).cyan} - ${authorUsername.cyan} - ${messageContent} ${'(Deleted)'.red}`);
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
            sendEmail(module.exports.name, error.stack);
        }
    }
};
