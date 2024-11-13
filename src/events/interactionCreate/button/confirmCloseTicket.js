const fs = require('fs');
const path = require('path');

function updateChannelName(ticketChannel, status) {
    const statusEmojis = {
        open: '🟢',
        closed: '🔴',
        requesterResponded: '🟠',
    };
    const emoji = statusEmojis[status] || '';
    const newName = `${emoji}-${ticketChannel.name.split('-').pop().trim()}`;
    ticketChannel.setName(newName).catch(console.error);
}

module.exports = async function confirmCloseTicket(interaction) {
    const ticketChannel = interaction.channel;
    const guildId = interaction.guild.id;

    const serverDataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'servers', `${guildId}.json`);
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

    if (!serverData.activeTickets || !serverData.activeTickets[ticketChannel.id]) {
        return await interaction.reply({ content: 'This ticket does not exist.', ephemeral: true });
    }

    const ticketData = serverData.activeTickets[ticketChannel.id];

    if (interaction.user.id !== ticketData.requester.id) {
        return await interaction.reply({ content: 'Only the ticket requester can confirm the closure.', ephemeral: true });
    }

    if (ticketData.status === "Closed") {
        return await interaction.reply({ content: 'This ticket is already closed.', ephemeral: true });
    }

    ticketData.status = "Closed"; 
    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2)); 

    updateChannelName(ticketChannel, "closed");
    await interaction.reply({ content: 'The ticket has been successfully closed.', ephemeral: true });
    return ticketChannel.send(`The ticket has been closed by ${interaction.user.username}.`);
};