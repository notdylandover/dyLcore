const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Error, Warn, Info, Done } = require('./logging');

const fs = require('fs');
const path = require('path');

const fetchCommandCount = async (client) => {
    try {
        const rest = new REST({ version: '10' }).setToken(client.token);
        const registeredCommands = await rest.get(Routes.applicationCommands(client.user.id));
        return registeredCommands.length;
    } catch (error) {
        Error('Failed to fetch commands:', error);
        return 0;
    }
};

const updateCommands = () => {
    const commands = [];
    const invalidCommands = [];

    const commandFolders = ['slash', 'context'];
    commandFolders.forEach(folder => {
        const commandFolderPath = path.join(__dirname, '..', 'commands', folder);
        const commandFiles = fs
            .readdirSync(commandFolderPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandPath = path.join(commandFolderPath, file);
            try {
                const command = require(commandPath);

                if (
                    command.data &&
                    typeof command.execute === 'function' &&
                    command.enabled !== false
                ) {
                    commands.push(command.data.toJSON());
                }
            } catch (error) {
                invalidCommands.push(file);
                Error(`Error loading command ${file}:\n${error.stack}`);
            }
        }
    });

    if (invalidCommands.length > 0) {
        Warn(`Invalid command files:\n${invalidCommands.join('\n')}`);
    }

    return commands;
};

const registerCommands = async (client) => {
    const commands = updateCommands();
    const rest = new REST({ version: '10' }).setToken(client.token);

    try {
        Info(`Registering ${commands.length} commands...`);

        const registeredCommands = await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
        });

        const commandsWithIds = {};
        registeredCommands.forEach((cmd) => {
            commandsWithIds[cmd.name] = {
                id: cmd.id,
                ...cmd,
            };
        });

        const commandsFilePath = path.join(__dirname, '..', 'data', 'bot', 'commands.json');
        fs.mkdirSync(path.dirname(commandsFilePath), { recursive: true });
        fs.writeFileSync(commandsFilePath, JSON.stringify(commandsWithIds, null, 2));

        Done(`Registered ${registeredCommands.length} commands`);
    } catch (error) {
        Error('Failed to register commands:', error);
    }
};

module.exports = { fetchCommandCount, registerCommands };