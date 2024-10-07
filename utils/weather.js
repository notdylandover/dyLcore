const { EMOJIS } = require('./constants');

const axios = require('axios');

require('dotenv').config();

async function getForecastIcon(forecast) {
    return forecast.length > 0 ? forecast[0].icon : null;
}

async function getCoordinates(zip) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${process.env.GOOGLE_GEOLOCATION}`;

    try {
        const response = await axios.get(url);
        const location = response.data.results[0].geometry.location;

        return { latitude: location.lat, longitude: location.lng };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getNearestForecastOffice(zip) {
    const coordinates = await getCoordinates(zip);
    const url = `https://api.weather.gov/points/${coordinates.latitude},${coordinates.longitude}`;

    try {
        const response = await axios.get(url);

        const city = response.data.properties.relativeLocation.properties.city;
        const state = response.data.properties.relativeLocation.properties.state;

        return {
            forecast: response.data.properties.forecast,
            forecastHourly: response.data.properties.forecastHourly,
            radarStation: response.data.properties.radarStation,
            city,
            state
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getForecastZone(zip) {
    const coordinates = await getCoordinates(zip);
    const url = `https://api.weather.gov/points/${coordinates.latitude},${coordinates.longitude}`;

    try {
        const response = await axios.get(url);
        const forecastZone = response.data.properties.forecastZone;

        return forecastZone;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getTimeZone(zip) {
    const coordinates = await getCoordinates(zip); // Assuming this function retrieves coordinates based on ZIP
    const url = `https://api.weather.gov/points/${coordinates.latitude},${coordinates.longitude}`;

    try {
        const response = await axios.get(url);
        return response.data.properties.timeZone; // Extract the time zone
    } catch (error) {
        throw new Error('Failed to retrieve time zone: ' + error.message);
    }
}


async function getWeatherAlerts(state, forecastZone) {
    const url = `https://api.weather.gov/alerts/active?area=${state}`;

    try {
        const response = await axios.get(url);
        const alerts = response.data.features;

        const filteredAlerts = alerts.filter(alert => {
            const zoneMatch = alert.properties.affectedZones.includes(forecastZone);
            return zoneMatch;
        }).map(alert => ({
            event: alert.properties.event,
            source: alert.properties.source,
            affectedZones: alert.properties.affectedZones,
            expires: alert.properties.expires
        }));

        return filteredAlerts;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getWeeklyForecast(forecastUrl) {
    try {
        const response = await axios.get(forecastUrl);
        const periods = response.data.properties.periods;

        return periods.map(period => {
            let cleanedCondition = period.shortForecast
                .replace(/\b(chance|possible|scattered|conditions|slight|likely)\b/gi, '')
                .replace(/chance of \w+/i, '')
                .replace(/then.*/i, '') 
                .trim();

            return {
                name: period.name,
                icon: period.icon,
                temperature: period.temperature,
                condition: cleanedCondition,
                start: period.startTime,
                end: period.endTime,
            };
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getHourlyForecast(hourlyForecastUrl) {
    try {
        const response = await axios.get(hourlyForecastUrl);
        const hourlyPeriods = response.data.properties.periods;
        return hourlyPeriods.map(period => ({
            start: period.startTime,
            temperature: period.temperature,
            condition: period.shortForecast,
        }));
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getRadarImage(office) {
    const timestamp = new Date().getTime();
    const url = `https://radar.weather.gov/ridge/standard/${office}_loop.gif?${timestamp}`;

    return url;
}

function getWeatherEmoji(condition) {
    const weatherEmojis = {
        'Mostly Clear': `${EMOJIS.weather_sun}`,
        'Sunny': `${EMOJIS.weather_sun}`,
        'Mostly Sunny': `${EMOJIS.weather_sun}`,
        'Rain Showers': `${EMOJIS.weather_rain}`,
        'Showers And Thunderstorms': `${EMOJIS.weather_thunderstorm}`,
        'Tropical Storm': `${EMOJIS.weather_tropicalstorm}`,
        'Hurricane': `${EMOJIS.weather_hurricane}`,
    };

    return weatherEmojis[condition] || '🌈';
}

module.exports = { getForecastIcon, getNearestForecastOffice, getForecastZone, getTimeZone, getWeatherAlerts, getWeeklyForecast, getHourlyForecast, getRadarImage, getWeatherEmoji };