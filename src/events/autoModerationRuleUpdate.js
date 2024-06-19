const { autoModerationRuleUpdate } = require('../../utils/logging');

module.exports = {
    name: 'autoModerationRuleDelete',
    execute(oldAutoModerationRule, newAutoModerationRule) {
        const changes = [];

        if (oldAutoModerationRule.name !== newAutoModerationRule.name) {
            changes.push(`Name changed from "${oldAutoModerationRule.name}" to "${newAutoModerationRule.name}"`);
        }
        
        if (oldAutoModerationRule.enabled !== newAutoModerationRule.enabled) {
            changes.push(`Enabled status changed from "${oldAutoModerationRule.enabled}" to "${newAutoModerationRule.enabled}"`);
        }

        autoModerationRuleUpdate(`Changes in auto-moderation rule:\n${changes.join('\n')}`);
    }
};
