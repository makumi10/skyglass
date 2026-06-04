/**
 * weather.js
 * Utility functions for interpreting WeatherAI API data.
 * Covers WMO 4677 condition codes, wind direction, and UV index labels.
 */

/**
 * Maps a WMO 4677 condition code to an emoji icon.
 * @param {number|string} code - WMO condition code
 * @returns {string} emoji
 */
function wmoIcon(code) {
  const c = +code;
  if (c === 0)                return '☀️';
  if (c === 1)                return '🌤️';
  if (c === 2)                return '⛅';
  if (c === 3)                return '☁️';
  if (c === 45 || c === 48)   return '🌫️';
  if (c >= 51 && c <= 67)     return '🌧️';
  if (c >= 71 && c <= 77)     return '❄️';
  if (c >= 80 && c <= 82)     return '🌦️';
  if (c >= 85 && c <= 86)     return '🌨️';
  if (c >= 95)                return '⛈️';
  return '🌡️';
}

/**
 * Maps a WMO 4677 condition code to a plain-English label.
 * @param {number|string} code - WMO condition code
 * @returns {string}
 */
function wmoLabel(code) {
  const c = +code;
  if (c === 0)                          return 'Clear sky';
  if (c === 1)                          return 'Mainly clear';
  if (c === 2)                          return 'Partly cloudy';
  if (c === 3)                          return 'Overcast';
  if (c === 45 || c === 48)             return 'Foggy';
  if (c === 51 || c === 53 || c === 55) return 'Drizzle';
  if (c === 61 || c === 63 || c === 65) return 'Rain';
  if (c === 66 || c === 67)             return 'Freezing rain';
  if (c >= 71 && c <= 77)               return 'Snow';
  if (c >= 80 && c <= 82)               return 'Rain showers';
  if (c >= 85 && c <= 86)               return 'Snow showers';
  if (c === 95)                         return 'Thunderstorm';
  if (c >= 96)                          return 'Thunderstorm + hail';
  return 'Unknown';
}

/**
 * Converts a wind bearing (degrees) to a compass direction label.
 * @param {number} degrees
 * @returns {string} e.g. "NE"
 */
function windDirection(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

/**
 * Returns a plain-English UV index risk label.
 * @param {number} uv
 * @returns {string}
 */
function uvLabel(uv) {
  if (uv <= 2)  return 'Low';
  if (uv <= 5)  return 'Moderate';
  if (uv <= 7)  return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

/**
 * Extracts HH:MM from an ISO datetime string like "2026-06-04T05:25".
 * @param {string} iso
 * @returns {string}
 */
function formatTime(iso) {
  return iso ? iso.slice(11, 16) : '—';
}
