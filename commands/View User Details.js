const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { UserEmbed, ErrorEmbed } = require("../utils/embeds");
const { Error, CommandError } = require("../utils/logging");
const { ICONS, BADGES } = require("../utils/constants");

const command = new ContextMenuCommandBuilder()
    .setName("View User Details")
    .setType(ApplicationCommandType.User)
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

command.integration_types = [
    1
];

module.exports = {
    data: command,
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const targetUser = await interaction.client.users.fetch(interaction.targetId, { force: true });
            const guildMember = await interaction.guild.members.fetch(targetUser.id);
            const userTag = targetUser.tag;
            const userId = targetUser.id;
            const createdTimestamp = targetUser.createdTimestamp;
            const formattedDiscordTimestamp = `<t:${Math.floor(createdTimestamp / 1000)}:f>`;
            const joinedTimestamp = guildMember.joinedTimestamp;
            const formattedJoinedTimestamp = `<t:${Math.floor(joinedTimestamp / 1000)}:f>`;
            const highestRole = guildMember.roles.highest.name;
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

            if (avatarURL.endsWith('.gif') || bannerURL) { badges += BADGES.nitro }

            if (!badges) {
                badges = '\` None \`';
            }

            const userEmbed = UserEmbed(userTag, userId, highestRole, badges, formattedDiscordTimestamp, formattedJoinedTimestamp, avatarURL, bannerURL);
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
