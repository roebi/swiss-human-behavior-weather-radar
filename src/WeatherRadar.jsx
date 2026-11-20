import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { SWISS_LOCATIONS } from './data.js';
import { determinePersona } from './regelwerk.js';

const createEmojiIcon = (symbol) => L.divIcon({
  html: `<span aria-hidden="true">${symbol}</span>`,
  className: 'custom-emoji-icon',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -18],
});

const WeatherRadar = ({ precalculatedData }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const interval = window.setInterval(() => {
      setCurrentHour((hour) => (hour === 23 ? 0 : hour + 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const availableLocations = SWISS_LOCATIONS.filter((location) =>
    Array.isArray(precalculatedData[location.name]?.hourly),
  );

  return (
    <main className="radar-app">
      <header className="radar-header">
        <div>
          <h1>🇨🇭 Swiss Persona Radar</h1>
          <p className="radar-subtitle">A playful, hourly view of weather across Switzerland</p>
        </div>
      </header>

      <section className="radar-controls" aria-label="Forecast timeline controls">
        <div className="radar-control-row">
          <button type="button" onClick={() => setIsPlaying((playing) => !playing)}>
            {isPlaying ? '⏸ Pause' : '▶ Play day'}
          </button>
          <span className="radar-time" aria-live="polite">{String(currentHour).padStart(2, '0')}:00 local time</span>
          <button className="secondary-button" type="button" onClick={() => setCurrentHour(new Date().getHours())}>
            Reset to now
          </button>
        </div>
        <input
          aria-label="Forecast hour"
          type="range"
          min="0"
          max="23"
          value={currentHour}
          onChange={(event) => {
            setIsPlaying(false);
            setCurrentHour(Number(event.target.value));
          }}
        />
        <div className="radar-hours" aria-hidden="true">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>
      </section>

      <section className="radar-map" aria-label="Weather map of Switzerland">
        <MapContainer center={[46.8182, 8.2275]} zoom={8} scrollWheelZoom={false}>
          <TileLayer
            url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg"
            attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'
            maxZoom={18}
          />
          {availableLocations.map((location) => {
            const hourData = precalculatedData[location.name].hourly[currentHour];
            if (!hourData) return null;
            const persona = determinePersona(
              hourData.weatherCode,
              hourData.temperature,
              hourData.windSpeed,
              location.alt,
            );
            return (
              <Marker
                key={location.name}
                position={[location.lat, location.lon]}
                icon={createEmojiIcon(persona.symbol)}
              >
                <Popup>
                  <strong>{location.name} ({location.alt} m)</strong><br />
                  {String(currentHour).padStart(2, '0')}:00 local time<br />
                  Temperature: {hourData.temperature}°C<br />
                  Wind: {hourData.windSpeed} km/h<br />
                  {persona.description}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </section>
      <footer className="radar-footer">
        {availableLocations.length} of {SWISS_LOCATIONS.length} locations · Forecast is precomputed once daily
      </footer>
    </main>
  );
};

export default WeatherRadar;
