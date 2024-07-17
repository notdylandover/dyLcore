const { attachmentDownload, messageCreate, Error, Debug } = require("../../utils/logging");
const { LiveHelpTitle, LiveHelpStep1, LiveHelpStep2, LiveHelpStep3, EmbedTest } = require("../../utils/embeds");

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
        try {
            const serverName = message.guild ? message.guild.name : "Direct Message";
            const channelName = message.channel && message.channel.name ? message.channel.name : "Direct Message";

            const allowedUserId = process.env.OWNERID;

            let authorFlags;
            try {
                if (message.author) {
                    authorFlags = await message.author.fetchFlags();
                }
            } catch (error) {
                Error(`Error fetching author flags:\n${error.stack}`);
            }

            let authorUsername = "Unknown User";

            try {
                if (message.webhookID) {
                    authorUsername = message.author.username;
                } else if (message.author) {
                    authorUsername = message.author.username;
                }
            } catch (error) {
                Error(`Error determining author username:\n${error.stack}`);
            }

            let messageContent = message.content.replace(/[\r\n]+/g, " ");

            try {
                if (message.author.id === allowedUserId) {
                    if (messageContent === 'dc.restart') {
                        await message.delete();
                        await message.client.destroy();
                        return process.exit(0);
                    }

                    else if (messageContent === 'dc.livehelp') {
                        await message.delete();
                        const channel = message.channel;

                        const title = LiveHelpTitle();
                        const step1 = LiveHelpStep1();
                        const step2 = LiveHelpStep2();
                        const step3 = LiveHelpStep3();

                        return await channel.send({ embeds: [title, step1, step2, step3] });
                    }

                    else if (messageContent === 'dc.embedtest') {
                        await message.delete();
                        const channel = message.channel;
                        
                        const quoteResponse = await fetch('https://inspirobot.me/api?generate=true');
                        if (!quoteResponse.ok) throw new Error('Failed to fetch quote');

                        const quoteImageUrl = await quoteResponse.text();

                        const embed = EmbedTest(quoteImageUrl);

                        return await channel.send({ content: 'This is a test embed', embeds: [embed] });
                    }
                    
                    else if (messageContent === 'dc.clearconsole') {
                        await message.delete();
                        console.clear();
                        return Debug(message.author.username + ' cleared console');
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
                    messageCreate(`${`DM`.magenta} - ${authorUsername.cyan} - ${messageContent.white}`);
                    
                    if (!message.author.bot) { 
                        return message.reply({ content: 'Hi! In the future, this conversation will be a ticket system.', ephemeral: true });
                    }
                }

                if (message.author.system) {
                    return messageCreate(`${` SYSTEM `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
                }

                if (authorFlags && authorFlags.has('VerifiedBot')) {
                    return messageCreate(`${` ✓ APP `.bgBlue.white} - ${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
                }

                messageCreate(`${serverName.cyan} - ${"#".cyan + channelName.cyan} - ${authorUsername.cyan} - ${messageContent.white}`);
            } catch (error) {
                Error(`Error processing message content:\n${error.stack}`);
            }

            try {
                if (message.attachments.size > 0) {
                    const mediaDirPath = path.join(__dirname, "..", "..", "data", "media");
                    if (!fs.existsSync(mediaDirPath)) {
                        fs.mkdirSync(mediaDirPath, { recursive: true });
                    }

                    for (const attachment of message.attachments.values()) {
                        const fileExtension = path.extname(attachment.name);
                        const fileName = `${authorUsername}-${new Date().toISOString().split('T')[0]}-${path.basename(attachment.name, fileExtension)}${fileExtension}`;
                        const filePath = path.join(mediaDirPath, fileName);

                        try {
                            await downloadAttachment(attachment.url, filePath);
                        } catch (err) {
                            Error(`Error downloading attachment: ${err.stack}`);
                        } finally {
                            attachmentDownload(`Attachment Downloaded to ${filePath}`);
                        }
                    }
                }
            } catch (error) {
                Error(`Error processing attachments:\n${error.stack}`);
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};