const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { UserEmbed, ErrorEmbed } = require("../utils/embeds");
const { Error, CommandError } = require("../utils/logging");
const { ICONS, BADGES } = require("../utils/constants");
const { METADATA } = require('../utils/metadata');

const command = new SlashCommandBuilder()
    .setName("user")
    .setDescription(METADATA.user.description)
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to view details of')
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const userId = interaction.options.getString('userid');
            const userOption = interaction.options.getUser('user');
            let targetUser;

            if (!userId && !userOption) {
                throw new Error('You must provide either a user ID or a user.');
            }

            if (userOption) {
                targetUser = userOption;
            } else if (userId) {
                targetUser = await interaction.client.users.fetch(userId);
            }

            const userTag = targetUser.tag;

            const createdTimestamp = targetUser.createdTimestamp;
            const formattedDiscordTimestamp = `<t:${Math.floor(createdTimestamp / 1000)}:f>`;

            let guildMember;
            let highestRole = 'Not a member of this server';
            let formattedJoinedTimestamp = 'Not a member of this server';

            try {
                guildMember = await interaction.guild.members.fetch(targetUser.id);
                const joinedTimestamp = guildMember.joinedTimestamp;
                formattedJoinedTimestamp = `<t:${Math.floor(joinedTimestamp / 1000)}:f>`;
                highestRole = guildMember.roles.highest.name;
            } catch (error) {
                return;
            }

            const avatarURL = targetUser.avatarURL({ size: 4096 }) || null;
            const bannerURL = targetUser.bannerURL({ size: 4096 }) || null;

            let badges = '';
            const userFlags = await targetUser.fetchFlags();

            userFlags.toArray().forEach(flag => {
                if (flag === 'ActiveDeveloper') { badges += BADGES.active_developer; }
                if (flag === 'BotHTTPInteractions') { badges += BADGES.http_interactions; }
                if (flag === 'BugHunterLevel1') { badges += BADGES.BugHunter; }
                if (flag === 'BugHunterLevel2') { badges += BADGES.BugHunterGold; }
                if (flag === 'CertifiedModerator') { badges += BADGES.CertifiedModerator; }
                if (flag === 'HypeSquadOnlineHouse1') { badges += BADGES.hypesquad_bravery; }
                if (flag === 'HypeSquadOnlineHouse2') { badges += BADGES.hypesquad_brilliance; }
                if (flag === 'HypeSquadOnlineHouse3') { badges += BADGES.hypesquad_balance; }
                if (flag === 'Quarentined') { badges += ICONS.exclamation; }
                if (flag === 'Spammer') { badges += ICONS.exclamation; }
                if (flag === 'Staff') { badges += BADGES.discord_staff; }
                if (flag === 'VerifiedBot') { badges += BADGES.verified_app; }
                if (flag === 'VerifiedDeveloper') { badges += BADGES.verified_app; }
            });

            if (avatarURL.endsWith('.gif') || bannerURL) { badges += BADGES.nitro; }

            if (!badges) {
                badges = '\` None \`';
            }

            const userEmbed = UserEmbed(userTag, targetUser.id, highestRole, badges, formattedDiscordTimestamp, formattedJoinedTimestamp, avatarURL, bannerURL);
            await interaction.editReply({ embeds: [userEmbed] });
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