export const determinePersona = (weatherCode, temp, windSpeed, altitude) => {
  if ((weatherCode >= 71 && weatherCode <= 77) && altitude > 1000) {
    return { symbol: '⛓️', description: 'Snow Chains Needed', size: 'text-4xl' };
  }
  if ((weatherCode >= 71 && weatherCode <= 77) && altitude <= 1000) {
    return { symbol: '🚜', description: 'City Slush - Snowplow', size: 'text-3xl' };
  }
  if (windSpeed > 35) {
    return { symbol: '🪁', description: 'High Wind / Bise', size: 'text-3xl animate-pulse' };
  }
  if ((weatherCode === 45 || weatherCode === 48) && altitude < 800) {
    return { symbol: '🔦', description: 'Thick Fog - Bring a Torch', size: 'text-3xl opacity-70' };
  }
  if (weatherCode <= 2 && temp >= 25) {
    return { symbol: '🩳', description: 'Badi Weather!', size: 'text-4xl animate-bounce' };
  }
  if (weatherCode >= 61 && weatherCode <= 65) {
    return { symbol: '🌂', description: 'Standard Rain', size: 'text-3xl' };
  }
  return { symbol: '🚶', description: 'Normal Conditions', size: 'text-2xl' };
};

