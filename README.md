# Skyglass — Weather Intelligence Dashboard

A full-stack weather dashboard built on the [WeatherAI API](https://weather-ai.co) as a take-home engineering assessment.

> **Security:** The API key never touches the browser. All WeatherAI requests are proxied through a Node.js/Express backend. The frontend only ever talks to `/api/*` routes on your own server.

---

## Live Demo

[https://skyglass.onrender.com](https://skyglass.onrender.com) ← replace with your deployed URL

---

## Features

- **Auto-detect location** on load via IP geolocation (`/v1/weather-geo?ip=auto`)
- **City search** — type any city name and get live conditions
- **Current conditions** — temperature, feels-like, humidity, wind speed & direction, wind gust, UV index
- **12-hour hourly forecast** — scrollable strip with rain probability badges
- **7-day daily forecast** — highs/lows, weather icon, precipitation probability
- **Conditions detail panel** — sunrise/sunset, rain chance, max wind, high/low, timezone
- **Fully responsive** — desktop, tablet, and mobile
- **Live clock**, graceful error handling

---

## Architecture

```
Browser  →  GET /api/locate          (no API key, no secrets)
             GET /api/geocode?q=Lagos
             GET /api/weather?lat=&lon=
                    ↓
          Express server  (reads WEATHERAI_API_KEY from .env)
                    ↓
          api.weather-ai.co
```

The API key lives **only** in `.env` on the server. It is never bundled into the frontend, never sent in responses, and `.env` is excluded from version control.

---

## API Endpoints Used

| Internal Route | WeatherAI Endpoint | Purpose |
|---|---|---|
| `GET /api/locate` | `GET /v1/weather-geo?ip=auto` | Auto-detects location from caller's IP |
| `GET /api/geocode?q=` | Open-Meteo geocode + `GET /v1/weather` | Converts city name → coordinates → weather |
| `GET /api/weather?lat=&lon=` | `GET /v1/weather` | Direct coordinate-based weather lookup |

**Note:** City name search uses the free [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) to resolve names to coordinates since the WeatherAI API is coordinate-based.

---

## Local Setup

### Prerequisites
- Node.js ≥ 18 — check with `node -v`
- A WeatherAI API key from [weather-ai.co](https://weather-ai.co)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/skyglass-weather.git
cd skyglass-weather

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and set your key:
# WEATHERAI_API_KEY=wai_your_key_here

# 4. Start the server
npm start
# → http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

### Render (recommended — free tier available)

1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variable: `WEATHERAI_API_KEY` → your key
5. Click **Deploy** — you'll get a live HTTPS URL

### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
# Then set WEATHERAI_API_KEY in the Railway dashboard under Variables
```

### Fly.io

```bash
fly launch
fly secrets set WEATHERAI_API_KEY=wai_your_key_here
fly deploy
```

---

## Project Structure

```
skyglass-weather/
├── server/
│   └── index.js        # Express server — proxies all WeatherAI calls
├── public/
│   └── index.html      # Frontend SPA — only talks to /api/*
├── .env                # Secret config — gitignored, never committed
├── .env.example        # Template committed to the repo
├── .gitignore
├── package.json
└── README.md
```

---

## Security Notes

- The API key is loaded from `.env` at server startup only
- `.env` is listed in `.gitignore` — it will never be committed to the repo
- The server forwards the real client IP via `X-Forwarded-For` so IP geolocation works correctly behind a proxy/CDN
- The frontend has no reference to the API key anywhere in its source

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Frontend | Vanilla HTML/CSS/JS (no framework, no build step) |
| Weather data | [WeatherAI API](https://weather-ai.co) |
| Geocoding | [Open-Meteo Geocoding API](https://open-meteo.com) (free, no key needed) |
| Deployment | Render / Railway / Fly.io |

---

## License

MIT
