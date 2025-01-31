const { MessageFlags } = require('discord.js');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../../../utils/embeds');
const { interactionCreate } = require('../../../../utils/logging');
const path = require('path');
const fs = require('fs');

module.exports = async function renameChannelModal(interaction) {
    const newChannelName = interaction.fields.getTextInputValue('new_channel_name');
    const member = interaction.member;

    if (!member.voice.channel) {
        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    const settingsFilePath = path.resolve(__dirname, `../../../../data/servers/${interaction.guild.id}.json`);
    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);

    interactionCreate(`${interaction.guild.name.cyan} - ${('#' + interaction.channel.name).cyan} - ${interaction.user.username.cyan} - ${("Rename Channel").magenta} name:${newChannelName.magenta}`);

    if (!channelInfo) {
        const errorEmbed = ErrorEmbed('You are not in a created voice channel.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    if (channelInfo.ownerId !== member.id) {
        const errorEmbed = ErrorEmbed('You do not own this channel.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

    await member.voice.channel.setName(newChannelName);
    const successEmbed = SuccessEmbedRemodal(`Channel renamed to \` ${newChannelName} \``);
    await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
};
