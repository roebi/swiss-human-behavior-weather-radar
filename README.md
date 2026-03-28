# swiss-human-behavior-weather-radar

> 🇨🇭 Swiss Persona Radar

## project structure

```tree
swiss-persona-radar/

├── .devcontainer
│   └── maintainer
│       └── devcontainer.json
├── .git
├── .github/
│   └── workflows/
│       └── update-weather.yml
├── LICENSE
├── public/
│   └── forecast.json         (Generated automatically, needs empty placeholder)
├── README.md
├── scripts/
│   └── fetch-weather.js      (The Node.js script to run every morning)
├── src/
│   ├── App.jsx               (Entry point)
│   ├── data.js               (Locations)
│   ├── regelwerk.js          (Rulebook)
│   └── WeatherRadar.jsx      (Main Component)
└── package.json
```

## automation & data fetching

```bash
.github/workflows/update-weather.yml
```

This GitHub Action runs every day at 04:00 AM CET (03:00 UTC).

It fetches the weather data

generates the JSON

and commits it back to your repository.

## the weather fetch script

```bash
scripts/fetch-weather.js
```

This script loops through your locations

hits the free Open-Meteo API

formats the next 24 hours of data

and writes it to public/forecast.json.

## frontend App React

```bash
src/App.jsx
```

The entry point that fetches the static JSON file

and passes it to the radar component.

## swiss locations

```bash
src/data.js
```

list of the swiss locations

## rules from weather data to symbol - core

```bash
src/regelwerk.js
```

logic engine - the core idea behind

## frontend React Leaflet Component (Radar & Time Slider)

```bash
src/WeatherRadar.jsx
```

uses react-leaflet to plot the precalculatedData on the map

This component assumes you are passing the pre-calculated 24-hour array to it.

The Ruler defaults to the current hour if no ruler value is manually set.

Use / depends on react-leaflet and leaflet for the map rendering.

## dependencies

```bash
package.json
```

Snippet of required dependencies.

need to ensure that these are installed in the React environment

(via Vite, Create React App, or Next.js)

```bash
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  }
}
```

## license

MIT
