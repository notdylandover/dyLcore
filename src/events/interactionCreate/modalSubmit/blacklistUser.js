const { MessageFlags } = require('discord.js');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../../../utils/embeds');
const { interactionCreate } = require('../../../../utils/logging');
const path = require('path');
const fs = require('fs');

module.exports = async function blacklistUserModal(interaction) {
    const input = interaction.fields.getTextInputValue('untrusted_user_id');
    const action = 'blacklist';
    let user;

    try {
        user = await interaction.guild.members.fetch(input);
    } catch {
        const members = await interaction.guild.members.fetch();
        user = members.find(member => member.user.username === input || member.user.tag === input);
    }

    if (!user) {
        const errorEmbed = ErrorEmbed('User not found.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    interactionCreate(`${interaction.guild.name.cyan} - ${('#' + interaction.channel.name).cyan} - ${interaction.user.username.cyan} - ${("Blacklist User").magenta} ${action.magenta}:${(user.user.tag).magenta}`);

    const member = interaction.member;
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

    if (channelInfo.blacklist.includes(user.id)) {
        const errorEmbed = ErrorEmbed(`User <@${user.user.id}> is already blacklisted.`);
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    const whitelistIndex = channelInfo.whitelist.indexOf(user.id);
    if (whitelistIndex !== -1) {
        channelInfo.whitelist.splice(whitelistIndex, 1);
    }

    channelInfo.blacklist.push(user.id);
    await voiceChannel.permissionOverwrites.edit(user.id, {
        Connect: false,
        ViewChannel: true
    });

    if (user.voice.channel && user.voice.channel.id === voiceChannel.id) {
        await user.voice.disconnect('Untrusted');
    }

    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    const successEmbed = SuccessEmbedRemodal(`User <@${user.user.id}> has been blacklisted`);
    await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
};
