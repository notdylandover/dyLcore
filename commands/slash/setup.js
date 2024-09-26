const { SlashCommandBuilder, SlashCommandSubcommandBuilder, ChannelType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { EMOJIS } = require('../../utils/constants');
const { JoinToCreateVC, SuccessEmbedRemodal, ErrorEmbed } = require('../../utils/embeds');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Manage setup for Join to Create VC feature')
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('join-to-create-vc')
            .setDescription('Set up the Join to Create VC feature in this server')
        ),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const guild = interaction.guild;
            const settingsFilePath = path.resolve(__dirname, `../../data/servers/${guild.id}.json`);

            if (!fs.existsSync(settingsFilePath)) {
                fs.writeFileSync(settingsFilePath, JSON.stringify({ createdChannels: [] }, null, 2));
            }

            const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

            const joinToCreateVCChannel = settings.joinToCreateVC ? guild.channels.cache.get(settings.joinToCreateVC) : null;
            const interfaceChannel = settings.interfaceChannel ? guild.channels.cache.get(settings.interfaceChannel) : null;

            if (interfaceChannel) {
                try {
                    const messages = await interfaceChannel.messages.fetch({ limit: 5 });
                    await interfaceChannel.bulkDelete(messages, true);
                } catch (err) {
                    console.error('Error deleting messages:', err);
                }
            }

            if (!joinToCreateVCChannel || !interfaceChannel) {
                if (joinToCreateVCChannel) await joinToCreateVCChannel.delete();
                if (interfaceChannel) await interfaceChannel.delete();

                const newCategory = await guild.channels.create({
                    name: 'Join to Create VC',
                    type: ChannelType.GuildCategory,
                });

                const newJoinToCreateVC = await guild.channels.create({
                    name: 'Join to Create VC',
                    type: ChannelType.GuildVoice,
                    parent: newCategory.id,
                });

                const newInterfaceChannel = await guild.channels.create({
                    name: 'voice-interface',
                    type: ChannelType.GuildText,
                    parent: newCategory.id,
                });

                settings.joinToCreateVC = newJoinToCreateVC.id;
                settings.interfaceChannel = newInterfaceChannel.id;
                fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
            }

            const renameButton = new ButtonBuilder()
                .setCustomId('rename_channel')
                .setEmoji(EMOJIS.RenameField)
                .setStyle(ButtonStyle.Secondary);

            const trustButton = new ButtonBuilder()
                .setCustomId('whitelist_user')
                .setEmoji(EMOJIS.AddUser)
                .setStyle(ButtonStyle.Secondary);

            const untrustButton = new ButtonBuilder()
                .setCustomId('blacklist_user')
                .setEmoji(EMOJIS.RemoveUser)
                .setStyle(ButtonStyle.Secondary);

            const lockButton = new ButtonBuilder()
                .setCustomId('lock_channel')
                .setEmoji(EMOJIS.lock)
                .setStyle(ButtonStyle.Secondary);

            const limitButton = new ButtonBuilder()
                .setCustomId('limit_user')
                .setEmoji(EMOJIS.limit)
                .setStyle(ButtonStyle.Secondary);
            
            const row = new ActionRowBuilder().addComponents(renameButton, trustButton, untrustButton, lockButton, limitButton);
            
            try {
                const JoinToCreateVCEmbed = JoinToCreateVC();

                await guild.channels.cache.get(settings.interfaceChannel).send({
                    embeds: [JoinToCreateVCEmbed],
                    components: [row],
                });
            } catch (err) {
                console.error('Error sending message:', err);
            }

            const successEmbed = SuccessEmbedRemodal('Join to Create VC has been set up or updated!');
            return interaction.editReply({ embeds: [successEmbed] });
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