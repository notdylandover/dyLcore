const { ChannelType, GuildFeature, SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require("discord.js");
const { ServerEmbed, ErrorEmbed } = require("../../utils/embeds");
const { Error, CommandError } = require("../../utils/logging");
const { BADGES, EMOJIS } = require("../../utils/constants");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription('Get information about the server')
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const guild = interaction.guild;

            if (!guild) {
                const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, 'Cannot find information about this guild.');
                Error(`Error executing ${interaction.commandName}: Cannot find information about this guild.`);

                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
                return;
            }

            let features = '';
            const guildBanner = guild.bannerURL();
            const guildIcon = guild.iconURL();
            const guildName = guild.name;
            const guildDescription = guild.description || ' ';
            const guildId = guild.id;
            const guildOwner = `<@${guild.ownerId}>`;
            const guildCreatedAt = guild.createdAt;
            const formattedGuildCreatedAt = `<t:${Math.floor(guildCreatedAt / 1000)}:f>`;

            let roles = '';
            if (guild.roles.cache.size > 1 || guild.roles.cache.size === 0) { roles = `${guild.roles.cache.size} roles`; }
            else if (guild.roles.cache.size === 1) { roles = `${guild.roles.cache.size} role`; }

            let userCount = '';
            if (guild.memberCount > 1 || guild.memberCount === 0) { userCount = `${guild.memberCount} users`; }
            else if (guild.memberCount === 1) { userCount = `${guild.memberCount} user`; }
            
            let emojiCount = '';
            if (guild.emojis.cache.size > 1 || guild.emojis.cache.size === 0) { emojiCount = `${guild.emojis.cache.size} emojis`; }
            else if (guild.emojis.cache.size === 1) { emojiCount = `${guild.emojis.cache.size} emoji`; }

            let stickerCount = '';
            if (guild.stickers.cache.size > 1 || guild.stickers.cache.size === 0) { stickerCount = `${guild.stickers.cache.size} stickers`; }
            else if (guild.stickers.cache.size === 1) { stickerCount = `${guild.stickers.cache.size} sticker`; }

            const announcementChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildAnnouncement).size;
            const categoryChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size;
            const directoryChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildDirectory).size;
            const forumChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildForum).size;
            const mediaChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildMedia).size;
            const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
            const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
            const stageChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildStageVoice).size;

            guild.features.forEach(feature => {
                if (feature === GuildFeature.AnimatedIcon) {
                    features += `${EMOJIS.ico_media} \` Animated Icon \`\n`;
                }
                if (feature === GuildFeature.AnimatedBanner) {
                    features += `${EMOJIS.ico_media} \` Animated Banner \`\n`;
                }
                if (feature === GuildFeature.AutoModeration) {
                    features += `${EMOJIS.automod} \` AutoMod \`\n`;
                }
                if (feature === GuildFeature.Community) {
                    features += `${EMOJIS.Community} \` Community \`\n`;
                }
                if (feature === GuildFeature.DeveloperSupportServer) {
                    features += `${BADGES.active_developer} \` Developer Support Server \`\n`;
                }
                if (feature === GuildFeature.Partnered) {
                    features += `${EMOJIS.Partnered} \` Partnered \`\n`;
                }
                if (feature === GuildFeature.Verified) {
                    features += `${EMOJIS.Partnered} \` Verified \`\n`;
                }
            });

            let channels = '```js\n';
            if (textChannels > 0)           channels += `Text Channels          ${textChannels}\n`;
            if (voiceChannels > 0)          channels += `Voice Channels         ${voiceChannels}\n`;
            if (announcementChannels > 0)   channels += `Announcement Channels  ${announcementChannels}\n`;
            if (stageChannels > 0)          channels += `Stage Channels         ${stageChannels}\n`;
            if (categoryChannels > 0)       channels += `Categories             ${categoryChannels}\n`;
            if (directoryChannels > 0)      channels += `Directory Channels     ${directoryChannels}\n`;
            if (forumChannels > 0)          channels += `Forum Channels         ${forumChannels}\n`;
            if (mediaChannels > 0)          channels += `Media Channels         ${mediaChannels}\n`;
            channels += '```';

            const serverEmbed = ServerEmbed(
                guildName, 
                guildId,
                roles,
                userCount,
                emojiCount,
                stickerCount,
                guildDescription,
                guildIcon,
                guildBanner,
                guildOwner,
                formattedGuildCreatedAt,
                features,
                channels
            );

            await interaction.editReply({ embeds: [serverEmbed] });
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