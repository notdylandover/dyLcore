const { Debug } = require("../../utils/logging");

module.exports = {
    name: 'clearconsole',
    enabled: true,
    private: true,
    async execute(message) {
        await message.react('✅');
        console.clear();
        return Debug('Console cleared by ' + message.author.username);
    }
};