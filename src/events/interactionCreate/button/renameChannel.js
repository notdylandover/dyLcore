const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { interactionCreate } = require('../../../../utils/logging');

module.exports = {
    customId: 'rename_channel',
    async execute(interaction) {
        const server = interaction.guild.name;
        const channel = interaction.channel.name;
        const username = interaction.user.username;

        interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Rename Channel").magenta}`);

        const modal = new ModalBuilder()
            .setCustomId('rename_channel_modal')
            .setTitle('Rename Channel');

        const newNameInput = new TextInputBuilder()
            .setCustomId('new_channel_name')
            .setLabel('New Channel Name')
            .setStyle(TextInputStyle.Short);

        const row = new ActionRowBuilder().addComponents(newNameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};
