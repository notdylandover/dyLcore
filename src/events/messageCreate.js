const { attachmentDownload, messageCreate, Error, interactionCreate } = require("../../utils/logging");
const { analyzeLabels } = require("../../utils/analyzeImage");
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
            const guildId = message.guild ? message.guild.id : null;
            const allowedUserId = process.env.OWNERID;
            const commandPrefix = process.env.PREFIX;
            
            let authorFlags = message.author?.flags;
            let authorUsername = message.author ? message.author.username : "Unknown User";
            let messageContent = message.content.replace(/[\r\n]+/g, " ");

            if (guildId === null) {
                return messageCreate(`${`DM`.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
            }

            const serverDataPath = path.join(__dirname, '..', '..', 'data', 'servers', `${guildId}.json`);
            const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

            if (!serverData.activeTickets) {
                serverData.activeTickets = {};
            }

            if (serverData.activeTickets[message.channel.id]) {
                const ticket = serverData.activeTickets[message.channel.id];

                if (ticket.subject && ticket.description && ticket.priority) {
                    ticket.messages.push({ content: messageContent, author: authorUsername, timestamp: message.createdTimestamp });
                    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));
                    return;
                }

                if (!ticket.subject) {
                    ticket.subject = messageContent;
                    message.reply("Thank you! Now, please provide a detailed description of your issue.");
                    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));
                    return;
                }

                if (!ticket.description) {
                    ticket.description = messageContent;
                    message.reply("Got it! Please set the priority (Low, Medium, High, Critical).");
                    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));
                    return;
                }

                if (!ticket.priority) {
                    const priority = ["low", "medium", "high", "critical"].find(p => p.toLowerCase() === message.content.toLowerCase());
                    if (!priority) {
                        message.reply("Please enter a valid priority: Low, Medium, High, or Critical.");
                        return;
                    }
                    ticket.priority = priority;
                    ticket.status = "Created";
                    ticket.messages.push({ content: messageContent, author: authorUsername, timestamp: message.createdTimestamp });
                    message.reply("Thank you! Your ticket has been created successfully.");
                    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));
                    return;
                }
            }

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

            messageCreate(`${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);

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
                            await analyzeLabels(filePath);
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
        }
    }
};