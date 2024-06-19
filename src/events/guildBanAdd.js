const { guildBanAdd } = require('../../utils/logging');

module.exports = {
    name: 'guildBanAdd',
    execute(guild, user) {
        guildBanAdd(`User ${user.username} (${user.id}) banned from guild ${guild.name} (${guild.id})`);
    }
};