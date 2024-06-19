const { shardError } = require('../../utils/logging');

module.exports = {
    name: 'shardError',
    execute(error, id) {
        shardError(`Shard ${id} encountered an error. ${error.message}`);
    }
};