const { Debug, CommandError } = require('../../utils/logging');

module.exports = {
    name: 'react',
    async execute(message) {
        const args = message.content.split(' ').slice(1);
        if (args.length !== 2) {
            return await message.react('❌');
        }

        const messageId = args[0];
        const emoteId = args[1];

        try {
            const targetMessage = await message.channel.messages.fetch(messageId);
            if (!targetMessage) {
                return await message.react('❌');
            }

            const emote = message.guild.emojis.cache.get(emoteId);
            if (!emote) {
                return await message.react('❌');
            }

            await targetMessage.react(emote);
            Debug(`Reacted to message ${messageId} with emote ${emote.name}`);
            return await message.delete();
        } catch (error) {
            CommandError('react', error.stack);
            return await message.react('❌');
        }
    }
};