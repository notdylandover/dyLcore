const { ChannelType } = require('discord.js');
const { voiceStateUpdate, Error, Debug } = require('../../utils/logging');
const fs = require('fs');
const path = require('path');

function getAction(oldState, newState) {
    if (!oldState.channel && newState.channel) return 'Joined';
    else if (oldState.channel && !newState.channel) return 'Left';
    else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) return 'Moved';
    else if (newState.selfMute && !oldState.selfMute && !newState.selfDeaf && !oldState.selfDeaf) return 'Muted';
    else if (!newState.selfMute && oldState.selfMute && !newState.selfDeaf && !oldState.selfDeaf) return 'Unmuted';
    else if (newState.selfDeaf && !oldState.selfDeaf) return 'Deafened';
    else if (!newState.selfDeaf && oldState.selfDeaf) return 'Undeafened';
    else if (newState.deaf && !oldState.deaf) return 'Server Deafened';
    else if (!newState.deaf && oldState.deaf) return 'Server Undeafened';
    else if (newState.mute && !oldState.mute) return 'Server Muted';
    else if (!newState.mute && oldState.mute) return 'Server Unmuted';
    else if (newState.selfVideo && !oldState.selfVideo) return 'Camera On';
    else if (!newState.selfVideo && oldState.selfVideo) return 'Camera Off';
    else if (newState.streaming && !oldState.streaming) return 'Started Stream';
    else if (!newState.streaming && oldState.streaming) return 'Stopped Stream';
    else if (newState.requestToSpeakTimeStamp && !oldState.requestToSpeakTimeStamp) return 'Requested to Speak';
    else if (newState.sessionId && !oldState.sessionId) return 'Session ID Changed';
    else if (newState.suppress && !oldState.suppress) return 'Suppress';
    return 'Other';
}

async function checkAndDeleteEmptyChannel(channel, settings, settingsFilePath) {
    const channelId = channel.id;
    const channelInfo = settings.createdChannels.find(channel => channel.channelId === channelId);

    if (channelInfo && channel.members.size === 0) {
        await channel.delete();
        settings.createdChannels = settings.createdChannels.filter(channel => channel.channelId !== channelId);
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    }
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

            let actionColor = ['Joined', 'Moved', 'Unmuted', 'Undeafened', 'Server Undeafened', 'Server Unmuted', 'Camera On', 'Started Stream'].includes(action) ? 'green'
                : ['Left', 'Muted', 'Deafened', 'Server Deafened', 'Server Muted', 'Camera Off', 'Stopped Stream', 'Suppress'].includes(action) ? 'red'
                : action === 'Request to Speak' ? 'cyan' : 'gray';

            voiceStateUpdate(`${server.cyan} - ${channel.cyan} - ${globalName.cyan} - ${action[actionColor]}`);

            const settingsFilePath = path.resolve(__dirname, `../../data/servers/${newState.guild.id}.json`);
            if (fs.existsSync(settingsFilePath)) {
                const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
                settings.createdChannels ||= [];

                if ((action === 'Joined' || action === 'Moved') && newState.channel && newState.channel.id === settings.joinToCreateVC) {
                    const maxBitrate = newState.guild.voiceStates.size >= 10 ? 384000 : 96000;
                    const displayName = member.displayName || member.user.username;

                    const newChannel = await newState.guild.channels.create({
                        name: `${displayName}'s Room`,
                        type: ChannelType.GuildVoice,
                        parent: newState.channel.parent,
                        bitrate: maxBitrate,
                        reason: 'User joined or moved to "Join to Create VC" channel',
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

                if ((action === 'Left' || action === 'Moved') && oldState.channel) {
                    await checkAndDeleteEmptyChannel(oldState.channel, settings, settingsFilePath);
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);
        }
    }
};