const { EMOJIS } = require('./constants');
const axios = require('axios');
const { Debug } = require('./logging');

require('dotenv').config();

const OpenWeatherMapKey = process.env.OPENWEATHERMAP_API_KEY;

async function getForecastIcon(forecast) {
    return forecast.length > 0 ? forecast[0].icon : null;
}

async function getCoordinates(zip) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${process.env.GOOGLE_GEOLOCATION}`;

    try {
        const response = await axios.get(url);
        const location = response.data.results[0].geometry.location;

        return { lat: location.lat, lon: location.lng };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getCurrentWeather(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${OpenWeatherMapKey}`;
        const response = await axios.get(url);
        const data = response.data;

        const temperature = data.main.temp.toFixed(0);
        const feelsLike = data.main.feels_like.toFixed(0);
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed.toFixed(0);
        const windDeg = data.wind.deg;
        const windDirection = degreesToDirection(windDeg);

        return { temperature, feelsLike, humidity, windSpeed, windDirection };
    } catch (error) {
        throw new Error(`Error fetching current weather data: ${error.message}`);
    }
}

function degreesToDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
    const index = Math.round(degrees / 22.5);
    return directions[index];
}

function getAQIDescription(aqi) {
    const descriptions = {
        1: 'Good',
        2: 'Fair',
        3: 'Moderate',
        4: 'Poor',
        5: 'Very Poor',
    };
    return descriptions[aqi] || 'Unknown';
}

async function getAirQualityIndex(lat, lon) {
    try {
        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OpenWeatherMapKey}`;
        const response = await axios.get(url);

        const aqi = response.data.list[0].main.aqi;
        return aqi;
    } catch (error) {
        throw new Error(`Error fetching air quality index: ${error.message}`);
    }
}

async function getNearestForecastOffice(lat, lon) {
    const url = `https://api.weather.gov/points/${lat},${lon}`;

    try {
        const response = await axios.get(url);

        const city = response.data.properties.relativeLocation.properties.city;
        const state = response.data.properties.relativeLocation.properties.state;

        return {
            forecast: response.data.properties.forecast,
            forecastHourly: response.data.properties.forecastHourly,
            radarStation: response.data.properties.radarStation,
            city,
            state,
            lat,
            lon
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getForecastZone(lat, lon) {
    const url = `https://api.weather.gov/points/${lat},${lon}`;

    try {
        const response = await axios.get(url);
        const forecastZone = response.data.properties.forecastZone;

        return forecastZone;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getZoneData(lat, lon) {
    const url = `https://api.weather.gov/points/${lat},${lon}`;

    try {
        const response = await axios.get(url);
        const forecastZoneUrl = response.data.properties.forecastZone;
        const countyUrl = response.data.properties.county;
        const fireWeatherZoneUrl = response.data.properties.fireWeatherZone;

        const forecastZone = forecastZoneUrl.split('/').pop();
        const county = countyUrl.split('/').pop();
        const fireWeatherZone = fireWeatherZoneUrl.split('/').pop();

        return { forecastZone, county, fireWeatherZone, lat, lon };
    } catch (error) {
        throw new Error(`Failed to fetch zone data: ${error.message}`);
    }
}

async function getTimeZone(lat, lon) {
    const url = `https://api.weather.gov/points/${lat},${lon}`;

    try {
        const response = await axios.get(url);
        return response.data.properties.timeZone;
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

function generateAlertURL(warnzone, warncounty, lat, lon, place) {
    return `https://forecast.weather.gov/showsigwx.php?warnzone=${warnzone}&warncounty=${warncounty}&firewxzone=${warnzone}&local_place1=${encodeURIComponent(place)}&lat=${lat}&lon=${lon}`;
}

function cleanCondition(condition) {
    return condition
        .replace(/\b(slight|chance|possible|scattered|conditions|likely|isolated|expected with|areas of)\b/gi, '')
        .replace(/chance of \w+/i, '')
        .replace(/then.*/i, '') 
        .trim();
}

async function getWeeklyForecast(forecastUrl) {
    try {
        const response = await axios.get(forecastUrl);
        const periods = response.data.properties.periods;

        return periods.map(period => {
            let cleanedCondition = cleanCondition(period.shortForecast);

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

        return hourlyPeriods.map(period => {
            let cleanedCondition = cleanCondition(period.shortForecast);

            const rainPercentage = period.probabilityOfPrecipitation?.value || 0;

            return {
                start: period.startTime,
                temperature: period.temperature,
                condition: cleanedCondition,
                rainPercentage
            };
        });
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
        'Fog': `${EMOJIS.weather_fog}`,
        'Patchy Fog': `${EMOJIS.weather_fog}`,
        'Cloudy': `${EMOJIS.weather_cloud}`,
        'Mostly Cloudy': `${EMOJIS.weather_cloud}`,
        'Partly Cloudy': `${EMOJIS.weather_partsun}`,
        'Clear': `${EMOJIS.weather_sun}`,
        'Mostly Clear': `${EMOJIS.weather_sun}`,
        'Sunny': `${EMOJIS.weather_sun}`,
        'Mostly Sunny': `${EMOJIS.weather_sun}`,
        'Partly Sunny': `${EMOJIS.weather_partsun}`,
        'Light Rain': `${EMOJIS.weather_rain}`,
        'Rain': `${EMOJIS.weather_rain}`,
        'Rain Showers': `${EMOJIS.weather_rain}`,
        'Chance Rain Showers': `${EMOJIS.weather_rain}`,
        'Slight Chance Rain Showers': `${EMOJIS.weather_rain}`,
        'Showers And Thunderstorms': `${EMOJIS.weather_storm}`,
        'Showers And Thunderstorms Likely': `${EMOJIS.weather_storm}`,
        'Tropical Storm': `${EMOJIS.weather_tropicalstorm}`,
        'Tropical Storm Hurricane': `${EMOJIS.weather_hurricane}`,
        'Hurricane': `${EMOJIS.weather_hurricane}`,
        'Frost': `${EMOJIS.weather_frost}`,
    };

    return weatherEmojis[condition] || '❔';
}

module.exports = {
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
};