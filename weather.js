// Global variables
let currentUnits = 'metric'; // Default to Celsius
const favoriteCities = ['New York', 'London'];
let currentWeatherData = null;
let map = null;
let mapMarker = null;
let currentLat = 0;
let currentLon = 0;

// Weather video URLs (using free stock videos)
const weatherVideos = {
    clear: 'https://assets.mixkit.co/videos/preview/mixkit-blue-sky-with-white-clouds-1631-large.mp4',
    clearNight: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-1610-large.mp4',
    clouds: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-in-the-blue-sky-2408-large.mp4',
    cloudsNight: 'https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-clouds-2408-large.mp4',
    rain: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-2044-large.mp4',
    rainNight: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-2044-large.mp4',
    thunderstorm: 'https://assets.mixkit.co/videos/preview/mixkit-storm-clouds-in-the-sky-2408-large.mp4',
    thunderstormNight: 'https://assets.mixkit.co/videos/preview/mixkit-storm-clouds-in-the-sky-2408-large.mp4',
    snow: 'https://assets.mixkit.co/videos/preview/mixkit-winter-landscape-2564-large.mp4',
    snowNight: 'https://assets.mixkit.co/videos/preview/mixkit-winter-landscape-2564-large.mp4',
    mist: 'https://assets.mixkit.co/videos/preview/mixkit-fog-in-a-forest-2486-large.mp4',
    mistNight: 'https://assets.mixkit.co/videos/preview/mixkit-fog-in-a-forest-2486-large.mp4',
    default: 'https://assets.mixkit.co/videos/preview/mixkit-blue-sky-with-white-clouds-1631-large.mp4',
    defaultNight: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-1610-large.mp4'
};

let sunriseTime = null;
let sunsetTime = null;
let isNightTime = false;

// Initialize map
function initMap(lat, lon) {
    try {
        // Remove existing map if any
        if (map) {
            map.remove();
            map = null;
        }
        
        currentLat = lat;
        currentLon = lon;
        
        // Wait a bit for the container to be ready
        setTimeout(() => {
            // Create map
            map = L.map('mapContainer', {
                center: [lat, lon],
                zoom: 10,
                zoomControl: false // We have custom controls
            });
            
            // Add CartoDB English tile layer (shows labels in English)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
            
            // Add weather temperature layer from OpenWeatherMap
            L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=fa66dceec1a55ad267c15aa70248a96e`, {
                attribution: 'Weather data &copy; OpenWeatherMap',
                opacity: 0.5,
                maxZoom: 18
            }).addTo(map);
            
            // Add marker for current location
            if (mapMarker) {
                mapMarker.remove();
            }
            
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #FF6B35; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fas fa-map-marker-alt"></i></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            mapMarker = L.marker([lat, lon], { icon: customIcon }).addTo(map)
                .bindPopup('<b>Current Location</b>')
                .openPopup();
            
            // Force map to resize
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
            
        }, 200);
        
    } catch (error) {
        console.error('Error initializing map:', error);
        showNotification('Map Error', 'Failed to load map. Please try again.');
    }
}

// Check if it's currently night time
function isNight() {
    if (!sunriseTime || !sunsetTime) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Convert sunrise/sunset strings (HH:MM) to minutes
    const [sunriseHour, sunriseMin] = sunriseTime.split(':').map(Number);
    const [sunsetHour, sunsetMin] = sunsetTime.split(':').map(Number);
    
    const sunrise = sunriseHour * 60 + sunriseMin;
    const sunset = sunsetHour * 60 + sunsetMin;
    
    // It's night if current time is before sunrise or after sunset
    return currentTime < sunrise || currentTime > sunset;
}

// Update weather video based on condition
function updateWeatherVideo(description, elementId = 'mainWeatherVideo') {
    const videoElement = document.getElementById(elementId);
    if (!videoElement) return;
    
    const desc = description.toLowerCase();
    const nightTime = isNight();
    let videoUrl = nightTime ? weatherVideos.defaultNight : weatherVideos.default;
    
    if (desc.includes('clear') || desc.includes('sunny')) {
        videoUrl = nightTime ? weatherVideos.clearNight : weatherVideos.clear;
    } else if (desc.includes('cloud')) {
        videoUrl = nightTime ? weatherVideos.cloudsNight : weatherVideos.clouds;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
        videoUrl = nightTime ? weatherVideos.rainNight : weatherVideos.rain;
    } else if (desc.includes('thunder') || desc.includes('storm')) {
        videoUrl = nightTime ? weatherVideos.thunderstormNight : weatherVideos.thunderstorm;
    } else if (desc.includes('snow')) {
        videoUrl = nightTime ? weatherVideos.snowNight : weatherVideos.snow;
    } else if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze')) {
        videoUrl = nightTime ? weatherVideos.mistNight : weatherVideos.mist;
    }
    
    if (videoElement.src !== videoUrl) {
        videoElement.src = videoUrl;
        videoElement.load();
        videoElement.play().catch(e => console.log('Video autoplay prevented:', e));
    }
    
    // Add night mode styling
    const container = videoElement.closest('.weather-video-container');
    if (container) {
        if (nightTime) {
            container.classList.add('night-mode');
        } else {
            container.classList.remove('night-mode');
        }
    }
}

// Weather icon mapping
function getWeatherEmoji(description) {
    const desc = description.toLowerCase();
    if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
    if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
    return '🌤️';
}

// Button Functions
function navigateToHome() {
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.sidebar-btn').classList.add('active');
    showNotification('Home', '🏠 Weather Dashboard');
    // Refresh the current weather
    if (currentWeatherData) {
        const city = document.getElementById('cityInput').value;
        if (city) searchWeather();
    }
}

function toggleUnits() {
    currentUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
    showNotification('Units Changed', `Switched to ${currentUnits === 'metric' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}`);
    if (currentWeatherData) searchWeather();
}

function showNotifications() {
    showNotification('Weather Alert', '⛅ No active weather alerts for your location');
}

function zoomIn() {
    if (map) {
        map.zoomIn();
        showNotification('Zoom In', '🔍 Map zoomed in');
    }
}

function zoomOut() {
    if (map) {
        map.zoomOut();
        showNotification('Zoom Out', '🔍 Map zoomed out');
    }
}

function centerMap() {
    if (map && currentLat && currentLon) {
        map.setView([currentLat, currentLon], 10);
        showNotification('Map Centered', '🎯 Centered on current location');
    }
}

function toggleMapLayers() {
    showNotification('Map Layers', '🗺️ Temperature layer active');
}

function filterByWeatherType(type) {
    document.querySelectorAll('.weather-type-btn').forEach(btn => {
        btn.classList.remove('bg-orange-500', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-400');
    });
    event.target.closest('.weather-type-btn').classList.remove('bg-gray-100', 'text-gray-400');
    event.target.closest('.weather-type-btn').classList.add('bg-orange-500', 'text-white');
    showNotification('Filter Applied', `Showing ${type} weather conditions`);
}

function refreshHourlyForecast() {
    showNotification('Refreshing', '🔄 Updating hourly forecast...');
    searchWeather();
}

function refreshForecast() {
    showNotification('Refreshing', '🔄 Updating forecast...');
    searchWeather();
}

function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-8 bg-white rounded-xl shadow-2xl p-4 z-50 animate-slideIn';
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <div>
                <p class="font-semibold text-gray-800">${title}</p>
                <p class="text-sm text-gray-600">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Search functionality
function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    // Show loading spinner
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('weatherContainer').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');

    // Fetch weather data
    fetch(`/weather?city=${encodeURIComponent(city)}&units=${currentUnits}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                currentWeatherData = data;
                displayWeather(data);
                loadFavoriteCities();
            }
        })
        .catch(error => {
            showError('Error fetching weather data: ' + error.message);
        })
        .finally(() => {
            document.getElementById('loadingSpinner').classList.add('hidden');
        });
}

function displayWeather(data) {
    // Store sunrise and sunset times
    sunriseTime = data.current.sunrise;
    sunsetTime = data.current.sunset;
    isNightTime = isNight();
    
    // Update body background based on day/night
    const body = document.body;
    if (isNightTime) {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
    } else {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
    }
    
    // Update current weather
    document.getElementById('cityName').textContent = `${data.current.city}, ${data.current.country}`;
    document.getElementById('temperature').textContent = `${data.current.temperature}${data.current.unit_symbol}`;
    document.getElementById('mapTemp').textContent = `${data.current.temperature}${data.current.unit_symbol}`;
    document.getElementById('feelsLike').textContent = `${data.current.feels_like}${data.current.unit_symbol}`;
    document.getElementById('humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('humidityPercent').textContent = `${data.current.humidity}%`;
    document.getElementById('windSpeed').textContent = currentUnits === 'metric' ? `${data.current.wind_speed} m/s` : `${data.current.wind_speed} mph`;
    document.getElementById('pressure').textContent = `${data.current.pressure} hPa`;
    document.getElementById('visibility').textContent = `${data.current.visibility} km`;
    document.getElementById('sunrise').textContent = data.current.sunrise;
    document.getElementById('sunset').textContent = data.current.sunset;
    
    // Update weather icon
    document.getElementById('weatherIcon').textContent = getWeatherEmoji(data.current.description);
    
    // Update weather video
    updateWeatherVideo(data.current.description);
    
    // Initialize map with current location
    initMap(data.current.lat, data.current.lon);

    // Update air quality
    if (data.air_quality) {
        document.getElementById('aqiValue').textContent = data.air_quality.aqi;
        document.getElementById('aqiDescription').textContent = data.air_quality.description;
    } else {
        document.getElementById('aqiValue').textContent = '-';
        document.getElementById('aqiDescription').textContent = 'No data';
    }

    // Update tomorrow's forecast
    if (data.forecast && data.forecast.length > 0) {
        const tomorrow = data.forecast[0];
        document.getElementById('tomorrowLocation').textContent = `${data.current.city}, ${data.current.country}`;
        document.getElementById('tomorrowTemp').textContent = `${tomorrow.temperature}${tomorrow.unit_symbol}`;
        document.getElementById('tomorrowDesc').textContent = tomorrow.description;
        document.getElementById('tomorrowIcon').textContent = getWeatherEmoji(tomorrow.description);
        
        // Update tomorrow's video background
        updateWeatherVideo(tomorrow.description, 'tomorrowWeatherVideo');
    }
    
    // Update hourly forecast
    if (data.hourly) {
        const hourlyContainer = document.getElementById('hourlyForecastContainer');
        hourlyContainer.innerHTML = '';
        
        data.hourly.forEach((hour, index) => {
            const hourCard = document.createElement('div');
            hourCard.className = 'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center card-hover animate-fadeIn';
            hourCard.style.animationDelay = `${index * 0.1}s`;
            hourCard.innerHTML = `
                <p class="text-sm text-gray-600 mb-2">${hour.hour}</p>
                <div class="text-4xl mb-2">${getWeatherEmoji(hour.description)}</div>
                <p class="text-2xl font-bold text-gray-800">${hour.temperature}${hour.unit_symbol}</p>
                <p class="text-xs text-gray-600 mt-2">${hour.description}</p>
                <div class="flex justify-center space-x-2 mt-2 text-xs text-gray-500">
                    <span title="Humidity"><i class="fas fa-tint"></i> ${hour.humidity}%</span>
                </div>
            `;
            hourlyContainer.appendChild(hourCard);
        });
        
        // Update simple hourly temps
        if (data.hourly.length >= 4) {
            document.getElementById('tempMorning').textContent = `${data.hourly[0].temperature}°`;
            document.getElementById('tempAfternoon').textContent = `${data.hourly[1].temperature}°`;
            document.getElementById('tempEvening').textContent = `${data.hourly[2].temperature}°`;
            document.getElementById('tempNight').textContent = `${data.hourly[3].temperature}°`;
        }
    }
    
    // Update forecast
    if (data.forecast) {
        const forecastContainer = document.getElementById('sevenDayForecastContainer');
        forecastContainer.innerHTML = '';
        
        data.forecast.forEach((day, index) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-4 text-center card-hover animate-fadeIn';
            dayCard.style.animationDelay = `${index * 0.1}s`;
            dayCard.innerHTML = `
                <p class="font-bold text-gray-800 text-sm">${day.date}</p>
                <p class="text-xs text-gray-600 mb-2">${day.date_short}</p>
                <div class="text-5xl my-3">${getWeatherEmoji(day.description)}</div>
                <p class="text-2xl font-bold text-gray-800">${day.temperature}${day.unit_symbol}</p>
                <p class="text-xs text-gray-500 mt-1">${day.temp_min}°/${day.temp_max}°</p>
                <p class="text-xs text-gray-600 mt-2">${day.description}</p>
            `;
            forecastContainer.appendChild(dayCard);
        });
    }

    // Show weather container
    document.getElementById('weatherContainer').classList.remove('hidden');
}

function loadFavoriteCities() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    favoritesContainer.innerHTML = '<p class="text-gray-500 text-center text-sm">Loading...</p>';
    
    // Fetch weather for favorite cities
    fetch(`/favorites?cities=${encodeURIComponent(favoriteCities.join(','))}&units=${currentUnits}`)
        .then(response => response.json())
        .then(data => {
            favoritesContainer.innerHTML = '';
            
            if (data.favorites && data.favorites.length > 0) {
                data.favorites.forEach(city => {
                    const cityCard = document.createElement('div');
                    cityCard.className = 'flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition cursor-pointer card-hover';
                    cityCard.onclick = () => {
                        document.getElementById('cityInput').value = city.city;
                        searchWeather();
                    };
                    cityCard.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <div class="text-3xl">${getWeatherEmoji(city.description)}</div>
                            <div>
                                <p class="font-semibold text-gray-800">${city.city}</p>
                                <p class="text-xs text-gray-500">${city.description}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xl font-bold text-gray-800">${city.temperature}${city.unit_symbol}</p>
                            <p class="text-xs text-gray-500">${city.temp_min}/${city.temp_max}${city.unit_symbol}</p>
                        </div>
                    `;
                    favoritesContainer.appendChild(cityCard);
                });
            } else {
                favoritesContainer.innerHTML = '<p class="text-gray-500 text-center text-sm">No data</p>';
            }
        })
        .catch(error => {
            favoritesContainer.innerHTML = '<p class="text-red-500 text-center text-sm">Error loading cities</p>';
            console.error('Error loading favorite cities:', error);
        });
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Event listeners
    document.getElementById('searchBtn').addEventListener('click', searchWeather);
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });

    // Load default city weather
    document.getElementById('cityInput').value = 'Dhaka';
    searchWeather();
    loadFavoriteCities();
});
