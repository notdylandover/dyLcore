const { PermissionsBitField, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../../../utils/embeds');
const fs = require('fs');
const path = require('path');

module.exports = async function createTicket(interaction) {
    const guild = interaction.guild;
    const ticketCategory = guild.channels.cache.find(c => c.name === 'Tickets' && c.type === ChannelType.GuildCategory);
    
    if (!ticketCategory) {
        const errorEmbed = ErrorEmbed('Ticket category does not exist.');
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const ticketChannel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: ticketCategory.id,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
            {
                id: guild.roles.cache.find(role => role.name === 'Ticket Moderator').id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            }
        ],
    });

    const modal = new ModalBuilder()
        .setCustomId('ticketDetails')
        .setTitle('Ticket Details');

    const subjectInput = new TextInputBuilder()
        .setCustomId('ticketSubject')
        .setLabel('Subject')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('ticketDescription')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const priorityInput = new TextInputBuilder()
        .setCustomId('ticketPriority')
        .setLabel('Priority (1-5)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(subjectInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(priorityInput)
    );

    await interaction.showModal(modal);

    const filter = i => i.customId === 'ticketDetails' && i.user.id === interaction.user.id;
    const submitted = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(() => null);

    if (!submitted) {
        return await interaction.followUp({ content: 'You did not provide ticket details in time.', ephemeral: true });
    }

    const subject = submitted.fields.getTextInputValue('ticketSubject');
    const description = submitted.fields.getTextInputValue('ticketDescription');
    const priority = parseInt(submitted.fields.getTextInputValue('ticketPriority'), 10);

    if (priority < 1 || priority > 5) {
        return await submitted.reply({ content: 'Priority must be between 1 and 5.', ephemeral: true });
    }

    const serverDataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'servers', `${guild.id}.json`);
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

    if (!serverData.activeTickets) {
        serverData.activeTickets = {};
    }

    serverData.activeTickets[ticketChannel.id] = {
        subject,
        description,
        priority,
        status: "Open",
        messages: [],
        feedback: null
    };

    const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

    const ticketEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Ticket Information')
        .addFields(
            { name: 'Subject', value: subject, inline: true },
            { name: 'Description', value: description, inline: true },
            { name: 'Priority', value: priority.toString(), inline: true },
        )
        .setFooter({ text: 'Click the button below to close this ticket.' });

    await ticketChannel.send({ embeds: [ticketEmbed], components: [new ActionRowBuilder().addComponents(closeButton)] });

    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));

    const successEmbed = SuccessEmbedRemodal(`Ticket created: ${ticketChannel}`);
    await submitted.reply({ embeds: [successEmbed], ephemeral: true });
};