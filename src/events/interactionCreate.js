const { Error, interactionCreate } = require('../../utils/logging');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../utils/embeds');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            const isDM = !interaction.guild;
            const server = isDM ? 'DM' : interaction.guild.name;
            const channel = isDM ? 'DM' : interaction.channel ? interaction.channel.name : 'Unknown';
            const username = interaction.user.username;

            if (interaction.isChatInputCommand()) {
                const commandName = interaction.commandName;
                const commandContent = interaction.options
                    ? interaction.options.data.map(option => `${option.name}: ${option.value}`).join(', ')
                    : '';
                const commandFilePath = path.join(__dirname, '..', '..', 'commands', 'slash', `${commandName}.js`);

                try {
                    const command = require(commandFilePath);
                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - /${commandName.magenta} ${commandContent.magenta}`);
                    await command.execute(interaction);
                } catch (error) {
                    Error(`Error executing slash command ${commandName}:\n${error.stack}`);

                    const errorEmbed = ErrorEmbed(error.message);

                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
            } else if (interaction.isContextMenuCommand()) {
                const commandName = interaction.commandName;
                const commandFilePath = path.join(__dirname, '..', '..', 'commands', 'context', `${commandName}.js`);

                try {
                    const command = require(commandFilePath);
                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${commandName.magenta}`);
                    await command.execute(interaction);
                } catch (error) {
                    Error(`Error executing context menu command ${commandName}:\n${error.stack}`);

                    const errorEmbed = ErrorEmbed(error.message);

                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
            } else if (interaction.isButton()) {
                const { customId } = interaction;

                if (customId === 'rename_channel') {
                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Rename Channel").magenta}`);

                    const modal = new ModalBuilder()
                        .setCustomId('rename_channel_modal')
                        .setTitle('Rename Channel');

                    const newNameInput = new TextInputBuilder()
                        .setCustomId('new_channel_name')
                        .setLabel('New Channel Name')
                        .setStyle(TextInputStyle.Short);

                    const row = new ActionRowBuilder().addComponents(newNameInput);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                } else if (customId === 'whitelist_user') {
                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Whitelist User").magenta}`);

                    const modal = new ModalBuilder()
                        .setCustomId('trust_user_modal')
                        .setTitle('Whitelist a User');

                    const userIdInput = new TextInputBuilder()
                        .setCustomId('trusted_user_id')
                        .setLabel('Enter User ID or Name')
                        .setStyle(TextInputStyle.Short);

                    const row = new ActionRowBuilder().addComponents(userIdInput);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                } else if (customId === 'blacklist_user') {
                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Blacklist User").magenta}`);

                    const modal = new ModalBuilder()
                        .setCustomId('untrust_user_modal')
                        .setTitle('Blacklist a User');

                    const userIdInput = new TextInputBuilder()
                        .setCustomId('untrusted_user_id')
                        .setLabel('Enter User ID or Name')
                        .setStyle(TextInputStyle.Short);

                    const row = new ActionRowBuilder().addComponents(userIdInput);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                } else if (customId === 'lock_channel') {
                    const member = interaction.member;
            
                    if (!member.voice.channel) {
                        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
            
                    const settingsFilePath = path.resolve(__dirname, `../../data/servers/${interaction.guild.id}.json`);
                    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
            
                    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);
            
                    if (!channelInfo) {
                        const errorEmbed = ErrorEmbed('You are not in a created voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
            
                    if (channelInfo.ownerId !== member.id) {
                        const errorEmbed = ErrorEmbed('You do not own this channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
            
                    const voiceChannel = interaction.guild.channels.cache.get(member.voice.channel.id);
            
                    const everyoneRolePermissions = voiceChannel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);
            
                    const isLocked = everyoneRolePermissions?.deny.has('Connect');
            
                    if (isLocked) {
                        await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                            Connect: true
                        });
                        const unlockEmbed = SuccessEmbedRemodal('Channel has been unlocked. Everyone can connect.');
                        await interaction.reply({ embeds: [unlockEmbed], ephemeral: true });
                    } else {
                        await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                            Connect: false
                        });
                        const lockEmbed = SuccessEmbedRemodal('Channel has been locked. Only the owner can connect.');
                        await interaction.reply({ embeds: [lockEmbed], ephemeral: true });
                    }
                } else if (customId === 'limit_user') {
                    const member = interaction.member;
                
                    if (!member.voice.channel) {
                        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                
                    const modal = new ModalBuilder()
                        .setCustomId('limit_user_modal')
                        .setTitle('Set User Limit');
                
                    const userLimitInput = new TextInputBuilder()
                        .setCustomId('user_limit')
                        .setLabel('Enter User Limit (1-99)')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('1')
                        .setMaxLength(2);
                
                    const row = new ActionRowBuilder().addComponents(userLimitInput);
                    modal.addComponents(row);
                
                    await interaction.showModal(modal);
                }
                
            } else if (interaction.isModalSubmit()) {
                const { customId } = interaction;

                if (customId === 'rename_channel_modal') {
                    const newChannelName = interaction.fields.getTextInputValue('new_channel_name');
                    const member = interaction.member;

                    if (!member.voice.channel) {
                        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    const settingsFilePath = path.resolve(__dirname, `../../data/servers/${interaction.guild.id}.json`);
                    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

                    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);

                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Rename Channel").magenta} name:${newChannelName.magenta}`);

                    if (!channelInfo) {
                        const errorEmbed = ErrorEmbed('You are not in a created voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    if (channelInfo.ownerId !== member.id) {
                        const errorEmbed = ErrorEmbed('You do not own this channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    await member.voice.channel.setName(newChannelName);
                    const successEmbed = SuccessEmbedRemodal(`Channel renamed to \` ${newChannelName} \``);
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                } else if (customId === 'trust_user_modal' || customId === 'untrust_user_modal') {
                    const input = interaction.fields.getTextInputValue(customId === 'trust_user_modal' ? 'trusted_user_id' : 'untrusted_user_id');
                    const action = customId === 'trust_user_modal' ? 'whitelist' : 'blacklist';
                    let user;

                    try {
                        user = await interaction.guild.members.fetch(input);
                    } catch {
                        const members = await interaction.guild.members.fetch();
                        user = members.find(member => member.user.username === input || member.user.tag === input);
                    }

                    if (!user) {
                        const errorEmbed = ErrorEmbed('User not found.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${("Rename Channel").magenta} ${action.magenta}:${(user.user.tag).magenta}`);

                    const member = interaction.member;
                    const settingsFilePath = path.resolve(__dirname, `../../data/servers/${interaction.guild.id}.json`);
                    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

                    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);

                    if (!channelInfo) {
                        const errorEmbed = ErrorEmbed('You are not in a created voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    if (channelInfo.ownerId !== member.id) {
                        const errorEmbed = ErrorEmbed('You do not own this channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    const voiceChannel = interaction.guild.channels.cache.get(member.voice.channel.id);

                    if (action === 'whitelist') {
                        if (channelInfo.whitelist.includes(user.id)) {
                            const errorEmbed = ErrorEmbed(`User <@${user.user.id}> is already whitelisted.`);
                            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        }

                        const blacklistIndex = channelInfo.blacklist.indexOf(user.id);
                        if (blacklistIndex !== -1) {
                            channelInfo.blacklist.splice(blacklistIndex, 1);
                        }

                        channelInfo.whitelist.push(user.id);
                        await voiceChannel.permissionOverwrites.edit(user.id, {
                            Connect: true
                        });
                    } else if (action === 'blacklist') {
                        if (channelInfo.blacklist.includes(user.id)) {
                            const errorEmbed = ErrorEmbed(`User <@${user.user.id}> is already blacklisted.`);
                            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        }

                        const whitelistIndex = channelInfo.whitelist.indexOf(user.id);
                        if (whitelistIndex !== -1) {
                            channelInfo.whitelist.splice(whitelistIndex, 1);
                        }

                        channelInfo.blacklist.push(user.id);
                        await voiceChannel.permissionOverwrites.edit(user.id, {
                            Connect: false,
                            ViewChannel: true
                        });

                        if (user.voice.channel && user.voice.channel.id === voiceChannel.id) {
                            await user.voice.disconnect('Untrusted');
                        }
                    }

                    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
                    const successEmbed = SuccessEmbedRemodal(`User <@${user.user.id}> has been ${action === 'whitelist' ? 'whitelisted' : 'blacklisted'}`);
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                } else if (customId === 'limit_user_modal') {
                    const userLimit = interaction.fields.getTextInputValue('user_limit');
                    const member = interaction.member;
                    const parsedLimit = parseInt(userLimit);
                
                    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 99) {
                        const errorEmbed = ErrorEmbed('Invalid user limit. Please enter a number between 1 and 99.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                
                    if (!member.voice.channel) {
                        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                
                    const settingsFilePath = path.resolve(__dirname, `../../data/servers/${interaction.guild.id}.json`);
                    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
                
                    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);
                
                    if (!channelInfo) {
                        const errorEmbed = ErrorEmbed('You are not in a created voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                
                    if (channelInfo.ownerId !== member.id) {
                        const errorEmbed = ErrorEmbed('You do not own this channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                
                    await member.voice.channel.setUserLimit(parsedLimit);
                
                    const successEmbed = SuccessEmbedRemodal(`User limit has been set to \` ${parsedLimit} \`.`);
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};