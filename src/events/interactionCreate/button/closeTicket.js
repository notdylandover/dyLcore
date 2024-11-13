const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { SuccessEmbedRemodal } = require('../../../../utils/embeds');
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

module.exports = async function closeTicket(interaction) {
    const ticketChannel = interaction.channel;
    const guildId = interaction.guild.id;

    const serverDataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'servers', `${guildId}.json`);
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

    if (!serverData.activeTickets || !serverData.activeTickets[ticketChannel.id]) {
        return await interaction.reply({ content: 'This ticket does not exist.', ephemeral: true });
    }

    const ticketData = serverData.activeTickets[ticketChannel.id];

    if (ticketData.status === "Closed") {
        return await interaction.reply({ content: 'This ticket is already closed.', ephemeral: true });
    }

    const isModerator = interaction.member.roles.cache.some(role => role.name === 'Ticket Moderator');

    if (isModerator) {
        const confirmationEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Confirm Ticket Closure')
            .setDescription(`A moderator has requested to close this ticket. Please confirm to proceed.`)
            .setFooter({ text: 'Only the requester can confirm this closure.' });

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_close_ticket')
            .setLabel('Confirm Closure')
            .setStyle(ButtonStyle.Danger);

        return await interaction.reply({ embeds: [confirmationEmbed], components: [new ActionRowBuilder().addComponents(confirmButton)] });
    }

    if (interaction.user.id === ticketData.requester.id) {
        const modal = new ModalBuilder()
            .setCustomId('ticketFeedback')
            .setTitle('Ticket Feedback');

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedbackInput')
            .setLabel('Please provide your feedback:')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(feedbackInput));
        await interaction.showModal(modal);

        const filter = i => i.customId === 'ticketFeedback' && i.user.id === interaction.user.id;
        const submitted = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(() => null);

        if (!submitted) {
            return;
        }

        const feedback = submitted.fields.getTextInputValue('feedbackInput');

        if (feedback) {
            ticketData.feedback = feedback;
        }

        ticketData.status = "Closed";
        updateChannelName(ticketChannel, "closed");

        fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));

        await submitted.reply({ content: 'The ticket has been successfully closed.', ephemeral: true });
        return ticketChannel.send(`The ticket has been closed by ${interaction.user.username}.`);
    } else {
        return await interaction.reply({ content: 'You cannot close this ticket.', ephemeral: true });
    }
};