const { threadDelete } = require('../../utils/logging');

module.exports = {
    name: 'threadDelete',
    execute(thread) {
        threadDelete(`Thread deleted: ${thread.name}`);
    }
};