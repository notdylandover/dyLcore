const { presenceUpdate, Error, Info } = require('../../utils/logging');

const lastStatus = new Map();

function activitiesAreEqual(oldActivities, newActivities) {
    if (!oldActivities || !newActivities || oldActivities.length !== newActivities.length) {
        return false;
    }

    for (let i = 0; i < oldActivities.length; i++) {
        const oldActivity = oldActivities[i];
        const newActivity = newActivities[i];

        if (oldActivity.type !== newActivity.type ||
            oldActivity.name !== newActivity.name ||
            oldActivity.details !== newActivity.details ||
            oldActivity.state !== newActivity.state) {
            return false;
        }
    }

    return true;
}

module.exports = {
    name: 'presenceUpdate',
    execute(oldPresence, newPresence) {
        if (newPresence.user.bot) {
            return;
        }

        const userId = newPresence.userID;
        const oldStatus = oldPresence ? oldPresence.status : undefined;
        const newStatus = newPresence.status;

        const oldActivity = oldPresence ? oldPresence.activities : undefined;
        const newActivity = newPresence ? newPresence.activities : undefined;

        if (oldStatus !== newStatus) {
            const user = newPresence.user.username;

            let statusSymbol = '⬤';
            let statusColor = '';

            switch (newStatus) {
                case 'online':
                    statusColor = 'green';
                    break;
                case 'idle':
                    statusColor = 'yellow';
                    break;
                case 'dnd':
                    statusColor = 'red';
                    break;
                case 'offline':
                    statusColor = 'grey';
                    break;
                default:
                    statusColor = 'white';
                    break;
            }

            let presenceDetails = `${statusSymbol[statusColor]}`;

            if (!lastStatus.has(userId) || lastStatus.get(userId) !== newStatus) {
                presenceUpdate(`${presenceDetails} ${user.grey}`);

                lastStatus.set(userId, newStatus);
            } 
        } else if (!activitiesAreEqual(oldActivity, newActivity)) {
            const user = newPresence.user.username;

            if (newActivity && newActivity.length > 0) {
                let activityName = '';
                let activityDetails = '';
                let activityState = '';

                for (const activity of newActivity) {
                    if (activity.type !== 4) {
                        if (activity.name) {
                            activityName = `- ${activity.name} `;
                        }
                        
                        if (activity.details) {
                            activityDetails = `- ${activity.details} ` || '';
                        }

                        if (activity.state) {
                            activityState = `- ${activity.state}` || '';
                        }
                        
                        break;
                    } else {
                        activityState = `- ${activity.state}` || '';
                    }
                }

                const activityText = `${activityName}${activityDetails}${activityState}`.trim();

                if (activityText && (!lastStatus.has(userId) || lastStatus.get(userId) !== activityText)) {
                    presenceUpdate(`${user} ${activityText}`);

                    lastStatus.set(userId, activityText);
                }  
            }
        }
    }
};