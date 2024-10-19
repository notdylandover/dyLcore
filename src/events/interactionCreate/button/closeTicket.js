const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async function closeTicket(interaction) {
    const ticketChannel = interaction.channel;
    const guildId = interaction.guild.id;

    const serverDataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'servers', `${guildId}.json`);
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

    if (!serverData.activeTickets || !serverData.activeTickets[ticketChannel.id]) {
        return await interaction.reply({ content: 'This ticket does not exist.', ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId('ticketFeedback')
        .setTitle('Ticket Feedback');

    const feedbackInput = new TextInputBuilder()
        .setCustomId('feedbackInput')
        .setLabel('Please provide your feedback:')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(feedbackInput));

    await interaction.showModal(modal);

    const filter = i => i.customId === 'ticketFeedback' && i.user.id === interaction.user.id;
    const submitted = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(() => null);

    if (!submitted) {
        return await interaction.followUp({ content: 'You did not provide feedback in time.', ephemeral: true });
    }

    const feedback = submitted.fields.getTextInputValue('feedbackInput');

    serverData.activeTickets[ticketChannel.id].feedback = feedback;
    serverData.activeTickets[ticketChannel.id].status = "Closed";

    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));

    try {
        await ticketChannel.send(`Ticket closed. Feedback received: ${feedback}`);
    } catch (error) {
        const user = interaction.user;
        await user.send(`Your ticket has been closed. Thank you for your feedback!`);
    }

    await ticketChannel.delete();
};