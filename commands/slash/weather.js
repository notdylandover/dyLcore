const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { ErrorEmbed, WeatherEmbed } = require('../../utils/embeds');
const { CommandError, Debug } = require("../../utils/logging");
const { EMOJIS } = require('../../utils/constants');
const { getForecastIcon, getNearestForecastOffice, getForecastZone, getZoneData, getTimeZone, getWeatherAlerts, generateAlertURL, getWeeklyForecast, getHourlyForecast, getRadarImage, getWeatherEmoji } = require('../../utils/weather');

module.exports = {
    premium: false,
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get the weather for a specific location by ZIP code')
        .addStringOption(option => option
            .setName('zip')
            .setDescription('Enter the ZIP code for the location')
            .setRequired(true)
        )
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const zip = interaction.options.getString('zip');
            const forecastProperties = await getNearestForecastOffice(zip);
            const weeklyForecast = await getWeeklyForecast(forecastProperties.forecast);

            const currentWeatherPeriod = weeklyForecast[0];
            const currentCondition = weeklyForecast[0]?.condition;
            const currentTemperature = currentWeatherPeriod?.temperature;
            const currentWeatherEmoji = getWeatherEmoji(currentCondition);
            const emojiIdMatch = currentWeatherEmoji.match(/:(\d+)>/);
            const emojiId = emojiIdMatch ? emojiIdMatch[1] : null;
            const currentConditionEmoji = emojiId ? `https://cdn.discordapp.com/emojis/${emojiId}.png` : null;
            const zoneData = await getZoneData(zip);

            const icon = await getForecastIcon(weeklyForecast);
            const forecastZone = await getForecastZone(zip);
            const radar = await getRadarImage(forecastProperties.radarStation);
            const timeZone = await getTimeZone(zip);

            const city = forecastProperties.city;
            const state = forecastProperties.state;

            const alerts = await getWeatherAlerts(state, forecastZone);

            const dailyData = {};
            const now = new Date();
            const currentDateTime = new Date(now.toLocaleString("en-US", { timeZone }));

            const location = `${city}, ${state}`;

            weeklyForecast.forEach(period => {
                const forecastDateTime = new Date(period.start);

                if (forecastDateTime > currentDateTime) {
                    const dateKey = forecastDateTime.toLocaleDateString('en-US', { weekday: 'short' });

                    if (!dailyData[dateKey]) {
                        dailyData[dateKey] = { high: null, low: null, condition: period.condition };
                    }

                    if (period.name.includes("Night") || period.name === "Tonight") {
                        dailyData[dateKey].low = period.temperature;
                    } else {
                        dailyData[dateKey].high = period.temperature;
                    }
                }
            });

            const upcomingDays = Object.keys(dailyData).slice(0, 6);
            let description = '';

            upcomingDays.forEach(date => {
                const { high, low, condition } = dailyData[date];

                Debug(condition);

                const highDisplay = high !== null ? `${high}°F` : '    ';
                const lowDisplay = low !== null ? `${low}°F` : '    ';

                const emoji = getWeatherEmoji(condition);
                description += `**\` ${date} \`** ${emoji} \` ${highDisplay} / ${lowDisplay} \`\n`;
            });

            if (alerts.length > 0) {
                description += '## Alerts\n';
                
                const today = new Date().toLocaleDateString('en-US', { timeZone });

                alerts.forEach(alert => {
                    const expires = new Date(alert.expires);
                    const isToday = expires.toLocaleDateString('en-US', { timeZone }) === today;

                    const expiresDate = expires.toLocaleString('en-US', {
                        timeZone,
                        hour: 'numeric', 
                        minute: 'numeric',
                        ...(isToday ? {} : { weekday: 'short' })
                    });

                    const learnMoreUrl = generateAlertURL(zoneData.forecastZone, zoneData.county, zoneData.lat, zoneData.lon, `${city}, ${state}`);
                    
                    description += `**${EMOJIS.weather_alert} ${alert.event}**\n-# Until ${expiresDate} - [Learn More](${learnMoreUrl})\n\n`;
                });
            } else {
                description += '';
            }
    
            const embed = WeatherEmbed(currentCondition, currentConditionEmoji, location, currentTemperature, icon, description, radar);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(
                error.response && error.response.status === 500 
                ? "Location not found." 
                : error.message
            );

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};