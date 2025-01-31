const { MessageFlags } = require('discord.js');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../../../utils/embeds');
const fs = require('fs');
const path = require('path');

module.exports = async function lockChannel(interaction) {
    const member = interaction.member;

    if (!member.voice.channel) {
        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    const settingsFilePath = path.resolve(__dirname, `../../../../data/servers/${interaction.guild.id}.json`);
    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);

    if (!channelInfo) {
        const errorEmbed = ErrorEmbed('You are not in a created voice channel.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    if (channelInfo.ownerId !== member.id) {
        const errorEmbed = ErrorEmbed('You do not own this channel.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    const voiceChannel = interaction.guild.channels.cache.get(member.voice.channel.id);
    const everyoneRolePermissions = voiceChannel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);
    const isLocked = everyoneRolePermissions?.deny.has('Connect');

    if (isLocked) {
        await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            Connect: true
        });
        const unlockEmbed = SuccessEmbedRemodal('Channel has been unlocked. Everyone can connect.');
        await interaction.reply({ embeds: [unlockEmbed], flags: MessageFlags.Ephemeral });
    } else {
        await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            Connect: false
        });
        const lockEmbed = SuccessEmbedRemodal('Channel has been locked. Only the owner can connect.');
        await interaction.reply({ embeds: [lockEmbed], flags: MessageFlags.Ephemeral });
    }
};
