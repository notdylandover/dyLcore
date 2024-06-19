const { messageUpdate } = require('../../utils/logging');

module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage) {
        try {
            let server = newMessage.guild ? newMessage.guild.name : "Direct Message";
            let channel = newMessage.channel ? newMessage.channel.name : "Direct Message";
            let globalUsername = newMessage.author.tag;
            let messageContent = newMessage.content.replace(/[\r\n]+/g, ' ');

            if (newMessage.embeds.length > 0) {
                messageContent += ' EMBED '.bgYellow.black;
            }

            messageUpdate(`${server.cyan} - ${('#' + channel).cyan} - ${globalUsername.cyan} - ${messageContent.yellow} (Updated)`);
        } catch (error) {
            console.error(error);
        }
    }
};