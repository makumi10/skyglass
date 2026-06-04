/**
 * app.js
 * Entry point. Handles:
 *   - Clock
 *   - Fetching data from our own /api/* routes (never directly from WeatherAI)
 *   - Calling render functions from ui.js
 *   - Search and auto-locate interactions
 *
 * Depends on: weather.js, ui.js
 */


/* ── Clock ────────────────────────────────────────────────────── */

function updateClock() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

setInterval(updateClock, 1000);
updateClock();


/* ── API ──────────────────────────────────────────────────────── */

/**
 * Fetches from one of our own server routes.
 * Throws with a readable message if the response is not OK.
 * @param {string} path - e.g. '/api/locate' or '/api/geocode?q=Nairobi'
 * @returns {Promise<object>}
 */
async function apiFetch(path) {
  const response = await fetch(path);
  const body     = await response.json();

  if (!response.ok) {
    throw new Error(body.error || `Server error ${response.status}`);
  }

  return body;
}


/* ── Render orchestrator ──────────────────────────────────────── */

/**
 * Takes a full API response and delegates each section to ui.js.
 * @param {object} data - WeatherAI API response (proxied through our server)
 */
function renderAll(data) {
  const location = data.location || {};
  const current  = data.current  || {};
  const hourly   = data.hourly   || [];
  const daily    = data.daily    || [];
  const today    = daily[0]      || {};

  renderHero(location, current, data._resolvedCity);
  renderHourly(hourly);
  renderForecast(daily);
  renderDetails(today, location.timezone);
  renderTimestamp();

  showData();
}


/* ── Actions ──────────────────────────────────────────────────── */

/**
 * Uses the server's IP geolocation to detect the user's location
 * and load weather automatically on page load.
 */
async function autoLocate() {
  showLoading('Detecting your location…');
  try {
    const data = await apiFetch('/api/locate');
    renderAll(data);
  } catch (error) {
    showError(`Auto-detect failed: ${error.message}. Try searching for a city instead.`);
  }
}

/**
 * Reads the search input, geocodes the city name via the server,
 * and renders the resulting weather data.
 */
async function searchCity() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;

  showLoading(`Searching for "${query}"…`);
  try {
    const data = await apiFetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    renderAll(data);
  } catch (error) {
    showError(`Error: ${error.message}`);
    document.getElementById('loading').style.display = 'none';
  }
}


/* ── Event listeners ──────────────────────────────────────────── */

document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchCity();
});


/* ── Init ─────────────────────────────────────────────────────── */

autoLocate();
