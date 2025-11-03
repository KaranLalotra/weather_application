🌦️ Weather Dashboard (Flask)

A modern, interactive weather dashboard built with Flask and OpenWeatherMap APIs, featuring animated weather effects, day/night automation, and an interactive map overlay.

✨ Features

🌞 Day/Night background automation with animated visuals

🌧️ Dynamic weather effects: rain, snow, thunderstorm, fog/mist

🎥 Video backgrounds that change with weather and time of day

🗺️ Interactive map (Leaflet) with temperature layer overlay

⏰ Current weather, next 12-hour, and 5-day forecast

🌫️ Air Quality Index (AQI) with detailed components

🌆 Favorite cities quick-view and click-to-search support

🌡️ Unit toggle: °C / °F

🧰 Tech Stack

Backend: Flask (Python), requests
Frontend: Tailwind CSS (CDN), Font Awesome (CDN), Leaflet (CDN)
Data: OpenWeatherMap APIs (Weather, Forecast, Air Pollution)

⚙️ Prerequisites

Python 3.9+ (recommended)

OpenWeatherMap API Key → Get one here

🚀 Setup (Windows PowerShell)
# Navigate to your project directory
cd C:\Users\karan\OneDrive\Desktop\sku

# Create and activate a virtual environment
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install flask requests

🔑 Configure Your API Key

Open app.py and replace the placeholder with your API key:

API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"


⚠️ Note: Never commit your real API key to public repositories.

▶️ Run the App
# From the project root
python app.py


Then open your browser to:

👉 http://localhost:5000

The server runs on 0.0.0.0:5000 (accessible on your local network if allowed by the firewall).

📁 Project Structure
.
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── weather.js

⚙️ Environment & Configuration
Setting	Location	Description
Default City	app.py (index route)	Shown on initial load (default: Dhaka)
Favorite Cities	static/js/weather.js → favoriteCities array	Edit to customize quick-view cities
Units	UI toggle	Metric or Imperial
🌍 API Endpoints
GET /weather

Query: city, units (metric | imperial)
Example: /weather?city=London&units=metric
Returns:
current, hourly (next 12h), daily (5-day), air_quality

GET /favorites

Query: cities (comma-separated), units
Example: /favorites?cities=New%20York,London&units=metric
Returns:
List of processed current weather for each city.

🧩 Notes

Tailwind, Font Awesome, and Leaflet are loaded via CDN — no build step needed.

Background videos use public stock URLs — autoplay may require user interaction in some browsers.

Temperature map overlay uses OpenWeatherMap tiles.

Debug mode is enabled by default (disable for production).

💡 Future Enhancements

Dark/light theme customization

PWA (offline support + add to home screen)

City autocomplete search

Multi-language localization
