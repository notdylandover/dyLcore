const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { UserEmbed, ErrorEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");
const { EMOJIS } = require("../../utils/constants");

const command = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Get user details")
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
            let highestRolePermissions = 'No special permissions';
            let formattedJoinedTimestamp = 'Not a member of this server';

            try {
                guildMember = await interaction.guild.members.fetch(targetUser.id);
                const joinedTimestamp = guildMember.joinedTimestamp;
                formattedJoinedTimestamp = `<t:${Math.floor(joinedTimestamp / 1000)}:f>`;
                highestRole = guildMember.roles.highest.name;
                highestRolePermissions = guildMember.roles.highest.permissions.toArray()
                    .map(permission => `\` ${permission} \``)
                    .join('\n') || 'No special permissions';
            } catch (error) {
                return Error(interaction.commandName, error.stack);
            }

            const avatarURL = targetUser.avatarURL({ size: 4096 }) || null;
            const bannerURL = targetUser.bannerURL({ size: 4096 }) || null;

            let badges = '';
            const userFlags = await targetUser.fetchFlags();

            userFlags.toArray().forEach(flag => {
                if (flag === 'ActiveDeveloper') { badges += EMOJIS.ActiveDeveloper; }
                if (flag === 'BotHTTPInteractions') { badges += EMOJIS.HTTPInteractions; }
                if (flag === 'BugHunterLevel1') { badges += EMOJIS.BugHunter; }
                if (flag === 'BugHunterLevel2') { badges += EMOJIS.BugHunterGold; }
                if (flag === 'CertifiedModerator') { badges += EMOJIS.ModeratorAlumni; }
                if (flag === 'HypeSquadOnlineHouse1') { badges += EMOJIS.HypesquadBravery; }
                if (flag === 'HypeSquadOnlineHouse2') { badges += EMOJIS.HypesquadBrilliance; }
                if (flag === 'HypeSquadOnlineHouse3') { badges += EMOJIS.HypesquadBalance; }
                if (flag === 'Quarentined') { badges += EMOJIS.exclamation; }
                if (flag === 'Spammer') { badges += EMOJIS.exclamation; }
                if (flag === 'Staff') { badges += EMOJIS.DiscordStaff; }
                if (flag === 'VerifiedBot') { badges += EMOJIS.VerifiedApp; }
                if (flag === 'VerifiedDeveloper') { badges += EMOJIS.VerifiedApp; }
            });

            if (avatarURL.endsWith('.gif') || bannerURL) { badges += EMOJIS.Nitro; }

            if (!badges) {
                badges = '\` None \`';
            }

            const userEmbed = UserEmbed(userTag, targetUser.id, highestRole, highestRolePermissions, badges, formattedDiscordTimestamp, formattedJoinedTimestamp, avatarURL, bannerURL);
            await interaction.editReply({ embeds: [userEmbed] });
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