const fs = require('fs');
const path = require('path');
const { SuccessEmbedRemodal } = require('../../../../utils/embeds');

module.exports = async function handleFeedbackModal(interaction) {
    const feedback = interaction.fields.getTextInputValue('feedbackInput');
    const guildId = interaction.guild.id;
    const serverDataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'servers', `${guildId}.json`);
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));

    const ticketChannelId = interaction.channel.id;

    if (serverData.activeTickets[ticketChannelId]) {
        serverData.activeTickets[ticketChannelId].feedback = feedback;

        fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));

        const ticketChannel = interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;
        const userId = interaction.user.id;

        await ticketChannel.permissionOverwrites.edit(userId, {
            ViewChannel: false,
            SendMessages: false
        });

        await ticketChannel.permissionOverwrites.edit(everyoneRole, {
            ViewChannel: false
        });

        const successEmbed = SuccessEmbedRemodal(`Ticket Closed`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        await ticketChannel.send({ embeds: [successEmbed] });
    } else {
        return;
    }
};