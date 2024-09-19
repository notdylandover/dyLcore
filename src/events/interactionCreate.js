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
                } else if (customId === 'trust_user') {
                    const modal = new ModalBuilder()
                        .setCustomId('trust_user_modal')
                        .setTitle('Trust a User');

                    const userIdInput = new TextInputBuilder()
                        .setCustomId('trusted_user_id')
                        .setLabel('Enter User ID or Name')
                        .setStyle(TextInputStyle.Short);

                    const row = new ActionRowBuilder().addComponents(userIdInput);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                } else if (customId === 'untrust_user') {
                    const modal = new ModalBuilder()
                        .setCustomId('untrust_user_modal')
                        .setTitle('Untrust a User');

                    const userIdInput = new TextInputBuilder()
                        .setCustomId('untrusted_user_id')
                        .setLabel('Enter User ID or Name')
                        .setStyle(TextInputStyle.Short);

                    const row = new ActionRowBuilder().addComponents(userIdInput);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                }
            } else if (interaction.isModalSubmit()) {
                const { customId } = interaction;
            
                if (customId === 'rename_channel_modal') {
                    const newChannelName = interaction.fields.getTextInputValue('new_channel_name');
                    const member = interaction.member;
                    const settingsFilePath = path.resolve(__dirname, `../../data/servers/${interaction.guild.id}.json`);
                    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
            
                    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);
            
                    if (!member.voice.channel) {
                        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
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
            
                    const member = interaction.member;
                    const settingsFilePath = path.resolve(__dirname, `../../data/servers/${interaction.guild.id}.json`);
                    const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
            
                    const channelInfo = settings.createdChannels.find(channel => channel.channelId === member.voice.channel.id);
            
                    if (channelInfo.ownerId !== member.id) {
                        const errorEmbed = ErrorEmbed('You do not own this channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
            
                    if (action === 'whitelist') {
                        channelInfo.whitelist.push(user.id);
                    } else {
                        channelInfo.blacklist.push(user.id);
                    }
            
                    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
                    const successEmbed = SuccessEmbedRemodal(`User <@${user.user.id}> has been ${action === 'whitelist' ? 'trusted' : 'untrusted'}`);
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