import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SWISS_LOCATIONS = [
  { name: 'Zurich', lat: 47.3769, lon: 8.5417 },
  { name: 'Geneva', lat: 46.2044, lon: 6.1432 },
  { name: 'Bern', lat: 46.9480, lon: 7.4474 },
  { name: 'Zermatt', lat: 46.0207, lon: 7.7491 },
  { name: 'St. Moritz', lat: 46.4908, lon: 9.8355 },
  { name: 'Lugano', lat: 46.0037, lon: 8.9511 },
];

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWeatherData() {
  const forecast = {};

  // Keep the free API load modest: make just one sequential request per location per day.
  for (const [index, location] of SWISS_LOCATIONS.entries()) {
    if (index > 0) await pause(1000);

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: location.lat,
      longitude: location.lon,
      hourly: 'temperature_2m,weather_code,wind_speed_10m',
      forecast_days: '1',
      timezone: 'Europe/Zurich',
    }).toString();

    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      throw new Error(`Open-Meteo request for ${location.name} failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.hourly?.time || !data.hourly.temperature_2m || !data.hourly.weather_code || !data.hourly.wind_speed_10m) {
      throw new Error(`Open-Meteo returned incomplete hourly data for ${location.name}`);
    }

    forecast[location.name] = {
      hourly: data.hourly.time.map((time, indexInDay) => ({
        hour: Number(time.slice(11, 13)),
        temperature: data.hourly.temperature_2m[indexInDay],
        weatherCode: data.hourly.weather_code[indexInDay],
        windSpeed: data.hourly.wind_speed_10m[indexInDay],
      })),
    };
    console.log(`Fetched data for ${location.name}`);
  }

  const outputPath = path.join(__dirname, '../public/forecast.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(forecast, null, 2)}\n`);
  console.log('Successfully written to public/forecast.json');
}

fetchWeatherData().catch((error) => {
  console.error('Weather update failed; keeping the existing forecast file:', error);
  process.exitCode = 1;
});
