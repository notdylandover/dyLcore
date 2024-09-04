const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { ErrorEmbed, SuccessEmbed } = require('../../utils/embeds');
const { Debug, CommandError } = require('../../utils/logging');

const command = new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Manage birthdays')
    .addSubcommand(subcommand =>
        subcommand
            .setName('set')
            .setDescription('Set your birthday')
            .addStringOption(option =>
                option.setName('date')
                    .setDescription('Your birthdate in MM-DD-YYYY format')
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(true);

module.exports = {
    data: command,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
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
            if (subcommand === 'set') {
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

                return await interaction.reply({
                    embeds: [SuccessEmbed(`Successfully set your birthday to ${date}.`)],
                    ephemeral: true
                });
            } else {
                if (birthdays[userId]) {
                    const { birthday } = birthdays[userId];
                    const [month, day] = birthday.split('-');
                    const months = [
                        "January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"
                    ];
                    const formattedDate = `${months[parseInt(month) - 1]} ${parseInt(day)}`;

                    return await interaction.reply({
                        content: `${username}'s birthday is on ${formattedDate}.`,
                        ephemeral: true
                    });
                } else {
                    return await interaction.reply({
                        content: "No birthdate set.",
                        ephemeral: true
                    });
                }
            }
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