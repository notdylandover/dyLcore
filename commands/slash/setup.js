const { SlashCommandBuilder, SlashCommandSubcommandBuilder, ChannelType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder, Role, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { EMOJIS } = require('../../utils/constants');
const { JoinToCreateVC, SuccessEmbedRemodal, ErrorEmbed, TicketEmbed } = require('../../utils/embeds');
const fs = require('fs');
const path = require('path');

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Manage features for this server')
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('join-to-create-vc')
            .setDescription('Set up the Join to Create VC feature in this server')
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('game-updates')
            .setDescription('Set up the Game Updates feature in this server')
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('ticket-system')
            .setDescription('Set up the Ticket System in this server')
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

            if (interaction.options.getSubcommand() === 'game-updates') {
                const gameUpdatesChannel = settings.gameUpdatesChannel ? guild.channels.cache.get(settings.gameUpdatesChannel) : null;

                if (gameUpdatesChannel) {
                    await gameUpdatesChannel.delete();
                }

                const newGameUpdatesChannel = await guild.channels.create({
                    name: 'game-updates',
                    type: ChannelType.GuildText,
                });

                settings.gameUpdatesChannel = newGameUpdatesChannel.id;
                fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));

                const successEmbed = SuccessEmbedRemodal('Game Updates channel has been set up or updated!');
                return interaction.editReply({ embeds: [successEmbed] });
            } else if (interaction.options.getSubcommand() === 'join-to-create-vc') {
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
            } else if (interaction.options.getSubcommand() === 'ticket-system') {
                const existingCategory = settings.ticketCategory ? guild.channels.cache.get(settings.ticketCategory) : null;
                const existingInterfaceChannel = settings.ticketInterfaceChannel ? guild.channels.cache.get(settings.ticketInterfaceChannel) : null;
            
                if (existingInterfaceChannel) {
                    try {
                        const messages = await existingInterfaceChannel.messages.fetch({ limit: 5 });
                        await existingInterfaceChannel.bulkDelete(messages, true);
                    } catch (err) {
                        console.error('Error deleting messages:', err);
                    }
                }
            
                if (!existingCategory || !existingInterfaceChannel) {
                    if (existingCategory) await existingCategory.delete();
                    if (existingInterfaceChannel) await existingInterfaceChannel.delete();
            
                    const newCategory = await guild.channels.create({
                        name: 'Tickets',
                        type: ChannelType.GuildCategory,
                    });
            
                    const newInterfaceChannel = await guild.channels.create({
                        name: 'ticket-interface',
                        type: ChannelType.GuildText,
                        parent: newCategory.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [
                                    PermissionFlagsBits.SendMessages, 
                                    PermissionFlagsBits.EmbedLinks,
                                    PermissionFlagsBits.AttachFiles,
                                    PermissionFlagsBits.UseExternalEmojis,
                                    PermissionFlagsBits.AddReactions
                                ],
                                allow: [
                                    PermissionFlagsBits.ViewChannel,
                                    PermissionFlagsBits.ReadMessageHistory
                                ]
                            }
                        ]
                    });
            
                    settings.ticketCategory = newCategory.id;
                    settings.ticketInterfaceChannel = newInterfaceChannel.id;
                    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
                }
            
                const ticketButton = new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary);
            
                const row = new ActionRowBuilder().addComponents(ticketButton);
            
                const ticketEmbed = TicketEmbed();
            
                await guild.channels.cache.get(settings.ticketInterfaceChannel).send({
                    embeds: [ticketEmbed],
                    components: [row],
                });
            
                let ticketModeratorRole = guild.roles.cache.find(role => role.name === 'Ticket Moderator');
                if (!ticketModeratorRole) {
                    ticketModeratorRole = await guild.roles.create({
                        name: 'Ticket Moderator',
                        permissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages],
                    });
                }
                settings.ticketModeratorRoleId = ticketModeratorRole.id;
                fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
            
                const successEmbed = SuccessEmbedRemodal('Ticket System has been set up or updated!');
                return interaction.editReply({ embeds: [successEmbed] });
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