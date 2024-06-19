const { shardDisconnect } = require('../../utils/logging');

module.exports = {
    name: 'shardDisconnect',
    execute(event, id) {
        const code = event.code;
        // const reason = event.reason;
        // const wasClean = event.wasClean;

        shardDisconnect(`Shard ${id} disconnected. Code: ${code}`);
    }
};