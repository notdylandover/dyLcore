const { voiceStateUpdate } = require('../../utils/logging');

function getAction(oldState, newState) {
    // Joined
    if          (!oldState.channel && newState.channel)                                 { return 'Joined'; }                    // Green

    // Left
    else if     (oldState.channel && !newState.channel)                                 { return 'Left'; }                      // Red
    
    // Muted
    else if     (newState.selfMute && !oldState.selfMute &&
                !newState.selfDeaf && !oldState.selfDeaf)                               { return 'Muted'; }                     // Red

    // Unmuted
    else if     (!newState.selfMute && oldState.selfMute &&
                !newState.selfDeaf && !oldState.selfDeaf)                               { return 'Unmuted'; }                   // Green

    // Deafened
    else if     (newState.selfDeaf && !oldState.selfDeaf)                               { return 'Deafened'; }                  // Red

    // Undeafened
    else if     (!newState.selfDeaf && oldState.selfDeaf)                               { return 'Undeafened'; }                // Green

    // Server Deafened
    else if     (newState.deaf && !oldState.deaf)                                       { return 'Server Deafened'; }           // Red

    // Server Undeafened
    else if     (!newState.deaf && oldState.deaf)                                       { return 'Server Undeafened'; }         // Green
    
    // Server Muted
    else if     (newState.mute && !oldState.mute)                                       { return 'Server Muted'; }              // Red

    // Server Unmuted
    else if     (!newState.mute && oldState.mute)                                       { return 'Server Unmuted'; }            // Green

    // Camera On
    else if     (newState.selfVideo && !oldState.selfVideo)                             { return 'Camera On'; }                 // Green
    
    // Camera Off
    else if     (!newState.selfVideo && oldState.selfVideo)                             { return 'Camera Off'; }                // Red
    
    // Started Stream
    else if     (newState.streaming && !oldState.streaming)                             { return 'Starting Stream'; }           // Green
    
    // Stopped Stream
    else if     (!newState.streaming && oldState.streaming)                             { return 'Stopped Stream'; }            // Red
    
    // Request to Speak
    else if     (newState.requestToSpeakTimeStamp && !oldState.requestToSpeakTimeStamp) { return 'Requested to Speak'; }        // Cyan
    
    // Session ID Changed
    else if     (newState.sessionId && !oldState.sessionId)                             { return 'Session ID Changed'; }        // Gray

    // Suppressed
    else if     (newState.suppress && !oldState.suppress)                               { return 'Suppress'; }                  // Red
    
    else        { return 'Other'; }
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

        if (
            action == 'Joined' ||
            action == 'Unmuted' ||
            action == 'Undeafened' ||
            action == 'Server Undeafened' ||
            action == 'Server Unmuted' ||
            action == 'Camera On' ||
            action == 'Started Stream'
        ) {
            actionColor = 'green';
        }

        else if (
            action == 'Left' ||
            action == 'Muted' ||
            action == 'Deafened' ||
            action == 'Server Deafened' ||
            action == 'Server Muted' ||
            action == 'Camera Off' ||
            action == 'Stopped Stream' ||
            action == 'Suppress'
        ) {
            actionColor = 'red';
        }

        else if (
            action == 'Request to Speak'
        ) {
            actionColor = 'cyan';
        }

        else {
            actionColor = 'gray';
        }

        voiceStateUpdate(`${server.cyan} - ${channel.cyan} - ${globalName.cyan} - ${action[actionColor]}`);
    }
};