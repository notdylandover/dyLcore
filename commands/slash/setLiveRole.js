const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { ErrorEmbed, SuccessEmbedRemodal } = require("../../utils/embeds");
const { CommandError } = require("../../utils/logging");

const fs = require('fs');
const path = require('path');

module.exports = {
    premium: false,
    enabled: true,
    data: new SlashCommandBuilder()
        .setName("setliverole")
        .setDescription('Set the role to give to users when they go live')
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option => option
            .setName('role')
            .setDescription('The role to give to users when they go live')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const role = interaction.options.getRole('role');

            const dataFolder = path.join(__dirname, '..', '..', 'data', 'servers');
            if (!fs.existsSync(dataFolder)) {
                fs.mkdirSync(dataFolder, { recursive: true });
            }

            const configFile = path.join(dataFolder, `${interaction.guildId}.json`);
            let config = {};

            if (fs.existsSync(configFile)) {
                config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            }

            config.liveRoleId = role.id;

            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

            const successEmbed = SuccessEmbedRemodal(`Live notifications role set to ${role}`);
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