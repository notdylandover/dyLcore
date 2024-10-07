const fs = require('fs');
const path = require('path');
const { presenceUpdate, Error } = require('../../utils/logging');

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
        try {
            if (newPresence.user.bot) {
                return;
            }

            const userId = newPresence.user.id;
            const username = newPresence.user.username;
            const userDir = path.join(__dirname, '../../data/users', username);
            const presenceFilePath = path.join(userDir, 'presence.json');

            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }

            const oldStatus = oldPresence ? oldPresence.status : undefined;
            const newStatus = newPresence.status;

            const oldActivity = oldPresence ? oldPresence.activities : undefined;
            const newActivity = newPresence ? newPresence.activities : undefined;

            const lastPresence = lastStatus.get(userId) || { status: null, activityText: null };

            if (oldStatus !== newStatus) {
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

                const presenceDetails = `${statusSymbol[statusColor]}`;
                presenceUpdate(`${presenceDetails} ${username.grey}`);

                lastStatus.set(userId, { status: newStatus, activityText: lastPresence.activityText });
            }

            if (!activitiesAreEqual(oldActivity, newActivity)) {
                if (newActivity && newActivity.length > 0) {
                    const presenceData = {
                        status: newPresence.status,
                        activities: newActivity,
                        timestamp: new Date().toISOString(),
                    };

                    fs.writeFileSync(presenceFilePath, JSON.stringify(presenceData, null, 2));

                    const activityText = newActivity.map(activity => {
                        let details = activity.name || '';
                        if (activity.details) details += ` - ${activity.details}`;
                        if (activity.state) details += ` - ${activity.state}`;
                        return details;
                    }).join(', ');

                    if (lastPresence.activityText !== activityText) {
                        presenceUpdate(`${username} ${activityText}`);
                        lastStatus.set(userId, { status: lastPresence.status, activityText });
                    }
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};