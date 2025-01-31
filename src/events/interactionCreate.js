const { Error, interactionCreate } = require('../../utils/logging');
const { ErrorEmbed } = require('../../utils/embeds');
const { getUserEntitlement } = require('../../utils/entitlement');

// Buttons
const createTicket = require('../events/interactionCreate/button/createTicket');
const closeTicket = require('../events/interactionCreate/button/closeTicket');
const confirmCloseTicket = require('../events/interactionCreate/button/confirmCloseTicket');
const blacklistUser = require('../events/interactionCreate/button/blacklistUser');
const whitelistUser = require('../events/interactionCreate/button/whitelistUser');
const renameChannel = require('../events/interactionCreate/button/renameChannel');
const limitUser = require('../events/interactionCreate/button/limitUser');
const lockChannel = require('../events/interactionCreate/button/lockChannel');
const claimTicket = require('../events/interactionCreate/button/claimTicket');

// Modals
const whitelistUserModal = require('../events/interactionCreate/modalSubmit/whitelistUser');
const blacklistUserModal = require('../events/interactionCreate/modalSubmit/blacklistUser');
const renameChannelModal = require('../events/interactionCreate/modalSubmit/renameChannel');
const limitUserModal = require('../events/interactionCreate/modalSubmit/limitUser');
const feedbackModal = require('../events/interactionCreate/modalSubmit/feedbackModal');

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

                    if (!command.enabled) {
                        return;
                    }
            
                    if (command.premium) {
                        const entitlement = await getUserEntitlement(username);
                        
                        const testingFilePath = path.join(__dirname, '..', '..', 'data', 'testing.json');
                        let isTestingUser = false;
            
                        if (fs.existsSync(testingFilePath)) {
                            const fileContent = fs.readFileSync(testingFilePath, 'utf-8');
                            const usersData = JSON.parse(fileContent);
                            isTestingUser = usersData.users.includes(username);
                        }
            
                        if (!isTestingUser && (!entitlement || !entitlement.skus || entitlement.skus.length === 0)) {
                            const errorEmbed = ErrorEmbed('You do not have access to this premium command.');
                            return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                        }
                    }
            
                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - /${commandName.magenta} ${commandContent.magenta}`);
                    await command.execute(interaction);
                } catch (error) {
                    Error(`Error executing slash command ${commandName}:\n${error.stack}`);
            
                    const errorEmbed = ErrorEmbed(error.message);
            
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                    }
                }
            } else if (interaction.isContextMenuCommand()) {
                const commandName = interaction.commandName;
                const commandFilePath = path.join(__dirname, '..', '..', 'commands', 'context', `${commandName}.js`);
            
                try {
                    const command = require(commandFilePath);
            
                    if (command.premium) {
                        const entitlement = await getUserEntitlement(username);
                        
                        const testingFilePath = path.join(__dirname, '..', '..', 'data', 'testing.json');
                        let isTestingUser = false;
            
                        if (fs.existsSync(testingFilePath)) {
                            const fileContent = fs.readFileSync(testingFilePath, 'utf-8');
                            const usersData = JSON.parse(fileContent);
                            isTestingUser = usersData.users.includes(username);
                        }
            
                        if (!isTestingUser && (!entitlement || !entitlement.skus || entitlement.skus.length === 0)) {
                            const errorEmbed = ErrorEmbed('You do not have access to this premium command.');
                            return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                        }
                    }
            
                    interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${commandName.magenta}`);
                    await command.execute(interaction);
                } catch (error) {
                    Error(`Error executing context menu command ${commandName}:\n${error.stack}`);
            
                    const errorEmbed = ErrorEmbed(error.message);
            
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                    }
                }
            } else if (interaction.isButton()) {
                const { customId } = interaction;

                if (customId === 'rename_channel') {
                    renameChannel(interaction);
                } else if (customId === 'whitelist_user') {
                    whitelistUser(interaction);
                } else if (customId === 'blacklist_user') {
                    blacklistUser(interaction);
                } else if (customId === 'lock_channel') {
                    lockChannel(interaction);
                } else if (customId === 'limit_user') {
                    limitUser(interaction);
                } else if (customId === 'create_ticket') {
                    createTicket(interaction);
                } else if (customId === 'close_ticket') {
                    closeTicket(interaction);
                } else if (customId === 'confirm_close_ticket') {
                    confirmCloseTicket(interaction);
                } else if (interaction.customId === 'claim_ticket') {
                    await claimTicket(interaction);
                }
                
            } else if (interaction.isModalSubmit()) {
                const { customId } = interaction;

                if (customId === 'rename_channel_modal') {
                    await renameChannelModal(interaction);
                } else if (customId === 'trust_user_modal') {
                    await whitelistUserModal(interaction);
                } else if (customId === 'untrust_user_modal') {
                    await blacklistUserModal(interaction);
                } else if (customId === 'limit_user_modal') {
                    await limitUserModal(interaction);
                } else if (interaction.customId === 'ticketFeedback') {
                    await feedbackModal(interaction);
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}:\n${error.stack}`);

            const errorEmbed = ErrorEmbed(error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};