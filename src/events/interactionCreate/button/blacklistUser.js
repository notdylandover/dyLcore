const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { interactionCreate } = require('../../../../utils/logging');

module.exports = async function blacklistUser(interaction) {
    const server = interaction.guild.name;
    const channel = interaction.channel.name;
    const username = interaction.user.username;

    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Blacklist User").magenta}`);

    const modal = new ModalBuilder()
        .setCustomId('untrust_user_modal')
        .setTitle('Blacklist a User');

    const userIdInput = new TextInputBuilder()
        .setCustomId('untrusted_user_id')
        .setLabel('Enter User ID or Name')
        .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder().addComponents(userIdInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
};
