const { LiveHelpTitle, LiveHelpStep1, LiveHelpStep2, LiveHelpStep3 } = require("../../utils/embeds");

module.exports = {
    name: 'livehelp',
    enabled: true,
    private: true,
    async execute(message) {
        await message.delete();
        const channel = message.channel;

        const title = LiveHelpTitle();
        const step1 = LiveHelpStep1();
        const step2 = LiveHelpStep2();
        const step3 = LiveHelpStep3();

        return await channel.send({ embeds: [title, step1, step2, step3] });
    }
};