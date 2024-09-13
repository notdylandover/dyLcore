const { attachmentDownload, messageCreate, Error, interactionCreate } = require("../../utils/logging");
const { sendEmail } = require('../../utils/sendEmail');

const fs = require("fs");
const path = require("path");

async function downloadAttachment(url, filename) {
    const fetch = await import('node-fetch').then(mod => mod.default);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(arrayBuffer));
}

function loadCommands(dir) {
    const commands = new Map();
    const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(dir, file));
        commands.set(command.name, command);
    }

    return commands;
}

const messageCommands = loadCommands(path.join(__dirname, '..', '..', 'commands', 'message'));

module.exports = {
    name: "messageCreate",
    async execute(message) {
        try {
            const serverName = message.guild ? message.guild.name : "Direct Message";
            const channelName = message.channel && message.channel.name ? message.channel.name : "Direct Message";

            const allowedUserId = process.env.OWNERID;
            const commandPrefix = process.env.PREFIX;

            let authorFlags = message.author?.flags;
            let authorUsername = message.author ? message.author.username : "Unknown User";

            let messageContent = message.content.replace(/[\r\n]+/g, " ");

            try {
                if (message.author && message.author.id === allowedUserId) {
                    if (messageContent.startsWith(commandPrefix)) {
                        const commandName = messageContent.slice(commandPrefix.length).split(' ')[0];
                        const command = messageCommands.get(commandName);
                        interactionCreate(`${serverName.cyan} - ${('#' + channelName).cyan} - ${authorUsername.cyan} - ${messageContent.magenta}`);

                        if (command) {
                            return await command.execute(message);
                        } else {
                            message.react('❔');
                        }
                    }
                }
            } catch (error) {
                Error(`Error processing owner commands:\n${error.stack}`);
            }

            try {
                if (message.embeds.length > 0) {
                    messageContent += ' EMBED '.bgYellow.black;
                }

                if (message.poll) {
                    const pollQuestion = message.poll.question.text.replace(/[\r\n]+/g, " ");
                    const pollAnswers = message.poll.answers.map(answer => answer.text).join(', ');

                    messageContent += ' POLL '.bgMagenta.black + ` ${pollQuestion.cyan} - ${pollAnswers.cyan} `;
                }

                if (!message.inGuild()) {
                    return messageCreate(`${`DM`.magenta} - ${authorUsername.cyan} - ${messageContent.white}`);
                }
    
                if (message.author.system) {
                    return messageCreate(`${` SYSTEM `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
                }
    
                if (message.author.bot && authorFlags.has('VerifiedBot')) {
                    return messageCreate(`${` ✓ APP `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
                }
    
                if (message.author.bot && !authorFlags.has('VerifiedBot')) {
                    return messageCreate(`${` APP `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
                }
    
                if (message.webhookId > 0) {
                    return messageCreate(`${` WEBHOOK `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
                }

                messageCreate(`${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
            } catch (error) {
                Error(`Error processing message content:\n${error.stack}`);
            }

            if (message.attachments.size > 0) {
                try {
                    const mediaDirPath = path.join(__dirname, "..", "..", "data", "media");
                    if (!fs.existsSync(mediaDirPath)) {
                        fs.mkdirSync(mediaDirPath, { recursive: true });
                    }

                    for (const attachment of message.attachments.values()) {
                        const fileExtension = path.extname(attachment.name);
                        const sanitizedFilename = attachment.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                        const fileName = `${message.author.username}-${new Date().toISOString().split('T')[0]}-${path.basename(sanitizedFilename, fileExtension)}${fileExtension}`;
                        const filePath = path.join(mediaDirPath, fileName);

                        try {
                            attachmentDownload(`Downloading attachment to ${filePath}`);
                            await downloadAttachment(attachment.url, filePath);
                        } catch (err) {
                            Error(`Error processing attachment: ${err.stack}`);
                        }
                    }
                } catch (error) {
                    Error(`Error processing attachments:\n${error.stack}`);
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
            sendEmail(module.exports.name, error.stack);
        }
    }
};