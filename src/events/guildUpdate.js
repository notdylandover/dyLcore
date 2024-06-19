const { guildUpdate } = require('../../utils/logging');

module.exports = {
    name: 'guildUpdate',
    execute(oldGuild, newGuild) {
        guildUpdate(`Guild ${newGuild.name} (${newGuild.id}) updated`);
    }
};