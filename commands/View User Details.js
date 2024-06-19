const { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { DetailsEmbed, ErrorEmbed } = require("../utils/embeds");
const { Error, Debug } = require("../utils/logging");
const { ICONS } = require("../utils/constants");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("View User Details")
        .setType(ApplicationCommandType.User)
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const targetUser = await interaction.client.users.fetch(interaction.targetId, { force: true });
            const guildMember = await interaction.guild.members.fetch(targetUser.id);

            // Get details
            const userTag = targetUser.tag;
            const userId = targetUser.id;

            // Joined Discord
            const createdTimestamp = targetUser.createdTimestamp;
            const formattedDiscordTimestamp = `<t:${Math.floor(createdTimestamp / 1000)}:f>`;

            // Joined Server
            const joinedTimestamp = guildMember.joinedTimestamp;
            const formattedJoinedTimestamp = `<t:${Math.floor(joinedTimestamp / 1000)}:f>`;

            // Highest role
            const highestRole = guildMember.roles.highest.name;

            // Get URLs
            const avatarURL = targetUser.avatarURL({ size: 4096 }) || null;
            const bannerURL = targetUser.bannerURL({ size: 4096 }) || null;

            // Badges
            let badges = '';
            const userFlags = await targetUser.fetchFlags();
            userFlags.toArray().forEach(flag => {
                if (flag === 'ActiveDeveloper') { badges += ICONS.active_developer; }
                if (flag === 'HypeSquadOnlineHouse1') { badges += ICONS.hypesquad_bravery; }
                if (flag === 'HypeSquadOnlineHouse2') { badges += ICONS.hypesquad_brilliance; }
                if (flag === 'HypeSquadOnlineHouse3') { badges += ICONS.hypesquad_balance; }
                if (flag === 'VerifiedBot') { badges += ICONS.verified_app; }
                if (flag === 'BotHTTPInteractions') { badges += ICONS.http_interactions; }
                if (flag === 'Staff') { badges += ICONS.discord_staff; }
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
