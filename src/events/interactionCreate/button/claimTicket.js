const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { SuccessEmbedRemodal } = require('../../../../utils/embeds');

module.exports = async function claimTicket(interaction) {
    const ticketChannel = interaction.channel;
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const serverDataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'servers', `${guildId}.json`);
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

    if (!serverData.activeTickets || !serverData.activeTickets[ticketChannel.id]) {
        return await interaction.reply({ content: 'This ticket does not exist.', flags: MessageFlags.Ephemeral });
    }

    const ticketData = serverData.activeTickets[ticketChannel.id];

    if (ticketData.agent) {
        return await interaction.reply({ content: 'This ticket has already been claimed.', flags: MessageFlags.Ephemeral });
    }

    const ticketModeratorRole = interaction.guild.roles.cache.find(role => role.name === 'Ticket Moderator');
    
    if (!ticketModeratorRole || !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.reply({ content: 'You do not have permission to claim this ticket.', flags: MessageFlags.Ephemeral });
    }

    ticketData.agent = interaction.user.username;

    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));

    const successEmbed = SuccessEmbedRemodal(`<@${interaction.user.id}> will now assist you in this ticket.`);
    await interaction.reply({ embeds: [successEmbed] });
};