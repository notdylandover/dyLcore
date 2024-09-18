const { messageUpdate, Error } = require('../../utils/logging');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        try {
            if (newMessage.partial) await newMessage.fetch();
            if (oldMessage.partial) await oldMessage.fetch();

            let server = newMessage.guild ? newMessage.guild.name : "Direct Message";
            let channel = newMessage.channel ? newMessage.channel.name : "Direct Message";
            let globalUsername = newMessage.author.tag;
            let oldmessageContent = oldMessage ? oldMessage.content.replace(/[\r\n]+/g, ' ') : " ";
            let newmessageContent = newMessage.content.replace(/[\r\n]+/g, ' ');

            if (oldMessage.partial) {
                return; // TODO: Figure out a way to bypass bot partial messages
                oldmessageContent = ' PARTIAL '.bgCyan.red;
            }

            if (oldMessage.author.bot) {
                return;
            }

            if (oldMessage.embeds.length > 0) {
                oldmessageContent += ' EMBED '.bgYellow.black;
            }

            if (newMessage.embeds.length > 0) {
                newmessageContent += ' EMBED '.bgYellow.black;
            }

            messageUpdate(`${server.cyan} - ${('#' + channel).cyan} - ${globalUsername.cyan} - ${oldmessageContent} -> ${newmessageContent.green} (Updated)`);
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};
