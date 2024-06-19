const { guildAuditLogEntryCreate } = require('../../utils/logging');

module.exports = {
    name: 'guildAuditLogEntryCreate',
    execute(auditLogEntry, guild) {
        const server = guild.name;
        const actionType = auditLogEntry.actionType;
        const executor = auditLogEntry.executor.username;
        const target = auditLogEntry.target ? auditLogEntry.target.username : null;
        const targetType = auditLogEntry.targetType;

        guildAuditLogEntryCreate(`${server} - ${executor} - ${actionType} ${targetType} -> ${target} [Audit Log Entry]`);
    }
};