# Skyglass — Weather Intelligence Dashboard

Skyglass is a weather dashboard that gives you real-time weather conditions for any city in the world. Open it, and it immediately shows the weather where you are. Search any city and it updates instantly.

**Live demo:** [https://spyglass.onrender.com](https://spyglass.onrender.com)

---

## What it shows

- Current temperature, feels-like, humidity, wind speed and UV index
- Hour-by-hour forecast for the next 12 hours
- 7-day forecast with daily highs and lows
- Sunrise and sunset times, rain chance, and max wind for the day

---

## How it works

Skyglass is built on two parts:

- A **backend server** that communicates with the WeatherAI API. The API key lives here and is never exposed to the browser.
- A **frontend** (the page you see) that requests weather data from the backend and displays it.

When you open the app, your location is detected automatically. You can also search any city by name using the search bar.

---

## Running it locally

You will need [Node.js](https://nodejs.org) (version 18 or higher) installed on your machine.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/skyglass-weather.git
cd skyglass-weather

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Open .env and add your WeatherAI API key

# 4. Start the server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project structure

```
skyglass-weather/
├── server/
│   └── index.js          # Backend — handles API requests, keeps the key secure
├── public/
│   ├── index.html        # Page structure
│   ├── css/
│   │   └── styles.css    # All styling and responsive layout
│   └── js/
│       ├── weather.js    # Utilities: condition codes, wind direction, UV labels
│       ├── ui.js         # Renders each section of the dashboard
│       └── app.js        # Entry point: fetches data and ties everything together
├── .env.example          # Template for environment variables
├── .gitignore
└── package.json
```

---

## Tech used

| | |
|---|---|
| Backend | Node.js + Express |
| Frontend | HTML, CSS, vanilla JavaScript |
| Weather data | [WeatherAI API](https://weather-ai.co) |
| City search geocoding | [Open-Meteo Geocoding API](https://open-meteo.com) |