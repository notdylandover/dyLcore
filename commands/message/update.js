const { DoneEmbed } = require('../../utils/embeds');
const { Error } = require('../../utils/logging');
const { fetchCommandCount, registerCommands } = require('../../utils/registerCommands');
const { updateLibraries } = require('../../utils/updateLibraries');
const { updateEmojis } = require('../../utils/updateEmojis');

module.exports = {
    name: 'update',
    async execute(message) {
        const { client } = message;

        try {
            // Update commands
            await client.commands.clear();

            await registerCommands(client);
            const commandCount = await fetchCommandCount(client);

            const commandUpdatesEmbed = DoneEmbed(`Pushed commands to the client\n-# ${commandCount} total commands`);
            const updateMessage = await message.reply({ embeds: [commandUpdatesEmbed], allowedMentions: { repliedUser: false }});

            // Update Libraries
            const updatedLibraries = await updateLibraries();
            const libraryUpdatesEmbed = DoneEmbed(`Finished library updates to the host\n${updatedLibraries}`);

            await updateMessage.edit({ embeds: [commandUpdatesEmbed, libraryUpdatesEmbed], allowedMentions: { repliedUser: false }});

            // Update Emojis
            await updateEmojis();
            const emojiUpdatesEmbed = DoneEmbed(`Finished emoji updates to the client.`);

            await updateMessage.edit({ embeds: [commandUpdatesEmbed, libraryUpdatesEmbed, emojiUpdatesEmbed], allowedMentions: { repliedUser: false }});
            
            // Restart Client
            message.client.destroy();
            return process.exit(0);
        } catch (error) {
            message.react('❌');
            return Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};
