const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, SlashCommandSubcommandBuilder, ChannelType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');

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
        const guild = interaction.guild;
        const settingsFilePath = path.resolve(__dirname, `../../data/servers/${guild.id}.json`);

        if (!fs.existsSync(settingsFilePath)) {
            fs.writeFileSync(settingsFilePath, JSON.stringify({}, null, 2));
        }

        const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

        const joinToCreateVCChannel = settings.joinToCreateVC ? guild.channels.cache.get(settings.joinToCreateVC) : null;
        const interfaceChannel = settings.interfaceChannel ? guild.channels.cache.get(settings.interfaceChannel) : null;

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
            .setLabel('Rename Channel')
            .setStyle(ButtonStyle.Secondary);

        const trustButton = new ButtonBuilder()
            .setCustomId('trust_user')
            .setLabel('Trust User')
            .setStyle(ButtonStyle.Secondary);

        const untrustButton = new ButtonBuilder()
            .setCustomId('untrust_user')
            .setLabel('Untrust User')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(renameButton, trustButton, untrustButton);

        await guild.channels.cache.get(settings.interfaceChannel).send({
            content: 'Manage your Join to Create VC here:',
            components: [row],
        });

        return interaction.reply({ content: 'Join to Create VC has been set up or updated!', ephemeral: true });
    }
};