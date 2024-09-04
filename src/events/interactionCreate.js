const { Error, Feedback, interactionCreate } = require('../../utils/logging');
const { ErrorEmbed, SuccessEmbed } = require('../../utils/embeds');
const { sendEmail } = require('../../utils/sendEmail');

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
                    
                    sendEmail(commandName, error.stack);

                    const errorEmbed = ErrorEmbed(`Error executing slash command ${commandName}`, error.message);

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
                    
                    sendEmail(commandName, error.stack);

                    const errorEmbed = ErrorEmbed(`Error executing context menu command ${commandName}`, error.message);

                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
            }
        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.stack}`);
            sendEmail(module.exports.name, error.stack);

            const errorEmbed = ErrorEmbed('Error executing interactionCreate', error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};