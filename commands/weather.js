const { SlashCommandBuilder, PermissionFlagsBits, InteractionResponse } = require("discord.js");
const { ErrorEmbed, InfoEmbed } = require("../utils/embeds");
const { Debug, Error, Info } = require("../utils/logging");
const { METADATA } = require('../utils/metadata');

const axios = require('axios');

const METEOMATICS_USERNAME = process.env.OPENCAGE_USERNAME;
const METEOMATICS_PASSWORD = process.env.OPENCAGE_PASSWORD;
const OPENCAGE_API_KEY = process.env.OPENCAGE_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("weather")
        .setDescription(METADATA.weather.description)
        .addStringOption(option => option
            .setName('location')
            .setDescription('The city or place')
            .setRequired(true)
        )
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const location = interaction.options.getString('location');

        try {
            const geocodeResponse = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${OPENCAGE_API_KEY}`);
            
            if (geocodeResponse.data.results.length === 0) {
                throw new Error(`Unable to find coordinates for location: ${location}`);
            }

            const { lat, lng } = geocodeResponse.data.results[0].geometry;

            const now = new Date().toISOString();
            const weatherResponse = await axios.get(`https://api.meteomatics.com/${now}/t_2m:F/${lat},${lng}/json`, {
                auth: {
                    username: METEOMATICS_USERNAME,
                    password: METEOMATICS_PASSWORD
                }
            });

            const weatherData = weatherResponse.data;

            Debug(JSON.stringify(weatherData, null, 2));

            const temperature = weatherData.data[0].coordinates[0].dates[0].value;

            const infoEmbed = InfoEmbed(`The current temperature at ${location} is ${temperature}°F.`);

            await interaction.editReply({ embeds: [infoEmbed], ephemeral: true });
        } catch (error) {
            const errorEmbed = ErrorEmbed(`Error executing ${interaction.commandName}`, error.message);
            Error(`Error executing ${interaction.commandName}: ${error.message}`);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
