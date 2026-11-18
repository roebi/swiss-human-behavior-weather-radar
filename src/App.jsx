import React, { useEffect, useState } from 'react';
import WeatherRadar from './WeatherRadar.jsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const forecastUrl = `${import.meta.env.BASE_URL}forecast.json`;

    fetch(forecastUrl, { signal: controller.signal, cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Forecast could not be loaded (HTTP ${response.status}).`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          throw new Error('The forecast file is empty or invalid.');
        }
        setWeatherData(data);
      })
      .catch((loadError) => {
        if (loadError.name !== 'AbortError') {
          console.error('Failed to load forecast data:', loadError);
          setError(loadError.message || 'An unexpected error occurred.');
        }
      });

    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <main className="app-message" role="alert">
        <div className="message-card">
          <h1>🇨🇭 Swiss Persona Radar</h1>
          <p>Weather data is temporarily unavailable.</p>
          <p className="message-detail">{error}</p>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    );
  }

  if (!weatherData) {
    return (
      <main className="app-message" aria-live="polite">
        <div className="message-card">
          <h1>🇨🇭 Swiss Persona Radar</h1>
          <p>Loading the latest Swiss weather forecast…</p>
          <div className="loading-bar" aria-hidden="true"><span /></div>
        </div>
      </main>
    );
  }

  return <WeatherRadar precalculatedData={weatherData} />;
}

export default App;
