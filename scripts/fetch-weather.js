import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swiss towns with at least 500 inhabitants, from GeoNames (CC BY 4.0, https://www.geonames.org/).
const SWISS_TOWNS = JSON.parse(fs.readFileSync(path.join(__dirname, 'swiss-towns.json'), 'utf8'));

const PLACE_COUNT = 12;
// Minimum distance between picked towns, so they spread over the whole country.
const MIN_DISTANCE_KM = 35;

const distanceKm = (a, b) => {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function pickSpreadTowns(towns, count, minDistanceKm) {
  // Greedy pick from a random order; relax the distance if the country is too small for it.
  for (let minDistance = minDistanceKm; minDistance >= 0; minDistance -= 5) {
    const picked = [];
    for (const town of shuffle(towns)) {
      if (picked.every((other) => distanceKm(town, other) >= minDistance)) picked.push(town);
      if (picked.length === count) return picked;
    }
  }
  throw new Error(`Not enough towns to pick ${count} places`);
}

async function fetchWeatherData() {
  const places = pickSpreadTowns(SWISS_TOWNS, PLACE_COUNT, MIN_DISTANCE_KM);

  // Keep the free API load minimal: one request per day covers all places.
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: places.map((place) => place.lat).join(','),
    longitude: places.map((place) => place.lon).join(','),
    hourly: 'temperature_2m,weather_code,wind_speed_10m',
    forecast_days: '1',
    timezone: 'Europe/Zurich',
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: HTTP ${response.status}`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length !== places.length) {
    throw new Error(`Open-Meteo returned ${Array.isArray(results) ? results.length : 'no'} results for ${places.length} places`);
  }

  // Open-Meteo returns one result per coordinate pair, in request order.
  const locations = places.map((place, index) => {
    const { hourly, elevation } = results[index];
    if (!hourly?.time || !hourly.temperature_2m || !hourly.weather_code || !hourly.wind_speed_10m) {
      throw new Error(`Open-Meteo returned incomplete hourly data for ${place.name}`);
    }
    console.log(`Fetched data for ${place.name}`);
    return {
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      alt: Math.round(elevation),
      hourly: hourly.time.map((time, indexInDay) => ({
        hour: Number(time.slice(11, 13)),
        temperature: hourly.temperature_2m[indexInDay],
        weatherCode: hourly.weather_code[indexInDay],
        windSpeed: hourly.wind_speed_10m[indexInDay],
      })),
    };
  });

  const outputPath = path.join(__dirname, '../public/forecast.json');
  fs.writeFileSync(outputPath, `${JSON.stringify({ locations }, null, 2)}\n`);
  console.log('Successfully written to public/forecast.json');
}

fetchWeatherData().catch((error) => {
  console.error('Weather update failed; keeping the existing forecast file:', error);
  process.exitCode = 1;
});
