const { autoModerationRuleCreate } = require('../../utils/logging');

module.exports = {
    name: 'autoModerationRuleCreate',
    execute(autoModerationRule) {
        const actions = autoModerationRule.actions;
        const client = autoModerationRule.client;
        const creatorId = autoModerationRule.creatorId;
        const enabled = autoModerationRule.enabled;
        const eventType = autoModerationRule.eventType;
        const exemptChannels = autoModerationRule.exemptChannels;
        const exemptRoles = autoModerationRule.exemptRoles;
        const guild = autoModerationRule.guild;
        const id = autoModerationRule.id;
        const name = autoModerationRule.name;
        const triggerMetadata = autoModerationRule.triggerMetadata;
        const triggerType = autoModerationRule.triggerType;

        autoModerationRuleCreate(`${guild} - ${creatorId} - Created Auto Moderation Rule -> ${name}`);
    }
};
