const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { interactionCreate } = require('../../../../utils/logging');

module.exports = async function whitelistUser(interaction) {
    const server = interaction.guild.name;
    const channel = interaction.channel.name;
    const username = interaction.user.username;

    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Whitelist User").magenta}`);

    const modal = new ModalBuilder()
        .setCustomId('trust_user_modal')
        .setTitle('Whitelist a User');

    const userIdInput = new TextInputBuilder()
        .setCustomId('trusted_user_id')
        .setLabel('Enter User ID or Name')
        .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder().addComponents(userIdInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
};
