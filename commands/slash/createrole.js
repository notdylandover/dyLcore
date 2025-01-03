const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits } = require('discord.js');
const { SuccessEmbed, ErrorEmbed } = require('../../utils/embeds');
const { CommandError } = require("../../utils/logging");

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName('createrole')
        .setDescription('Create a new role')
        .addStringOption(option => option
            .setName('name')
            .setDescription('The name of the role')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('color')
            .setDescription('The color of the role (e.g., #4269FF)')
            .setRequired(false)
        )
        .addBooleanOption(option => option
            .setName('cosmetic')
            .setDescription('Whether the role is cosmetic (no permissions)')
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const roleName = interaction.options.getString('name');
            const roleColor = interaction.options.getString('color') || null;
            const isCosmetic = interaction.options.getBoolean('cosmetic') || false;

            const role = await interaction.guild.roles.create({
                name: roleName,
                color: roleColor,
                permissions: isCosmetic ? [] : ['SEND_MESSAGES', 'VIEW_CHANNEL']
            });

            const successEmbed = SuccessEmbed(`Role "${role.name}" created successfully!`);
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