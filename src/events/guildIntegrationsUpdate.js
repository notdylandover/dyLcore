const { guildIntegrationsUpdate } = require('../../utils/logging');

module.exports = {
    name: 'guildIntegrationsUpdate',
    execute(guild) {
        guildIntegrationsUpdate(`Integrations updated for guild: ${guild.name} (${guild.id})`);
    }
};