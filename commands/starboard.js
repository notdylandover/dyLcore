const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { SuccessEmbed, ErrorEmbed } = require('../utils/embeds');
const { CommandError } = require("../utils/logging");

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('starboard')
        .setDescription('Configure the starboard system for this server')
        .addSubcommand(subcommand => subcommand
            .setName('setchannel')
            .setDescription('Add a channel as the starboard system channel')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to set as the starboard system channel')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('removechannel')
            .setDescription('Remove a channel as the starboard system channel')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to remove as the starboard system channel')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('setreactions')
            .setDescription('Set the required amount of reactions before sending to starboard')
            .addIntegerOption(option => option
                .setName('count')
                .setDescription('The number of reactions required')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');
        const serverId = interaction.guild.id;
        const settingsPath = path.join(__dirname, '..', 'data', serverId, 'settings.json');

        try {
            fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

            let settings = {};
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath));
            }

            if (subcommand === 'setchannel') {
                settings.starboard_channel_id = channel.id;

                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

                const successEmbed = SuccessEmbed('Starboard Channel Set', `The starboard system channel has been set to <#${channel.id}>`);
                await interaction.editReply({ embeds: [successEmbed] });
            } else if (subcommand === 'removechannel') {
                if (settings.starboard_channel_id === channel.id) {
                    delete settings.starboard_channel_id;

                    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

                    const successEmbed = SuccessEmbed('Starboard Channel Removed', `The starboard system channel <#${channel.id}> has been removed`);
                    await interaction.editReply({ embeds: [successEmbed] });
                } else {
                    const errorEmbed = ErrorEmbed('Error', `The channel <#${channel.id}> is not set as the starboard system channel.`);
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                }
            } else if (subcommand === 'setreactions') {
                const count = interaction.options.getInteger('count');
                
                if (!settings.starboard_channel_id) {
                    const errorEmbed = ErrorEmbed('Error', 'No starboard channel is set. Please set a starboard channel first.');
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                    return;
                }

                settings.starboard_reactions_required = count;

                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

                const successEmbed = SuccessEmbed('Starboard Reactions Requirement Set', `The required reactions to send a message to starboard has been set to ${count}`);
                await interaction.editReply({ embeds: [successEmbed] });
            }

        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.stack);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};