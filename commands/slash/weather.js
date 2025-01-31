const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require('discord.js');
const { ErrorEmbed, WeatherEmbed } = require('../../utils/embeds');
const { CommandError, Info } = require("../../utils/logging");
const { EMOJIS } = require('../../utils/constants');
const {
    getCurrentWeather,
    getForecastIcon,
    getNearestForecastOffice,
    getForecastZone,
    getZoneData,
    getTimeZone,
    getWeatherAlerts,
    generateAlertURL,
    getWeeklyForecast,
    getHourlyForecast,
    getRadarImage,
    getWeatherEmoji,
    getCoordinates,
    getAirQualityIndex,
    getAQIDescription
} = require('../../utils/weather');

module.exports = {
    premium: false,
    enabled: true,
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
            const { lat, lon } = await getCoordinates(zip);

            const forecastProperties = await getNearestForecastOffice(lat, lon);
            const city = forecastProperties.city;
            const state = forecastProperties.state;

            const weeklyForecast = await getWeeklyForecast(forecastProperties.forecast);
            const currentCondition = weeklyForecast[0]?.condition;

            const hourlyForecast = await getHourlyForecast(forecastProperties.forecastHourly);

            const currentWeather = await getCurrentWeather(lat, lon);
            const { temperature: currentTemperature, feelsLike, humidity, windSpeed, windDirection } = currentWeather;

            const currentWeatherEmoji = getWeatherEmoji(currentCondition);
            const emojiIdMatch = currentWeatherEmoji.match(/:(\d+)>/);
            const emojiId = emojiIdMatch ? emojiIdMatch[1] : null;
            const currentConditionEmoji = emojiId ? `https://cdn.discordapp.com/emojis/${emojiId}.png` : null;

            const zoneData = await getZoneData(lat, lon);
            const icon = await getForecastIcon(weeklyForecast);
            const forecastZone = await getForecastZone(lat, lon);
            const radar = await getRadarImage(forecastProperties.radarStation);
            const timeZone = await getTimeZone(lat, lon);
            const alerts = await getWeatherAlerts(state, forecastZone);

            const aqi = await getAirQualityIndex(lat, lon);
            const aqiDescription = getAQIDescription(aqi);

            const location = `${city}, ${state}`;
            
            const dailyData = {};
            const now = new Date();
            const currentDateTime = new Date(now.toLocaleString("en-US", { timeZone }));

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

            const hourlyData = [];
            for (const period of hourlyForecast) {
                const forecastDateTime = new Date(period.start);
                const forecastHour = forecastDateTime.getHours();

                const currentHour = currentDateTime.getHours();

                if (forecastDateTime > currentDateTime && forecastHour !== currentHour) {
                    const time = forecastDateTime.toLocaleTimeString('en-US', {
                        timeZone,
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });

                    hourlyData.push({
                        time,
                        temperature: period.temperature,
                        condition: period.condition,
                        emoji: getWeatherEmoji(period.condition),
                        rainPercentage: period.rainPercentage,
                    });

                    if (hourlyData.length === 5) break;
                }
            }

            let description =
                `> \` Feels Like  \` \` ${feelsLike}°F \`\n` +
                `> \` Humidity    \` \` ${humidity}% \`\n` +
                `> \` Wind Speed  \` \` ${windSpeed} mph ${windDirection} \`\n` +
                `> \` Air Quality \` \` ${aqi} (${aqiDescription}) \``;

            description += '\n## Next 5 Hours';

            hourlyData.forEach(period => {
                description += `\n> **\` ${period.time} \`** ${period.emoji} \` ${period.temperature}°F \` \` ${period.rainPercentage}% \``;
            });

            const upcomingDays = Object.keys(dailyData).slice(0, 6);

            description += '\n## Daily Forecast';
            upcomingDays.forEach(date => {
                const { high, low, condition } = dailyData[date];

                const highDisplay = high !== null ? `${high}°F` : '    ';
                const lowDisplay = low !== null ? `${low}°F` : '    ';

                const emoji = getWeatherEmoji(condition);
                description += `\n> **\`  ${date}  \`** ${emoji} \` ${highDisplay} / ${lowDisplay} \``;
            });

            if (alerts.length > 0) {
                description += '\n## Alerts';

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

                    const learnMoreUrl = generateAlertURL(zoneData.forecastZone, zoneData.county, zoneData.lat, zoneData.lon, location);

                    description += `\n> **${EMOJIS.weather_alert} ${alert.event}**\n> -# Until ${expiresDate} - [Learn More](${learnMoreUrl})\n\n`;
                });
            }

            const embed = WeatherEmbed(
                currentCondition,
                currentConditionEmoji,
                location,
                currentTemperature,
                icon,
                description,
                radar
            );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            CommandError(interaction.commandName, error.stack);

            const errorEmbed = ErrorEmbed(
                error.response && error.response.status === 500
                    ? "Location not found."
                    : error.message
            );

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};