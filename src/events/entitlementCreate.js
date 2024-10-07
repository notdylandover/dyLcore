const { updateEntitlement } = require('../../utils/entitlement');
const { entitlementCreate } = require('../../utils/logging');

module.exports = {
    name: 'entitlementCreate',
    async execute(entitlement) {
        try {
            const userName = entitlement.user.id;
            const entitlementStatus = 'active';

            await updateEntitlement(userName, entitlementStatus);

            entitlementCreate(`Entitlement created for user: ${userName.cyan} with status: ${entitlementStatus.cyan}`);
        } catch (error) {
            console.error(`Error handling entitlement creation: ${error.message}`);
        }
    },
};
