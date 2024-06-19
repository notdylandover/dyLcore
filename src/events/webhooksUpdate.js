const { webhooksUpdate } = require('../../utils/logging');

module.exports = {
    name: 'webhooksUpdate',
    execute(channel) {
        webhooksUpdate(`Webhooks updated in #${channel.name}`);
    }
};