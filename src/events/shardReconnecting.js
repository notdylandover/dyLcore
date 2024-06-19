const { shardReconnecting } = require('../../utils/logging');

module.exports = {
    name: 'shardReconnecting',
    execute(id) {
        shardReconnecting(`Shard ${id} is reconnecting`);
    }
};