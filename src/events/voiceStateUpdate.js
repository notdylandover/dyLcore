const { ChannelType } = require('discord.js');
const { voiceStateUpdate, Error, Debug } = require('../../utils/logging');

const fs = require('fs');
const path = require('path');

function getAction(oldState, newState) {
    // Joined
    if (!oldState.channel && newState.channel) { return 'Joined'; }

    // Left
    else if (oldState.channel && !newState.channel) { return 'Left'; }

    // Muted
    else if (newState.selfMute && !oldState.selfMute && !newState.selfDeaf && !oldState.selfDeaf) { return 'Muted'; }

    // Unmuted
    else if (!newState.selfMute && oldState.selfMute && !newState.selfDeaf && !oldState.selfDeaf) { return 'Unmuted'; }

    // Deafened
    else if (newState.selfDeaf && !oldState.selfDeaf) { return 'Deafened'; }

    // Undeafened
    else if (!newState.selfDeaf && oldState.selfDeaf) { return 'Undeafened'; }

    // Server Deafened
    else if (newState.deaf && !oldState.deaf) { return 'Server Deafened'; }

    // Server Undeafened
    else if (!newState.deaf && oldState.deaf) { return 'Server Undeafened'; }

    // Server Muted
    else if (newState.mute && !oldState.mute) { return 'Server Muted'; }

    // Server Unmuted
    else if (!newState.mute && oldState.mute) { return 'Server Unmuted'; }

    // Camera On
    else if (newState.selfVideo && !oldState.selfVideo) { return 'Camera On'; }

    // Camera Off
    else if (!newState.selfVideo && oldState.selfVideo) { return 'Camera Off'; }

    // Started Stream
    else if (newState.streaming && !oldState.streaming) { return 'Started Stream'; }

    // Stopped Stream
    else if (!newState.streaming && oldState.streaming) { return 'Stopped Stream'; }

    // Request to Speak
    else if (newState.requestToSpeakTimeStamp && !oldState.requestToSpeakTimeStamp) { return 'Requested to Speak'; }

    // Session ID Changed
    else if (newState.sessionId && !oldState.sessionId) { return 'Session ID Changed'; }

    // Suppressed
    else if (newState.suppress && !oldState.suppress) { return 'Suppress'; }

    else { return 'Other'; }
}

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        try {
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
            } else if (
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
            } else if (action == 'Request to Speak') {
                actionColor = 'cyan';
            } else {
                actionColor = 'gray';
            }

            voiceStateUpdate(`${server.cyan} - ${channel.cyan} - ${globalName.cyan} - ${action[actionColor]}`);

            const settingsFilePath = path.resolve(__dirname, `../../data/servers/${newState.guild.id}.json`);
            if (fs.existsSync(settingsFilePath)) {
                const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

                if (!settings.createdChannels) {
                    settings.createdChannels = [];
                }

                if (action === 'Joined' && newState.channel && newState.channel.id === settings.joinToCreateVC) {
                    const maxBitrate = newState.guild.voiceStates.size >= 10 ? 384000 : 96000;

                    const newChannel = await newState.guild.channels.create({
                        name: `${member.user.username}'s Room`,
                        type: ChannelType.GuildVoice,
                        parent: newState.channel.parent,
                        bitrate: maxBitrate,
                        reason: 'User joined the "Join to Create VC" channel',
                    });

                    await member.voice.setChannel(newChannel);

                    settings.createdChannels.push({
                        channelId: newChannel.id,
                        ownerId: member.id,
                        whitelist: [],
                        blacklist: []
                    });

                    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
                }

                if (action === 'Left' && oldState.channel) {
                    const channelId = oldState.channel.id;
                    const channelInfo = settings.createdChannels.find(channel => channel.channelId === channelId);

                    if (channelInfo && oldState.channel.members.size === 0) {
                        await oldState.channel.delete();

                        settings.createdChannels = settings.createdChannels.filter(channel => channel.channelId !== channelId);
                        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
                    }
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};