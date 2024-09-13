const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, SuccessEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeeventlog')
        .setDescription('Remove the channel where event logs are sent')
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const guildId = interaction.guild.id;
            const settingsFilePath = path.join(__dirname, '..', '..', 'data', guildId, 'settings.json');

            if (!fs.existsSync(settingsFilePath)) {
                const errorEmbed = ErrorEmbed('No Settings Found', 'No event log channel is currently set.');
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            let settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));

            if (!settings.eventLogChannel) {
                const errorEmbed = ErrorEmbed('No Event Log Channel', 'No event log channel is currently set.');
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            delete settings.eventLogChannel;

            fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));

            const successEmbed = SuccessEmbed('Event logs channel setting has been removed.');
            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
