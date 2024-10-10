const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const fs = require('fs');
const path = require('path');

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName('alerts')
        .setDescription('Set the channel for specific client events')
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Select the channel for events')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const channel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id;

            const settingsFilePath = path.resolve(__dirname, `../../data/servers/${guildId}.json`);
            
            if (!fs.existsSync(settingsFilePath)) {
                fs.writeFileSync(settingsFilePath, JSON.stringify({ alertsChannel: null }, null, 2));
            }

            const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
            
            settings.alertsChannel = channel.id;

            fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));

            const successEmbed = SuccessEmbedRemodal(`Alerts channel set to <#${channel.id}>`);
            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};