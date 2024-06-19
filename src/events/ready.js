const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { Debug, Done, ready, Error } = require("../../utils/logging");

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const setPresence = require("../../utils/setPresence");

function updatePresence(client) {
    try {
        setPresence(client);
    } catch (e) {
        Error(`Failed to update presence: ${e.message}`);
    }
}

function updateCommands() {
    const commands = [];

    const commandFolder = path.join(__dirname, "..", "..", "commands");
    const commandFiles = fs
        .readdirSync(commandFolder)
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const commandPath = path.join(commandFolder, file);
        const command = require(commandPath);

        if (command.data && command.execute) {
            commands.push(command.data.toJSON());
            Debug(`${command.data.name}`);
        }
    }

    return commands;
}

module.exports = {
    name: "ready",
    async execute(client) {
        try {
            updatePresence(client);

            const commands = updateCommands();
            const rest = new REST({ version: "10" }).setToken(client.token);

            try {
                await rest.put(Routes.applicationCommands(client.user.id), {
                    body: commands,
                });
            } catch (e) {
                Error(`Failed to update commands: ${e.message}`);
            } finally {
                Done(`Updated commands`);
            }
        } catch (e) {
            Error(`Failed to update commands: ${e.message}`);
        } finally {
            ready(`Ready as ${client.user.tag}`);

            cron.schedule("*/15 * * * * *", async () => {
                updatePresence(client);
            });
        }
    },
};
