//
// WeatherRadar.jsx
//
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { SWISS_LOCATIONS } from './data';
import { determinePersona } from './regelwerk';

// Custom hook to handle the "current time" logic
const useCurrentHour = () => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  return { currentHour, setCurrentHour };
};

const WeatherRadar = ({ precalculatedData }) => {
  const { currentHour, setCurrentHour } = useCurrentHour();
  const [isPlaying, setIsPlaying] = useState(false);

  // Optional: Auto-play the timeline
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentHour((prev) => (prev === 23 ? 0 : prev + 1));
      }, 1000); // Advances 1 hour per second
    }
    return () => clearInterval(interval);
  }, [isPlaying, setCurrentHour]);

  // Helper to create a custom Leaflet icon from an emoji string
  const createEmojiIcon = (symbol, className) => {
    return L.divIcon({
      html: `<div class="${className} drop-shadow-lg" style="font-size: 2rem; text-align: center;">${symbol}</div>`,
      className: 'custom-emoji-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 p-4">
      <h1 className="text-2xl font-bold mb-4">🇨🇭 Swiss Persona Radar</h1>
      
      {/* 24-Hour Ruler / Time Slider */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play Day'}
          </button>
          <span className="text-xl font-mono font-semibold">
            {String(currentHour).padStart(2, '0')}:00 CET
          </span>
          <button 
            onClick={() => setCurrentHour(new Date().getHours())}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Reset to Now
          </button>
        </div>

        <input 
          type="range" 
          min="0" 
          max="23" 
          value={currentHour} 
          onChange={(e) => {
            setIsPlaying(false); // Stop autoplay if user manually scrubs
            setCurrentHour(parseInt(e.target.value));
          }}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* The Map */}
      <div className="flex-grow rounded-lg overflow-hidden shadow-lg border-2 border-slate-300">
        <MapContainer 
          center={[46.8182, 8.2275]} // Center of Switzerland
          zoom={8} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* Render our Persona Markers based on the selected hour */}
          {SWISS_LOCATIONS.map((loc) => {
            // In a real app, you pull this specific hour's data from your precalculated JSON
            const hourData = precalculatedData[loc.name]?.hourly[currentHour]; 
            
            if (!hourData) return null;

            const persona = determinePersona(
              hourData.weatherCode, 
              hourData.temperature, 
              hourData.windSpeed, 
              loc.alt
            );

            return (
              <Marker 
                key={loc.name} 
                position={[loc.lat, loc.lon]} 
                icon={createEmojiIcon(persona.symbol, persona.size)}
              >
                <Popup>
                  <strong>{loc.name} ({loc.alt}m)</strong><br/>
                  Time: {currentHour}:00<br/>
                  Temp: {hourData.temperature}°C<br/>
                  Status: {persona.description}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherRadar;

