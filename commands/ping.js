const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { PingEmbed, LoadingEmbed, ErrorEmbed } = require('../utils/embeds');
const { BLOCK } = require('../utils/constants');
const { End, Error, Info, Warn } = require('../utils/logging');
const { METADATA } = require('../utils/metadata');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(METADATA.ping.description)
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {   
        const start = Date.now();

        await interaction.deferReply({ ephemeral: true });

        try {
            const wsping = interaction.client.ws.ping;

            if (wsping < 1) {
                const waitEmbed = ErrorEmbed('Error retrieving ping', 'A ping hasn\'t been determined yet, Please wait a minute.');
                await interaction.editReply({ embeds: [waitEmbed], ephemeral: true });
            } else {
                let color;
                
                if (wsping < 75) {
                    color = 'green';
                } else {
                    color = 'red';
                }

                const restPing = Date.now() - start;
                const pingEmbed = PingEmbed(wsping, restPing, color);
                await interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        } catch (error) {
            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            Error(`Error executing ${interaction.commandName}: ${error.message}`);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};