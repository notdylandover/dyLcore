const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { ready, Error, Valid } = require("../../utils/logging");

const setPresence = require("../../utils/setPresence");
const fs = require("fs");
const path = require("path");
const startServer = require("../../utils/server");

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
        }
    }

    return commands;
}

module.exports = {
    name: "ready",
    async execute(client) {
        try {
            const commands = updateCommands();
            const rest = new REST({ version: "10" }).setToken(client.token);

            try {
                await rest.put(Routes.applicationCommands(client.user.id), {
                    body: commands,
                });
            } catch (error) {
                Error(`Failed to update commands: ${error.message}`);
            }

            setPresence(client);
            startServer(client);

        } catch (error) {
            Error(`Error executing ${module.exports.name}: ${error.message}`);
        }
    }
};
