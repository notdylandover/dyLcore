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
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'join-to-create-vc') {
            const guild = interaction.guild;
            const settingsFilePath = path.resolve(__dirname, `../../data/servers/${guild.id}.json`);

            // Initialize settings file if it does not exist
            if (!fs.existsSync(settingsFilePath)) {
                fs.writeFileSync(settingsFilePath, JSON.stringify({}, null, 2));
            }

            const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

            // Retrieve channels from cache
            const joinToCreateVCChannel = settings.joinToCreateVC ? guild.channels.cache.get(settings.joinToCreateVC) : null;
            const interfaceChannel = settings.interfaceChannel ? guild.channels.cache.get(settings.interfaceChannel) : null;
            const category = settings.category ? guild.channels.cache.get(settings.category) : null;

            // Recreate channels if they don't exist or are missing
            if (!joinToCreateVCChannel || !interfaceChannel || !category) {
                // Delete existing channels if they exist
                if (joinToCreateVCChannel) await joinToCreateVCChannel.delete();
                if (interfaceChannel) await interfaceChannel.delete();
                if (category) await category.delete();

                // Create a new category
                const newCategory = await guild.channels.create({
                    name: 'Voice Channels',
                    type: ChannelType.GuildCategory,
                });

                // Create new voice and text channels under the new category
                const newJoinToCreateVC = await guild.channels.create({
                    name: 'Join to Create VC',
                    type: ChannelType.GuildVoice,
                    parent: newCategory,
                });

                const newInterfaceChannel = await guild.channels.create({
                    name: 'voice-interface',
                    type: ChannelType.GuildText,
                    parent: newCategory,
                });

                // Update settings
                settings.joinToCreateVC = newJoinToCreateVC.id;
                settings.interfaceChannel = newInterfaceChannel.id;
                settings.category = newCategory.id;
                fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
            }

            // Create buttons
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

            // Send management message
            await guild.channels.cache.get(settings.interfaceChannel).send({
                content: 'Manage your Join to Create VC here:',
                components: [row]
            });

            return interaction.reply({ content: 'Join to Create VC has been set up or updated!', ephemeral: true });
        } else {
            return interaction.reply({ content: 'Invalid subcommand', ephemeral: true });
        }
    }
};