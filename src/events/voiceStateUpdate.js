const { voiceStateUpdate } = require('../../utils/logging');

function getAction(oldState, newState) {
    if (!oldState.channel && newState.channel) { return 'Joined'; }
    else if (oldState.channel && !newState.channel) { return 'Left'; }
    else if (newState.selfMute && !oldState.selfMute && !newState.selfDeaf && !oldState.selfDeaf) { return 'Muted'; }
    else if (!newState.selfMute && oldState.selfMute && !newState.selfDeaf && !oldState.selfDeaf) { return 'Unmuted'; }
    else if (newState.selfDeaf && !oldState.selfDeaf) { return 'Deafened'; }
    else if (!newState.selfDeaf && oldState.selfDeaf) { return 'Undeafened'; }
    else if (newState.selfVideo && !oldState.selfVideo) { return 'Turned on camera'; }
    else if (!newState.selfVideo && oldState.selfVideo) { return 'Turned off camera'; }
    else if (newState.streaming && !oldState.streaming) { return 'Starting streaming'; }
    else if (!newState.streaming && oldState.streaming) { return 'Stopped streaming'; }
    else { return 'Changed Windows'; } // Couldn't find any other action
}

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState) {
        const member = newState.member || oldState.member;
        const action = getAction(oldState, newState);

        const server = newState.guild ? newState.guild.name : 'Unknown Server';
        const channel = newState.channel ? newState.channel.name : 'Unknown Channel';
        const globalName = member.user.tag;

        let actionColor;
        switch (action) {
            case 'Joined':
                actionColor = 'green';
                break;
            case 'Left':
                actionColor = 'red';
                break;
            case 'Unmuted':
                actionColor = 'green';
                break;
            case 'Muted':
                actionColor = 'red';
                break;
            case 'Undeafened':
                actionColor = 'green';
                break;
            case 'Deafened':
                actionColor = 'red';
                break;
            case 'Turned on camera':
                actionColor = 'green';
                break;
            case 'Turned off camera':
                actionColor = 'red';
                break;
            case 'Starting streaming':
                actionColor = 'green';
                break;
            case 'Stopped streaming':
                actionColor = 'red';
                break;
            case 'Changed Windows':
                actionColor = 'yellow';
                break;
            default:
                actionColor = 'white';
                break;
        }

        voiceStateUpdate(`${server.cyan} - ${channel.cyan} - ${globalName.cyan} - ${action[actionColor]}`);
    }
};