const { threadUpdate } = require('../../utils/logging');

module.exports = {
    name: 'threadUpdate',
    execute(oldThread, newThread) {
        threadUpdate(`Thread updated: ${oldThread.name} => ${newThread.name}`);
    }
};