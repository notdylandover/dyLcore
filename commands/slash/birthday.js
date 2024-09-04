const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { ErrorEmbed, SuccessEmbed } = require('../../utils/embeds');
const { CommandError } = require('../../utils/logging');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Manage birthdays')
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set your birthday')
            .addStringOption(option => option
                .setName('date')
                .setDescription('Your birthdate in MM-DD-YYYY format')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.tag;
        const dataPath = path.join(__dirname, '../../data');
        const filePath = path.join(dataPath, 'birthdays.json');

        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }

        let birthdays = {};

        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            birthdays = JSON.parse(rawData);
        }

        try {
            const date = interaction.options.getString('date');
            const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
            
            if (!dateRegex.test(date)) {
                return await interaction.reply({
                    embeds: [ErrorEmbed("Invalid date format. Please use MM-DD-YYYY.")],
                    ephemeral: true
                });
            }

            birthdays[userId] = { username, birthday: date };
            fs.writeFileSync(filePath, JSON.stringify(birthdays, null, 2));

            const successEmbed = SuccessEmbed(`Successfully set your birthday to ${date}.`)

            return await interaction.reply({ embeds: [successEmbed], ephemeral: true});
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};