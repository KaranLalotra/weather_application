from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime
import os

app = Flask(__name__)

# Your API key
API_KEY = "fa66dceec1a55ad267c15aa70248a96e"
BASE_URL = "http://api.openweathermap.org/data/2.5"

def get_weather_data(city, units='metric'):
    """Fetch current weather data for a given city"""
    try:
        url = f"{BASE_URL}/weather"
        params = {
            'q': city,
            'appid': API_KEY,
            'units': units
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None

def get_forecast_data(city, units='metric'):
    """Fetch 5-day weather forecast for a given city"""
    try:
        url = f"{BASE_URL}/forecast"
        params = {
            'q': city,
            'appid': API_KEY,
            'units': units
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching forecast data: {e}")
        return None

def get_air_quality_data(lat, lon):
    """Fetch air quality data for given coordinates"""
    try:
        url = f"{BASE_URL}/air_pollution"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': API_KEY
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching air quality data: {e}")
        return None

def process_weather_data(weather_data, units='metric'):
    """Process raw weather data into a more usable format"""
    if not weather_data:
        return None
        
    # Determine unit symbol
    unit_symbol = '°C' if units == 'metric' else '°F'
        
    return {
        'city': weather_data['name'],
        'country': weather_data['sys']['country'],
        'temperature': round(weather_data['main']['temp']),
        'feels_like': round(weather_data['main']['feels_like']),
        'temp_min': round(weather_data['main']['temp_min']),
        'temp_max': round(weather_data['main']['temp_max']),
        'description': weather_data['weather'][0]['description'].title(),
        'humidity': weather_data['main']['humidity'],
        'pressure': weather_data['main']['pressure'],
        'wind_speed': weather_data['wind']['speed'],
        'visibility': weather_data.get('visibility', 0) / 1000,  # Convert to km
        'sunrise': datetime.fromtimestamp(weather_data['sys']['sunrise']).strftime('%H:%M'),
        'sunset': datetime.fromtimestamp(weather_data['sys']['sunset']).strftime('%H:%M'),
        'lat': weather_data['coord']['lat'],
        'lon': weather_data['coord']['lon'],
        'unit_symbol': unit_symbol
    }

def process_forecast_data(forecast_data, units='metric'):
    """Process raw forecast data into a more usable format"""
    if not forecast_data:
        return None
        
    # Determine unit symbol
    unit_symbol = '°C' if units == 'metric' else '°F'
        
    # Get daily forecasts (every 8th item = 1 day at 12:00 PM)
    daily_forecasts = forecast_data['list'][::8][:7]  # 7 days
    
    processed_forecasts = []
    for forecast in daily_forecasts:
        processed_forecasts.append({
            'date': datetime.fromtimestamp(forecast['dt']).strftime('%A'),
            'date_short': datetime.fromtimestamp(forecast['dt']).strftime('%b %d'),
            'temperature': round(forecast['main']['temp']),
            'temp_min': round(forecast['main']['temp_min']),
            'temp_max': round(forecast['main']['temp_max']),
            'description': forecast['weather'][0]['description'].title(),
            'humidity': forecast['main']['humidity'],
            'icon': forecast['weather'][0]['icon'],
            'unit_symbol': unit_symbol
        })
        
    return processed_forecasts

def process_hourly_forecast(forecast_data, units='metric'):
    """Process hourly forecast data (next 12 hours)"""
    if not forecast_data:
        return None
        
    # Determine unit symbol
    unit_symbol = '°C' if units == 'metric' else '°F'
        
    # Get next 12 hours (4 forecast items = 12 hours with 3-hour intervals)
    hourly_forecasts = forecast_data['list'][:4]  # Next 12 hours
    
    processed_hourly = []
    for forecast in hourly_forecasts:
        processed_hourly.append({
            'time': datetime.fromtimestamp(forecast['dt']).strftime('%H:%M'),
            'hour': datetime.fromtimestamp(forecast['dt']).strftime('%I %p'),
            'temperature': round(forecast['main']['temp']),
            'description': forecast['weather'][0]['description'].title(),
            'icon': forecast['weather'][0]['icon'],
            'unit_symbol': unit_symbol,
            'wind_speed': forecast['wind']['speed'],
            'humidity': forecast['main']['humidity']
        })
        
    return processed_hourly

def process_air_quality_data(aqi_data):
    """Process air quality data into a more usable format"""
    if not aqi_data or not aqi_data.get('list'):
        return None
        
    aqi = aqi_data['list'][0]['main']['aqi']
    
    # Convert AQI number to description
    aqi_descriptions = {
        1: 'Good',
        2: 'Fair',
        3: 'Moderate',
        4: 'Poor',
        5: 'Very Poor'
    }
    
    return {
        'aqi': aqi,
        'description': aqi_descriptions.get(aqi, 'Unknown'),
        'components': aqi_data['list'][0]['components']
    }

@app.route('/')
def index():
    return render_template('index.html', default_city='Dhaka')

@app.route('/weather')
def weather():
    city = request.args.get('city', 'Dhaka')
    units = request.args.get('units', 'metric')  # metric for Celsius, imperial for Fahrenheit
    
    # Get weather data
    weather_data = get_weather_data(city, units)
    if not weather_data:
        return jsonify({'error': 'Could not fetch weather data'}), 404
        
    # Get forecast data
    forecast_data = get_forecast_data(city, units)
    
    # Get air quality data
    air_quality_data = get_air_quality_data(weather_data['coord']['lat'], weather_data['coord']['lon'])
    
    # Process data
    processed_weather = process_weather_data(weather_data, units)
    processed_forecast = process_forecast_data(forecast_data, units)
    processed_hourly = process_hourly_forecast(forecast_data, units)
    processed_air_quality = process_air_quality_data(air_quality_data)
    
    return jsonify({
        'current': processed_weather,
        'forecast': processed_forecast,
        'hourly': processed_hourly,
        'air_quality': processed_air_quality
    })

# API endpoint to get favorite cities weather
@app.route('/favorites')
def favorites():
    cities = request.args.get('cities', '')
    units = request.args.get('units', 'metric')
    
    if not cities:
        return jsonify({'favorites': []})
    
    city_list = cities.split(',')
    favorite_data = []
    
    for city in city_list:
        city = city.strip()
        if city:
            weather_data = get_weather_data(city, units)
            if weather_data:
                processed_data = process_weather_data(weather_data, units)
                if processed_data:
                    favorite_data.append(processed_data)
    
    return jsonify({'favorites': favorite_data})

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
        
    app.run(debug=True, host='0.0.0.0', port=5000)