const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async function handleFeedbackModal(interaction) {
    const feedback = interaction.fields.getTextInputValue('feedbackInput');
    const guildId = interaction.guild.id;
    const serverDataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'servers', `${guildId}.json`);
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

    const ticketChannelId = interaction.channel.id;

    if (serverData.activeTickets[ticketChannelId]) {
        serverData.activeTickets[ticketChannelId].feedback = feedback;
        serverData.activeTickets[ticketChannelId].status = "Closed";

        fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));

        await interaction.reply({ content: 'Thank you for your feedback!', ephemeral: true });

        try {
            await interaction.user.send(`Your ticket has been closed. Feedback received: ${feedback}`);
        } catch (error) {
            console.error('Failed to send DM:', error);
        }

        await interaction.channel.send(`Ticket closed. Feedback received: ${feedback}`);

        const ticketChannel = interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;
        const userRole = interaction.guild.roles.cache.find(role => role.id === interaction.user.id);

        await ticketChannel.permissionOverwrites.edit(userRole, {
            ViewChannel: false,
            SendMessages: false
        });

        await ticketChannel.permissionOverwrites.edit(everyoneRole, {
            ViewChannel: false
        });
    } else {
        await interaction.reply({ content: 'This ticket does not exist.', ephemeral: true });
    }
};