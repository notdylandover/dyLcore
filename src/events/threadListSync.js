const { threadListSync } = require('../../utils/logging');

module.exports = {
    name: 'threadListSync',
    execute(threads) {
        threadListSync(`${threads.size} threads synced`);
    }
};