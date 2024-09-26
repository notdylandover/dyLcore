const { DoneEmbed } = require('../../utils/embeds');
const { Error } = require('../../utils/logging');
const { updateLibraries } = require('../../utils/updateLibraries');
const { updateEmojis } = require('../../utils/updateEmojis');

module.exports = {
    name: 'update',
    async execute(message) {
        try {
            const updatedLibraries = await updateLibraries();
            const libraryUpdatesEmbed = DoneEmbed(`Finished library updates to the host\n${updatedLibraries}`);

            const updateMessage = await message.reply({ embeds: [libraryUpdatesEmbed], allowedMentions: { repliedUser: false }});

            await updateEmojis();
            const emojiUpdatesEmbed = DoneEmbed(`Finished emoji updates to the client.`);

            await updateMessage.edit({ embeds: [libraryUpdatesEmbed, emojiUpdatesEmbed], allowedMentions: { repliedUser: false }});
            
            message.client.destroy();
            return process.exit(0);
        } catch (error) {
            message.react('❌');
            return Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};
