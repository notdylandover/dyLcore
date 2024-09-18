const { CommandError } = require('../../utils/logging');
const { ErrorEmbed } = require('../../utils/embeds');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'birthday',
    async execute(message) {
        const args = message.content.split(' ').slice(1);
        if (args.length < 1 || args.length > 2) {
            return await message.react('❌');
        }

        const userId = args[0];
        const date = args[1];

        const serverId = message.guild.id;
        const dataPath = path.join(__dirname, '../../data');
        const birthdaysFilePath = path.join(dataPath, 'birthdays.json');
        const settingsFilePath = path.join(dataPath, `${serverId}/settings.json`);

        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }

        let birthdays = {};
        let settings = {};

        if (fs.existsSync(birthdaysFilePath)) {
            const rawData = fs.readFileSync(birthdaysFilePath);
            birthdays = JSON.parse(rawData);
        }

        if (!fs.existsSync(path.join(dataPath, serverId))) {
            fs.mkdirSync(path.join(dataPath, serverId), { recursive: true });
        }

        if (fs.existsSync(settingsFilePath)) {
            const rawData = fs.readFileSync(settingsFilePath);
            settings = JSON.parse(rawData);
        }

        try {
            if (userId === 'role') {
                const roleId = date;
                const role = message.guild.roles.cache.get(roleId);

                if (!role) {
                    return await message.reply({ content: "Invalid role ID." });
                }

                settings.birthdayRole = roleId;
                fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));

                return await message.react('✅');
            } else {
                const user = await message.client.users.fetch(userId);

                if (!user) {
                    return await message.reply({ content: "Invalid user ID." });
                }

                const formatDate = (date) => {
                    const [month, day] = date.split('-');
                    const months = [
                        "January", "February", "March", "April", "May", "June", "July", "August",
                        "September", "October", "November", "December"
                    ];
                    return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
                };

                if (!date) {
                    if (birthdays[userId]) {
                        const formattedDate = formatDate(birthdays[userId].birthday);
                        return await message.reply({ content: `${user.tag}'s birthday is on ${formattedDate}.` });
                    } else {
                        return await message.reply({ content: "No birthdate set." });
                    }
                }

                const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
                if (!dateRegex.test(date)) {
                    return await message.reply({ content: "Invalid date format. Please use MM-DD-YYYY." });
                }

                birthdays[userId] = {
                    username: user.username,
                    birthday: date
                };

                fs.writeFileSync(birthdaysFilePath, JSON.stringify(birthdays, null, 2));

                return await message.react('✅');
            }
        } catch (error) {
            CommandError("birthday", error.stack);

            const errorEmbed = ErrorEmbed(error.message);
            return await message.reply({ embeds: [errorEmbed] });
        }
    }
};