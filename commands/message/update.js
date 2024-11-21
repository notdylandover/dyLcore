const { DoneEmbed } = require('../../utils/embeds');
const { Error } = require('../../utils/logging');
const { updateLibraries } = require('../../utils/updateLibraries');
const { updateEmojis } = require('../../utils/updateEmojis');
const { registerCommands } = require('../../utils/registerCommands');

module.exports = {
    name: 'update',
    async execute(message) {
        try {
            const args = message.content.split(' ').slice(1);

            const responses = [];

            if (args.includes('libraries')) {
                message.channel.sendTyping();

                const updatedLibraries = await updateLibraries();
                const libraryUpdatesEmbed = DoneEmbed(`Finished library updates to the client\n${updatedLibraries}`);
                responses.push(libraryUpdatesEmbed);
            }

            if (args.includes('commands')) {
                message.channel.sendTyping();

                await registerCommands(message.client);
                const commandUpdatesEmbed = DoneEmbed(`Finished command updates to the client`);
                responses.push(commandUpdatesEmbed);
            }

            if (args.includes('emojis')) {
                message.channel.sendTyping();

                await updateEmojis();
                const emojiUpdatesEmbed = DoneEmbed(`Finished emoji updates to the client.`);
                responses.push(emojiUpdatesEmbed);
            }

            if (responses.length > 0) {
                await message.reply({ embeds: responses, allowedMentions: { repliedUser: false } });
            } else {
                await message.reply("No updates were requested. Please specify 'libraries' or 'emojis'.");
            }

            message.client.destroy();
            return process.exit(0);
        } catch (error) {
            message.react('❌');
            return Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};