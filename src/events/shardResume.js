const { shardResume } = require('../../utils/logging');

module.exports = {
    name: 'shardResume',
    execute(id, replayedEvents) {
        shardResume(`Shard ${id} has resumed. Replayed ${replayedEvents} events.`);
    }
};