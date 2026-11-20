// Fixed places used by the legacy forecast format ({ "Zurich": { hourly: [...] }, ... }).
const LEGACY_LOCATIONS = [
  { name: 'Zurich', lat: 47.3769, lon: 8.5417, alt: 408 },
  { name: 'Geneva', lat: 46.2044, lon: 6.1432, alt: 375 },
  { name: 'Bern', lat: 46.9480, lon: 7.4474, alt: 542 },
  { name: 'Zermatt', lat: 46.0207, lon: 7.7491, alt: 1608 },
  { name: 'St. Moritz', lat: 46.4908, lon: 9.8355, alt: 1822 },
  { name: 'Lugano', lat: 46.0037, lon: 8.9511, alt: 273 }
];

/**
 * Turns forecast.json into a list of { name, lat, lon, alt, hourly } locations.
 * Supports the current format ({ locations: [...] }) and the legacy fixed-places format.
 */
export const toLocations = (forecast) => {
  if (Array.isArray(forecast?.locations)) {
    return forecast.locations.filter((location) => Array.isArray(location?.hourly));
  }
  return LEGACY_LOCATIONS
    .filter((location) => Array.isArray(forecast?.[location.name]?.hourly))
    .map((location) => ({ ...location, hourly: forecast[location.name].hourly }));
};
