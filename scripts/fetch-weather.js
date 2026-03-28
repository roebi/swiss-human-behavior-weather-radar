import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// In ES Modules, we have to "create" __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SWISS_LOCATIONS = [
  { name: 'Zurich', lat: 47.3769, lon: 8.5417 },
  { name: 'Geneva', lat: 46.2044, lon: 6.1432 },
  { name: 'Bern', lat: 46.9480, lon: 7.4474 },
  { name: 'Zermatt', lat: 46.0207, lon: 7.7491 },
  { name: 'St. Moritz', lat: 46.4908, lon: 9.8355 },
  { name: 'Lugano', lat: 46.0037, lon: 8.9511 }
];

async function fetchWeatherData() {
  const forecast = {};

  for (const loc of SWISS_LOCATIONS) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&hourly=temperature_2m,weather_code,wind_speed_10m&forecast_days=1&timezone=Europe%2FBerlin`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const hourlyData = [];
      for (let i = 0; i < 24; i++) {
        hourlyData.push({
          hour: i,
          temperature: data.hourly.temperature_2m[i],
          weatherCode: data.hourly.weather_code[i],
          windSpeed: data.hourly.wind_speed_10m[i]
        });
      }
      
      forecast[loc.name] = { hourly: hourlyData };
      console.log(`Fetched data for ${loc.name}`);
    } catch (error) {
      console.error(`Failed to fetch data for ${loc.name}:`, error);
    }
  }

  const outputPath = path.join(__dirname, '../public/forecast.json');
  fs.writeFileSync(outputPath, JSON.stringify(forecast, null, 2));
  console.log('Successfully written to public/forecast.json');
}

fetchWeatherData();
