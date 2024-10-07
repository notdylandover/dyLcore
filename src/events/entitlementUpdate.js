const { updateEntitlement } = require('../../utils/entitlement');
const { entitlementUpdate } = require('../../utils/logging');

module.exports = {
    name: 'entitlementUpdate',
    async execute(entitlement) {
        try {
            const userName = entitlement.user.username;
            const entitlementStatus = entitlement.status;

            await updateEntitlement(userName, entitlementStatus);

            entitlementUpdate(`Entitlement updated for user: ${userName.cyan} with status: ${entitlementStatus ? entitlementStatus.cyan : 'None'.red}`);
        } catch (error) {
            console.error(`Error handling entitlement update: ${error.message}`);
        }
    },
};
