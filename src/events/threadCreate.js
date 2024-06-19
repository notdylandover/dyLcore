const { threadCreate } = require('../../utils/logging');

module.exports = {
    name: 'threadCreate',
    execute(thread) {
        threadCreate(`Thread created: ${thread.name}`);
    }
};