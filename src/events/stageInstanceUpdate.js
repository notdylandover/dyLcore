const { stageInstanceUpdate } = require('../../utils/logging');

module.exports = {
    name: 'stageInstanceUpdate',
    execute(oldStageInstance, newStageInstance) {
        stageInstanceUpdate(`Stage instance updated: ${oldStageInstance.topic} => ${newStageInstance.topic}`);
    }
};