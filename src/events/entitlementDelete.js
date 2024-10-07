const { updateEntitlement } = require('../../utils/entitlement');
const { entitlementDelete } = require('../../utils/logging');

module.exports = {
    name: 'entitlementDelete',
    async execute(entitlement) {
        try {
            const userName = entitlement.user.username;
            const entitlementStatus = null;

            await updateEntitlement(userName, entitlementStatus);

            entitlementDelete(`Entitlement deleted for user: ${userName.cyan}. Subscription is now inactive.`);
        } catch (error) {
            console.error(`Error handling entitlement deletion: ${error.message}`);
        }
    },
};
