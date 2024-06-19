const { stageInstanceCreate } = require('../../utils/logging');

module.exports = {
    name: 'stageInstanceCreate',
    execute(stageInstance) {
        stageInstanceCreate(`Stage instance created: ${stageInstance.topic}`);
    }
};