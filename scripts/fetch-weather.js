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

async function fetchWeatherData() {
  // Keep the free API load minimal: one request per day covers all locations.
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: SWISS_LOCATIONS.map((location) => location.lat).join(','),
    longitude: SWISS_LOCATIONS.map((location) => location.lon).join(','),
    hourly: 'temperature_2m,weather_code,wind_speed_10m',
    forecast_days: '1',
    timezone: 'Europe/Zurich',
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: HTTP ${response.status}`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length !== SWISS_LOCATIONS.length) {
    throw new Error(`Open-Meteo returned ${Array.isArray(results) ? results.length : 'no'} results for ${SWISS_LOCATIONS.length} locations`);
  }

  const forecast = {};
  // Open-Meteo returns one result per coordinate pair, in request order.
  for (const [index, location] of SWISS_LOCATIONS.entries()) {
    const { hourly } = results[index];
    if (!hourly?.time || !hourly.temperature_2m || !hourly.weather_code || !hourly.wind_speed_10m) {
      throw new Error(`Open-Meteo returned incomplete hourly data for ${location.name}`);
    }

    forecast[location.name] = {
      hourly: hourly.time.map((time, indexInDay) => ({
        hour: Number(time.slice(11, 13)),
        temperature: hourly.temperature_2m[indexInDay],
        weatherCode: hourly.weather_code[indexInDay],
        windSpeed: hourly.wind_speed_10m[indexInDay],
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
