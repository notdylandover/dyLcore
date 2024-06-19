const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { DetailsEmbed, ErrorEmbed } = require("../utils/embeds");
const { Error, Debug } = require("../utils/logging");
const { ICONS } = require("../utils/constants");
const { METADATA } = require('../utils/metadata');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription(METADATA.user.description)
        .addStringOption(option => option
            .setName('userid')
            .setDescription('The ID of the user to view details of')
            .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const userId = interaction.options.getString('userid');
            const targetUser = await interaction.client.users.fetch(userId);

            const userTag = targetUser.tag;

            const createdTimestamp = targetUser.createdTimestamp;
            const formattedDiscordTimestamp = `<t:${Math.floor(createdTimestamp / 1000)}:f>`;

            let guildMember;
            let highestRole = 'Not a member of this server';
            let formattedJoinedTimestamp = 'Not a member of this server';

            try {
                guildMember = await interaction.guild.members.fetch(userId);
                const joinedTimestamp = guildMember.joinedTimestamp;
                formattedJoinedTimestamp = `<t:${Math.floor(joinedTimestamp / 1000)}:f>`;
                highestRole = guildMember.roles.highest.name;
            } catch (guildMemberError) {
                Debug(`User ${userTag} is not a member of the server`);
            }

            const avatarURL = targetUser.avatarURL({ size: 4096 }) || null;
            const bannerURL = targetUser.bannerURL({ size: 4096 }) || null;

            let badges = '';
            const userFlags = await targetUser.fetchFlags();

            userFlags.toArray().forEach(flag => {
                Debug(flag)
                if (flag === 'ActiveDeveloper') { badges += ICONS.active_developer; }
                if (flag === 'BotHTTPInteractions') { badges += ICONS.http_interactions; }
                if (flag === 'BugHunterLevel1') { badges += ICONS.BugHunter; }
                if (flag === 'BugHunterLevel2') { badges += ICONS.BugHunterGold; }
                if (flag === 'CertifiedModerator') { badges += ICONS.CertifiedModerator; }
                if (flag === 'HypeSquadOnlineHouse1') { badges += ICONS.hypesquad_bravery; }
                if (flag === 'HypeSquadOnlineHouse2') { badges += ICONS.hypesquad_brilliance; }
                if (flag === 'HypeSquadOnlineHouse3') { badges += ICONS.hypesquad_balance; }
                if (flag === 'Quarentined') { badges += ICONS.exclamation; }
                if (flag === 'Spammer') { badges += ICONS.exclamation; }
                if (flag === 'Staff') { badges += ICONS.discord_staff; }
                if (flag === 'VerifiedBot') { badges += ICONS.verified_app; }
                if (flag === 'VerifiedDeveloper') { badges += ICONS.verified_app; }
            });

            if (avatarURL.endsWith('.gif') || bannerURL) { badges += ICONS.nitro }

            if (!badges) {
                badges = '\` None \`';
            }

            const detailsEmbed = DetailsEmbed(userTag, userId, highestRole, badges, formattedDiscordTimestamp, formattedJoinedTimestamp, avatarURL, bannerURL);
            await interaction.editReply({ embeds: [detailsEmbed] });
        } catch (error) {
            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            Error(`Error executing ${interaction.commandName}: ${error.message}`);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};