const { guildBanRemove } = require('../../utils/logging');

module.exports = {
    name: 'guildBanRemove',
    execute(guild, user) {
        guildBanRemove(`Ban removed for user ${user.username} (${user.id}) in guild ${guild.name} (${guild.id})`);
    }
};