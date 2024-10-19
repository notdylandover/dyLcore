const path = require('path');
const fs = require('fs');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../../../utils/embeds');
const { interactionCreate } = require('../../../../utils/logging');

module.exports = {
    customId: 'trust_user_modal',
    async execute(interaction) {
        const input = interaction.fields.getTextInputValue('trusted_user_id');
        const action = 'whitelist';
        let user;

        try {
            user = await interaction.guild.members.fetch(input);
        } catch {
            const members = await interaction.guild.members.fetch();
            user = members.find(member => member.user.username === input || member.user.tag === input);
        }

        if (!user) {
            const errorEmbed = ErrorEmbed('User not found.');
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        interactionCreate(`${interaction.guild.name.cyan} - ${('#' + interaction.channel.name).cyan} - ${interaction.user.username.cyan} - ${("Whitelist User").magenta} ${action.magenta}:${(user.user.tag).magenta}`);

        const member = interaction.member;
        const settingsFilePath = path.resolve(__dirname, `../../../data/servers/${interaction.guild.id}.json`);
        const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

        const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);

        if (!channelInfo) {
            const errorEmbed = ErrorEmbed('You are not in a created voice channel.');
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (channelInfo.ownerId !== member.id) {
            const errorEmbed = ErrorEmbed('You do not own this channel.');
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const voiceChannel = interaction.guild.channels.cache.get(member.voice.channel.id);

        if (channelInfo.whitelist.includes(user.id)) {
            const errorEmbed = ErrorEmbed(`User <@${user.user.id}> is already whitelisted.`);
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const blacklistIndex = channelInfo.blacklist.indexOf(user.id);
        if (blacklistIndex !== -1) {
            channelInfo.blacklist.splice(blacklistIndex, 1);
        }

        channelInfo.whitelist.push(user.id);
        await voiceChannel.permissionOverwrites.edit(user.id, {
            Connect: true
        });

        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
        const successEmbed = SuccessEmbedRemodal(`User <@${user.user.id}> has been whitelisted`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
};
