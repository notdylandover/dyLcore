const { SlashCommandBuilder } = require('discord.js');
const { Reminder } = require('../../utils/embeds');

const fs = require('fs');
const path = require('path');

// Path to the JSON file where reminders will be stored
const remindersFilePath = path.resolve(__dirname, '../../data/reminders.json');

const command = new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Manage reminders')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a new reminder')
            .addIntegerOption(option =>
                option.setName('time')
                    .setDescription('Time after which to remind')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('unit')
                    .setDescription('Time unit (min, hour, day)')
                    .setRequired(true)
                    .addChoices(
                        { name: 'min', value: 'min' },
                        { name: 'hour', value: 'hour' },
                        { name: 'day', value: 'day' }
                    ))
            .addStringOption(option =>
                option.setName('description')
                    .setDescription('Description of the reminder')
                    .setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Remove an existing reminder')
            .addIntegerOption(option =>
                option.setName('id')
                    .setDescription('The ID of the reminder to remove')
                    .setRequired(true))
    );

module.exports = {
    data: command,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const time = interaction.options.getInteger('time');
            const unit = interaction.options.getString('unit');
            const description = interaction.options.getString('description');
            const reminderTime = calculateReminderTime(time, unit);

            const newReminder = {
                id: Date.now(),
                userId: interaction.user.id,
                reminderTime,
                description
            };

            let reminders = [];

            if (fs.existsSync(remindersFilePath)) {
                const rawData = fs.readFileSync(remindersFilePath);
                reminders = JSON.parse(rawData);
            }

            reminders.push(newReminder);

            fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2));

            const embedDescription = `Got it!\n\n I will remind you in \` ${time} ${unit}(s) \` with:\n\n \`\`\` ${description} \`\`\``

            const remindEmbed = Reminder(embedDescription)

            await interaction.reply({ embeds: [remindEmbed], ephemeral: true });

        } else if (subcommand === 'remove') {
            const id = interaction.options.getInteger('id');

            if (fs.existsSync(remindersFilePath)) {
                let reminders = JSON.parse(fs.readFileSync(remindersFilePath));
                const initialLength = reminders.length;
                reminders = reminders.filter(reminder => reminder.id !== id);

                if (reminders.length === initialLength) {
                    await interaction.reply(`No reminder found with ID: ${id}`);
                } else {
                    fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2));
                    await interaction.reply(`Reminder with ID: ${id} removed successfully!`);
                }
            } else {
                await interaction.reply('No reminders found.');
            }
        }
    }
};

// Helper function to calculate the exact reminder time
function calculateReminderTime(time, unit) {
    const now = new Date();
    if (unit === 'min') {
        now.setMinutes(now.getMinutes() + time);
    } else if (unit === 'hour') {
        now.setHours(now.getHours() + time);
    } else if (unit === 'day') {
        now.setDate(now.getDate() + time);
    }
    return now;
}