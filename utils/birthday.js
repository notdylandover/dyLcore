const fs = require('fs');
const path = require('path');
const { Done, Error } = require('./logging');

const formatDate = (date) => {
    const [month, day] = date.split('/');
    return `${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const applyBirthdayRoles = async (client) => {
    const dataPath = path.join(__dirname, '../data');

    const serverDirs = fs.readdirSync(dataPath).filter(file => fs.statSync(path.join(dataPath, file)).isDirectory());

    for (const serverId of serverDirs) {
        const settingsFilePath = path.join(dataPath, serverId, 'settings.json');
        const birthdaysFilePath = path.join(dataPath, 'birthdays.json');

        if (!fs.existsSync(settingsFilePath) || !fs.existsSync(birthdaysFilePath)) {
            continue;
        }

        const settings = JSON.parse(fs.readFileSync(settingsFilePath));
        const birthdays = JSON.parse(fs.readFileSync(birthdaysFilePath));

        if (!settings.birthdayRole) {
            continue;
        }

        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            continue;
        }

        const role = guild.roles.cache.get(settings.birthdayRole);
        if (!role) {
            Error(`Role with ID ${settings.birthdayRole} not found in server ${serverId}.`);
            continue;
        }

        const today = formatDate(new Date().toLocaleDateString('en-US'));

        guild.members.fetch().then(members => {
            members.forEach(member => {
                if (birthdays[member.id] && formatDate(new Date(birthdays[member.id].birthday).toLocaleDateString('en-US')) === today) {
                    if (!member.roles.cache.has(role.id)) {
                        member.roles.add(role.id)
                            .then(() => Done(`Added birthday role to ${member.user.tag} in server ${serverId}.`))
                            .catch(err => Error(`Failed to add birthday role to ${member.user.tag} in server ${serverId}:`, err));
                    }
                }
            });
        }).catch(err => Error(`Failed to fetch members for server ${serverId}:`, err));
    }
};

module.exports = { applyBirthdayRoles };