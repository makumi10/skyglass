import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Config ─────────────────────────────────────────────────────────────────
const WAI_KEY  = process.env.WEATHERAI_API_KEY;
const WAI_BASE = 'https://api.weather-ai.co';

if (!WAI_KEY) {
  console.error('[ERROR] WEATHERAI_API_KEY is not set. Check your .env file.');
  process.exit(1);
}

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Helpers ─────────────────────────────────────────────────────────────────
async function waiGet(path, params = {}) {
  const url = new URL(WAI_BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${WAI_KEY}` },
  });

  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body?.message || body?.error || `WeatherAI error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

// ── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/weather?lat=&lon=&days=7
 * Returns full weather + forecast + AI summary for given coordinates.
 */
app.get('/api/weather', async (req, res) => {
  const { lat, lon, days = 7 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required query parameters.' });
  }

  try {
    const data = await waiGet('/v1/weather', {
      lat, lon, days, ai: 'true', units: 'metric',
    });
    res.json(data);
  } catch (err) {
    console.error('[/api/weather]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

/**
 * GET /api/locate
 * Auto-detects caller's location from IP and returns weather.
 * We forward the client's real IP so WeatherAI geo-detects correctly.
 */
app.get('/api/locate', async (req, res) => {
  const clientIp =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'auto';

  const ip = clientIp === '::1' || clientIp === '127.0.0.1' ? 'auto' : clientIp;

  try {
    const data = await waiGet('/v1/weather-geo', {
      ip, days: 7, ai: 'true',
    });
    res.json(data);
  } catch (err) {
    console.error('[/api/locate]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

/**
 * GET /api/geocode?q=Nairobi
 * Converts a city name to lat/lon via Open-Meteo (free, no key needed),
 * then fetches weather from WeatherAI.
 */
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q (city name) is required.' });

  try {
    const geoRes  = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`
    );
    const geoData = await geoRes.json();

    if (!geoData.results?.length) {
      return res.status(404).json({ error: `City "${q}" not found. Try a different name.` });
    }

    const { latitude: lat, longitude: lon, name, country } = geoData.results[0];
    const weather = await waiGet('/v1/weather', {
      lat, lon, days: 7, ai: 'true', units: 'metric',
    });

    // Merge the geocoded city name in case the API returns a different name
    weather._resolvedCity = `${name}, ${country}`;
    res.json(weather);
  } catch (err) {
    console.error('[/api/geocode]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

/**
 * GET /api/usage
 * Returns billing period usage stats.
 */
app.get('/api/usage', async (req, res) => {
  try {
    const data = await waiGet('/v1/usage');
    res.json(data);
  } catch (err) {
    console.error('[/api/usage]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

// ── Catch-all → SPA ─────────────────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Skyglass running → http://localhost:${PORT}`);
  console.log(`  API key loaded   → ${WAI_KEY.slice(0, 12)}…[redacted]\n`);
});
