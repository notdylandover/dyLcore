const { stageInstanceDelete } = require('../../utils/logging');

module.exports = {
    name: 'stageInstanceDelete',
    execute(stageInstance) {
        stageInstanceDelete(`Stage instance deleted: ${stageInstance.topic}`);
    }
};