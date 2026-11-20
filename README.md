# 🇨🇭 Swiss Human Behavior Weather Radar

A small static React map that turns the hourly weather forecast for six Swiss locations into playful weather personas.

## Run locally

```bash
npm install
npm run dev
```

## Weather data and API usage

The app does not call the weather API from visitors' browsers. A scheduled GitHub Actions job fetches a 24-hour forecast once daily and publishes it as a static JSON file. The updater makes a single Open-Meteo request per day that covers all six locations. No API key is needed for Open-Meteo's free forecast endpoint. If an update fails, the workflow exits with an error and does not replace the last known-good forecast.

GitHub Pages is static hosting, so there is no app server that needs to be kept running, shut down, or restarted. It serves the page when requested; map tiles are loaded only while a visitor has the map open. The map background uses swisstopo's free national map tiles, which need no API key.

## Deployment

The GitHub Actions workflow builds the app and deploys it to GitHub Pages. The frontend resolves its forecast URL from Vite's configured base path so the published subdirectory works correctly.
