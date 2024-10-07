async function getAutomodRules(guildId, client) {
    try {
        const guild = await client.guilds.fetch(guildId);
        const rules = await guild.autoModerationRules.fetch();

        if (!rules || rules.size === 0) {
            return [];
        }

        const automodRules = rules.map(rule => ({
            id: rule.id,
            name: rule.name,
            enabled: rule.enabled,
            triggerType: rule.triggerType,
            actions: rule.actions.map(action => ({
                type: action.type,
                metadata: action.metadata,
            })),
        }));

        return automodRules;

    } catch (error) {
        console.error(`Error fetching automod rules for guild ${guildId}:`, error);
        throw new Error('Failed to fetch automod rules.');
    }
}

module.exports = { getAutomodRules };
