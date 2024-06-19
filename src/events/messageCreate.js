const { attachmentDownload, messageCreate, Error, Debug, Info } = require("../../utils/logging");
const fs = require("fs");
const path = require("path");

async function downloadAttachment(url, filename) {
    const fetch = await import('node-fetch').then(mod => mod.default);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(arrayBuffer));
}

module.exports = {
    name: "messageCreate",
    async execute(message) {
        const serverName = message.guild ? message.guild.name : "Direct Message";
        const channelName = message.channel && message.channel.name ? message.channel.name : "Direct Message";

        let authorFlags;
        if (message.author) {
            authorFlags = await message.author.fetchFlags();
        }

        let authorUsername = "Unknown User";

        if (message.webhookID) {
            authorUsername = message.author.username;
        } else if (message.author) {
            authorUsername = message.author.username;
        }

        let messageContent = message.content.replace(/[\r\n]+/g, " ");

        if (message.embeds.length > 0) {
            messageContent += ' EMBED '.bgYellow.black;
        }

        if (message.poll) {
            const pollQuestion = message.poll.question.text.replace(/[\r\n]+/g, " ");;
            const pollAnswers = message.poll.answers.map(answer => answer.text).join(', ');

            messageContent += ' POLL '.bgMagenta.black + ` ${pollQuestion.cyan} - ${pollAnswers.cyan} `;
        }

        if (!message.inGuild()) {
            return messageCreate( `${`DM`.magenta} - ${authorUsername.cyan} - ${messageContent.white}` );
        }

        if (message.author.system) {
            return messageCreate( `${` SYSTEM `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}` );
        }

        if (authorFlags && authorFlags.has('VerifiedBot')) {
            return messageCreate( `${` ✓ APP `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}` );
        }

        if (message.author.bot) {
            return messageCreate( `${` APP `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}` );
        }

        messageCreate(`${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);

        if (message.attachments.size > 0) {
            const mediaDirPath = path.join(__dirname, "..", "..", "data", "media");
            if (!fs.existsSync(mediaDirPath)) {
                fs.mkdirSync(mediaDirPath, { recursive: true });
            }

            message.attachments.forEach(async (attachment) => {
                const fileExtension = path.extname(attachment.name);
                const fileName = `${authorUsername}-${new Date().toISOString().split('T')[0]}-${path.basename(attachment.name, fileExtension)}${fileExtension}`;
                const filePath = path.join(mediaDirPath, fileName);
                
                try {
                    await downloadAttachment(attachment.url, filePath);
                } catch (err) {
                    Error(`Error downloading attachment: ${err.message}`);
                } finally {
                    attachmentDownload(`Attachment Downloaded to ${filePath}`);
                }
            });
        }
    },
};