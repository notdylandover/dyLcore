const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { interactionCreate } = require('../../../../utils/logging');

module.exports = {
    customId: 'limit_user',
    async execute(interaction) {
        const server = interaction.guild.name;
        const channel = interaction.channel.name;
        const username = interaction.user.username;

        interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Set User Limit").magenta}`);

        const modal = new ModalBuilder()
            .setCustomId('limit_user_modal')
            .setTitle('Set User Limit');

        const userLimitInput = new TextInputBuilder()
            .setCustomId('user_limit')
            .setLabel('Enter User Limit (1-99)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('1')
            .setMaxLength(2);

        const row = new ActionRowBuilder().addComponents(userLimitInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};
