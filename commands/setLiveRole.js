const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { ErrorEmbed, SuccessEmbed } = require("../utils/embeds");
const { CommandError } = require("../utils/logging");
const { METADATA } = require("../utils/metadata");
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setliverole")
        .setDescription(METADATA.setliverole.description)
        .addRoleOption(option => option
            .setName('role')
            .setDescription(METADATA.setliverole.subcommand_description)
            .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const role = interaction.options.getRole('role');

            const dataFolder = path.join(__dirname, '..', 'data');
            if (!fs.existsSync(dataFolder)) {
                fs.mkdirSync(dataFolder);
            }

            const configFile = path.join(dataFolder, 'liveRoleConfig.json');
            let config = {};

            if (fs.existsSync(configFile)) {
                config = JSON.parse(fs.readFileSync(configFile));
            }

            config[interaction.guildId] = {
                roleId: role.id
            };

            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

            const successEmbed = SuccessEmbed('Success', `Live notifications role set to ${role}`);
            interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.stack);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed] });
            }
        }
    }
};
