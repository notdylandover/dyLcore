const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { ErrorEmbed, SuccessEmbed } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlivechannel")
        .setDescription('Set the channel to send live notifications to')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to send live notifications to')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const channel = interaction.options.getChannel('channel');

            const dataFolder = path.join(__dirname, '..', 'data');
            if (!fs.existsSync(dataFolder)) {
                fs.mkdirSync(dataFolder);
            }

            const configFile = path.join(dataFolder, 'liveConfig.json');
            let config = {};

            if (fs.existsSync(configFile)) {
                config = JSON.parse(fs.readFileSync(configFile));
            }

            config[interaction.guildId] = {
                channelId: channel.id,
                messageIds: null
            };

            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

            const successEmbed = SuccessEmbed('Success', `Live notifications channel set to ${channel}`);
            interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
