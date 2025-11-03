Weather Dashboard (Flask)
A modern weather dashboard with day/night background automation, dynamic weather animations (rain, snow, thunder, fog), video backgrounds, Leaflet map with temperature overlay, hourly and 5‑day forecasts, and air quality (AQI).
Features
Day/Night background automation with animated visuals
Dynamic weather effects: rain, snow, thunderstorm, fog/mist
Video backgrounds that change with weather and day/night
Interactive map (Leaflet) with temperature layer overlay
Current weather, next 12 hours, and 5‑day forecast
Air Quality Index (AQI) with components
Favorite cities quick-view and click-to-search
Unit toggle (°C/°F)
Tech Stack
Backend: Flask (Python), requests
Frontend: Tailwind CSS (CDN), Font Awesome (CDN), Leaflet (CDN)
Data: OpenWeatherMap APIs (Weather, Forecast, Air Pollution)
Prerequisites
Python 3.9+ recommended
OpenWeatherMap API key (free): https://openweathermap.org/api
Setup (Windows PowerShell)
powershell
# Navigate to the project directory
cd c:\Users\karan\OneDrive\Desktop\sku

# Create and activate a virtual environment
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install flask requests
Configure your API key
Edit app.py and replace the placeholder with your own key:
python
API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"
Note: Avoid committing real API keys to public repos.
Run the app
powershell
# From the project root
python app.py
Open http://localhost:5000 in your browser.The server listens on 0.0.0.0:5000 (accessible on local network if firewall allows).
Project Structure
.
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── weather.js
Environment and Configuration
Default city shown: Dhaka (set in app.py index route)
Favorite cities (frontend): edit in static/js/weather.js → favoriteCities array
Units: toggle from UI; backend accepts metric or imperial
API Endpoints
GET /weather
Query: city, units (metric|imperial)
Example: /weather?city=London&units=metric
Returns: current, hourly (next 12 hours), 5‑day (daily sample), air_quality
GET /favorites
Query: cities (comma‑separated), units
Example: /favorites?cities=New%20York,London&units=metric
Returns: list of processed current weather for each city
Notes
Tailwind, Font Awesome, and Leaflet are loaded via CDN; no extra build step required.
Video backgrounds use public stock video URLs; autoplay may be blocked on some browsers until user interaction.
OpenWeatherMap tiles are used for temperature overlay on the map.
Debug mode is enabled in app.py for development; disable for production.
