const { Error, Feedback, interactionCreate } = require('../../utils/logging');
const { ErrorEmbed, SuccessEmbed } = require('../../utils/embeds');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const isDM = !interaction.inGuild();
        const server = isDM ? 'DM' : interaction.guild.name;
        const channel = isDM ? 'DM' : interaction.channel.name;
        const username = interaction.user.username;

        if (interaction.isCommand()) {
            const commandName = interaction.commandName;
            const commandContent = interaction.options
                ? interaction.options.data.map(option => `${option.name}: ${option.value}`).join(', ')
                : '';
            const commandFilePath = path.join(__dirname, '..', '..', 'commands', `${commandName}.js`);

            try {
                const command = require(commandFilePath);
                interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - ${commandName.magenta} ${commandContent.magenta}`);
                await command.execute(interaction);
            } catch (e) {
                Error(`Error executing /${commandName}: ${e.message}`);
                const errorEmbed = ErrorEmbed(`Error executing ${commandName}`, e.message);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        } else if (interaction.isContextMenuCommand()) {
            const commandName = interaction.commandName;
            const commandFilePath = path.join(__dirname, '..', '..', 'commands', `${commandName}.js`);

            try {
                const command = require(commandFilePath);
                interactionCreate(`${server.cyan} - ${('#' + channel).cyan} - ${username.cyan} - Context Menu: ${commandName}`);
                await command.execute(interaction);
            } catch (e) {
                Error(`Error executing context menu command ${commandName}: ${e.message}`);
                const errorEmbed = ErrorEmbed(`Error executing context menu command ${commandName}`, e.message);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'feedbackModal') {
                const feedback = interaction.fields.getTextInputValue('feedbackInput');
                
                try {
                    Feedback(username, feedback);

                    const successEmbed = SuccessEmbed('Feedback submitted successfully', 'Thank you for your feedback!');
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                } catch (error) {
                    const errorEmbed = ErrorEmbed('Error handling feedback', error);
                    Error(`Error handling feedback: ${error.message}`);

                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
            }
        }
    }
};