/**
 * ui.js
 * Responsible for all DOM updates.
 * Each function takes data from the API response and renders one section.
 *
 * Depends on: weather.js (wmoIcon, wmoLabel, windDirection, uvLabel, formatTime)
 */


/* ── Helpers ──────────────────────────────────────────────────── */

const $ = id => document.getElementById(id);


/* ── Loading / error / data states ───────────────────────────── */

function showLoading(message) {
  $('loading').style.display = 'flex';
  $('loading-msg').textContent = message || 'Loading…';
  $('data-view').style.display = 'none';
  $('error-banner').style.display = 'none';
}

function showError(message) {
  $('error-banner').textContent = message;
  $('error-banner').style.display = 'block';
  $('loading').style.display = 'none';
}

function showData() {
  $('loading').style.display = 'none';
  $('data-view').style.display = 'block';
}


/* ── Hero card ────────────────────────────────────────────────── */

function renderHero(location, current, resolvedCity) {
  $('hero-city').textContent      = resolvedCity || location.city || '—';
  $('hero-region').textContent    = [location.region, location.country].filter(Boolean).join(', ') || location.country || '—';
  $('hero-temp').innerHTML        = `${Math.round(current.temperature ?? 0)}<sup>°C</sup>`;
  $('hero-condition').textContent = wmoLabel(current.condition_code ?? 0);
  $('hero-icon').textContent      = wmoIcon(current.condition_code ?? 0);

  $('stat-feels').textContent    = `${Math.round(current.feels_like ?? 0)}°C`;
  $('stat-humidity').textContent = `${current.humidity ?? '—'}%`;
  $('stat-wind').textContent     = `${Math.round(current.wind_speed ?? 0)} km/h ${windDirection(current.wind_direction ?? 0)}`;
  $('stat-gust').textContent     = current.wind_gust != null ? `${Math.round(current.wind_gust)} km/h` : '—';
  $('stat-uv').textContent       = `${(current.uv_index ?? 0).toFixed(1)} · ${uvLabel(current.uv_index ?? 0)}`;
}


/* ── Hourly strip ─────────────────────────────────────────────── */

/**
 * @param {Array}  hourlyData  - full hourly array from the API
 * @param {string} currentTime - API's current time e.g. "2026-06-04T00:25"
 *                               Used instead of browser clock to avoid
 *                               timezone mismatch between browser and location.
 */
function renderHourly(hourlyData, currentTime) {
  // Derive the current date and hour directly from the API's reported time,
  // not from the browser. This ensures the filter is always correct for the
  // searched location regardless of what timezone the user's device is in.
  const apiDate = currentTime.slice(0, 10);
  const apiHour = +currentTime.slice(11, 13);

  const upcoming = hourlyData
    .filter(h => {
      const hDate = h.time.slice(0, 10);
      const hHour = +h.time.slice(11, 13);
      return hDate >= apiDate && (hDate > apiDate || hHour >= apiHour);
    })
    .slice(0, 12);

  $('hourly-strip').innerHTML = upcoming.map((h, i) => {
    const label = i === 0 ? 'Now' : h.time.slice(11, 16);
    const rain  = h.precipitation_probability || 0;

    return `
      <div class="hour-card ${i === 0 ? 'hour-card--now' : ''}">
        <div class="hour-card__time">${label}</div>
        <div class="hour-card__icon">${wmoIcon(h.condition_code)}</div>
        <div class="hour-card__temp">${Math.round(h.temperature)}°</div>
        ${rain > 0 ? `<div class="hour-card__rain">${rain}%</div>` : ''}
      </div>`;
  }).join('');
}


/* ── 7-day forecast ───────────────────────────────────────────── */

function renderForecast(dailyData) {
  $('forecast-grid').innerHTML = dailyData.map((day, i) => {
    // Use noon of each date to avoid timezone-shift issues with weekday labels
    const dayName = i === 0
      ? 'Today'
      : new Date(day.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' });

    const rain = day.precipitation_probability || 0;

    return `
      <div class="forecast-card ${i === 0 ? 'forecast-card--today' : ''}">
        <div class="forecast-card__day">${dayName}</div>
        <div class="forecast-card__icon">${wmoIcon(day.condition_code)}</div>
        <div class="forecast-card__high">${Math.round(day.temp_max)}°</div>
        <div class="forecast-card__low">${Math.round(day.temp_min)}°</div>
        ${rain > 0 ? `<div class="forecast-card__rain">💧 ${rain}%</div>` : ''}
      </div>`;
  }).join('');
}


/* ── Conditions detail ────────────────────────────────────────── */

function renderDetails(today, timezone) {
  const details = [
    {
      label: 'Sunrise',
      value: formatTime(today.sunrise),
      sub:   '',
    },
    {
      label: 'Sunset',
      value: formatTime(today.sunset),
      sub:   '',
    },
    {
      label: 'Rain Chance',
      value: `${today.precipitation_probability ?? 0}%`,
      sub:   `${today.precipitation_sum ?? 0} mm total`,
    },
    {
      label: 'Max Wind',
      value: `${Math.round(today.wind_max ?? 0)} km/h`,
      sub:   '',
    },
    {
      label: 'High / Low',
      value: `${Math.round(today.temp_max ?? 0)}° / ${Math.round(today.temp_min ?? 0)}°`,
      sub:   'today',
    },
    {
      label: 'Timezone',
      value: timezone || '—',
      sub:   '',
    },
  ];

  $('detail-grid').innerHTML = details.map(d => `
    <div class="detail-card">
      <div class="detail-card__label">${d.label}</div>
      <div class="detail-card__value">${d.value}</div>
      ${d.sub ? `<div class="detail-card__sub">${d.sub}</div>` : ''}
    </div>`).join('');
}


/* ── Timestamp ────────────────────────────────────────────────── */

function renderTimestamp() {
  $('last-updated').textContent =
    `Updated ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}
