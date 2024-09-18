const { Error, interactionCreate } = require('../../utils/logging');
const { ErrorEmbed, SuccessEmbedRemodal } = require('../../utils/embeds');
const path = require('path');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

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
            
                    if (!member.voice.channel) {
                        const errorEmbed = ErrorEmbed('You are not in a voice channel.');
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
            
                    const channel = member.voice.channel;
            
                    await channel.setName(newChannelName);
                    const successEmbed = SuccessEmbedRemodal(`Channel renamed to \` ${newChannelName} \``);

                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                } else if (customId === 'trust_user_modal') {
                    const input = interaction.fields.getTextInputValue('trusted_user_id');
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
                    
                    const successEmbed = SuccessEmbedRemodal(`User <@${user.user.id}> has been trusted`);
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                } else if (customId === 'untrust_user_modal') {
                    const input = interaction.fields.getTextInputValue('untrusted_user_id');
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
                    
                    const successEmbed = SuccessEmbedRemodal(`User <@${user.user.id}> has been untrusted`);
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }
            
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.stack}`);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};