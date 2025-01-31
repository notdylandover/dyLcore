const { MessageFlags } = require('discord.js');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../../../utils/embeds');
const path = require('path');
const fs = require('fs');

module.exports = async function limitUserModal(interaction) {
    const userLimit = interaction.fields.getTextInputValue('user_limit');
    const member = interaction.member;
    const parsedLimit = parseInt(userLimit);

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 99) {
        const errorEmbed = ErrorEmbed('Invalid user limit. Please enter a number between 1 and 99.');
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }

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

    await member.voice.channel.setUserLimit(parsedLimit);

    const successEmbed = SuccessEmbedRemodal(`User limit has been set to \` ${parsedLimit} \`.`);
    await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
};