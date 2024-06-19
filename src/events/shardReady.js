const { shardReady } = require('../../utils/logging');

module.exports = {
    name: 'shardReady',
    execute(id, unavailableGuilds) {
        shardReady(`Shard ${id} is ready`);
    }
};