// src/commands/slash/live.js
const { SlashCommandBuilder } = require('discord.js');
const { SuccessEmbed, ErrorEmbed } = require('../../utils/embeds');

const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('live')
        .setDescription('Manage live users')
        .addSubcommand(subcommand => subcommand
            .setName('adduser')
            .setDescription('Add a Twitch user to live notifications')
            .addStringOption(option => option
                .setName('twitchusername')
                .setDescription('Their Twitch username')
                .setRequired(true)
            )
            .addUserOption(option => option
                .setName('discorduser')
                .setDescription('Their Discord username (if applicable)')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('removeuser')
            .setDescription('Remove a Twitch user from live notifications')
            .addStringOption(option => option
                .setName('twitchusername')
                .setDescription('Their Twitch username')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        try {
            const guildId = interaction.guild.id;
            const serverConfigPath = path.join(__dirname, '../../data/servers', `${guildId}.json`);
            let serverConfig = {};

            if (fs.existsSync(serverConfigPath)) {
                serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf-8'));
            }

            if (serverConfig.liveChannelId === undefined) {
                return interaction.reply({ embeds: [ErrorEmbed('Please set a live channel first.')], ephemeral: true });
            } else if (serverConfig.liveRoleId === undefined) {
                return interaction.reply({ embeds: [ErrorEmbed('Please set a live role first.')], ephemeral: true });
            }

            if (!serverConfig.twitchUsers) {
                serverConfig.twitchUsers = [];
            }

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'adduser') {
                const twitchUsername = interaction.options.getString('twitchusername');
                const discordUser = interaction.options.getUser('discorduser');

                if (serverConfig.twitchUsers.find(user => user.twitchUsername === twitchUsername)) {
                    return interaction.reply({ embeds: [ErrorEmbed('User already exists.')], ephemeral: true });
                }

                serverConfig.twitchUsers.push({
                    twitchUsername,
                    discordUserId: discordUser ? discordUser.id : null
                });

                fs.writeFileSync(serverConfigPath, JSON.stringify(serverConfig, null, 2));

                let description = `Added the Twitch user \`${twitchUsername}\` to live notifications.`;

                if (discordUser) {
                    description += `\nThey will also recieve the live role configured.`;
                }

                return interaction.reply({ embeds: [SuccessEmbed(description)], ephemeral: true });
            }

            if (subcommand === 'removeuser') {
                const twitchUsername = interaction.options.getString('twitchusername');
                const index = serverConfig.twitchUsers.findIndex(user => user.twitchUsername === twitchUsername);

                if (index === -1) {
                    return interaction.reply({ embeds: [ErrorEmbed('User not found.')], ephemeral: true });
                }

                serverConfig.twitchUsers.splice(index, 1);
                fs.writeFileSync(serverConfigPath, JSON.stringify(serverConfig, null, 2));

                return interaction.reply({ embeds: [SuccessEmbed(`Removed the Twitch user \` ${twitchUsername} \` from live notifications.`)], ephemeral: true });
            }
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