const { autoModerationActionExecutionLog } = require('../../utils/logging');

module.exports = {
    name: 'autoModerationActionExecution',
    execute(autoModerationActionExecution) {
        const action = autoModerationActionExecution.action;
        const alertSystemMessageId = autoModerationActionExecution.alertSystemMessageId;
        const autoModerationRule = autoModerationActionExecution.autoModerationRule;
        const channel = autoModerationActionExecution.channel;
        const channelId = autoModerationActionExecution.channelId;
        const content = autoModerationActionExecution.content;
        const guild = autoModerationActionExecution.guild.name;
        const matchedContent = autoModerationActionExecution.matchedContent;
        const matchedKeyword = autoModerationActionExecution.matchedKeyword;
        const member = autoModerationActionExecution.member;
        const messageId = autoModerationActionExecution.messageId;
        const ruleId = autoModerationActionExecution.ruleId;
        const ruleTriggerType = autoModerationActionExecution.ruleTriggerType;
        const user = autoModerationActionExecution.user;
        const userId = autoModerationActionExecution.userId;

        let actionType;

        if (action.type === 1) {
            actionType = 'Blocked Message';
        } else if (action.type === 2) {
            actionType = 'Sent Alert Message';
        } else if (action.type === 3) {
            actionType = 'Timed out Member';
        } else {
            actionType = 'Unknown';
        }

        autoModerationActionExecutionLog(`${guild.bgRed} - ${('#' + channel.name).bgRed} - ${user.username.bgRed} - ${content.bgRed} ${('(' + actionType + ')').black}`);
    }
};