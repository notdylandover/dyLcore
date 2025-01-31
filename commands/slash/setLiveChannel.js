const { ChannelType, PermissionFlagsBits, SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require("discord.js");
const { ErrorEmbed, SuccessEmbedRemodal } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

const fs = require('fs');
const path = require('path');

module.exports = {
    premium: false,
    enabled: true,
    data: new SlashCommandBuilder()
        .setName("setlivechannel")
        .setDescription('Set the channel to send live notifications to')
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to send live notifications to')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const channel = interaction.options.getChannel('channel');

            const dataFolder = path.join(__dirname, '..', '..', 'data', 'servers');
            if (!fs.existsSync(dataFolder)) {
                fs.mkdirSync(dataFolder, { recursive: true });
            }

            const configFile = path.join(dataFolder, `${interaction.guildId}.json`);
            let config = {};

            if (fs.existsSync(configFile)) {
                config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            }

            config.liveChannelId = channel.id;

            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

            const successEmbed = SuccessEmbedRemodal(`Live notifications channel set to <#${channel.id}>`);
            interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(error.message);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};