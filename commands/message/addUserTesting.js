const fs = require('fs');
const path = require('path');
const { CommandError, Error } = require('../../utils/logging');
const { ErrorEmbed, WarnEmbed, SuccessEmbed } = require('../../utils/embeds');

const testingFilePath = path.join(__dirname, '..', '..', 'data', 'testing.json');

module.exports = {
    name: 'addusertesting',
    async execute(message) {
        try {
            const usernameToAdd = message.content.split(' ')[1];

            if (!usernameToAdd) {
                return message.reply('Please provide a username to add.');
            }

            let usersData = { users: [] };
            if (fs.existsSync(testingFilePath)) {
                const fileContent = fs.readFileSync(testingFilePath, 'utf-8');
                try {
                    usersData = JSON.parse(fileContent);
                    if (!Array.isArray(usersData.users)) {
                        throw new Error('Parsed data is not an array');
                    }
                } catch (error) {
                    Error(`Error parsing JSON:\n${error.stack}`);

                    const errorEmbed = ErrorEmbed(error.message);
                    return message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
                }
            }

            if (!usersData.users.includes(usernameToAdd)) {
                usersData.users.push(usernameToAdd);
                fs.writeFileSync(testingFilePath, JSON.stringify(usersData, null, 2), 'utf-8');

                const successEmbed = SuccessEmbed(`${usernameToAdd} has been added to the list.`);
                return message.reply({ embeds: [successEmbed], allowedMentions: { repliedUser: false } });
            } else {
                const warnEmbed = WarnEmbed(`${usernameToAdd} is already in the list.`);
                return message.reply({ embeds: [warnEmbed], allowedMentions: { repliedUser: false }});
            }
        } catch (error) {
            CommandError('adduser', error.stack);
            return await message.react('❌');
        }
    }
};