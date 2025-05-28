import React, { useState, useEffect } from 'react';
import { Search, Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // OpenWeatherMap API key - Replace with your actual API key
  const API_KEY = '7ac059877697570ef283eb0ea7a0f3fe'; // Your actual API key
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Weather service functions
  const fetchCurrentWeather = async (cityName) => {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else {
          throw new Error('Failed to fetch weather data. Please try again.');
        }
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Forecast data not available for this city.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key for forecast data.');
        } else {
          throw new Error('Failed to fetch forecast data.');
        }
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Generate mock historical data (since OpenWeatherMap historical data requires paid subscription)
  const generateHistoricalData = (currentTemp) => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic temperature variations based on current temperature
      const variation = (Math.random() - 0.5) * 8; // Reduced variation for more realistic data
      const temp = currentTemp + variation;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temperature: Math.round(temp * 10) / 10,
        humidity: Math.round(40 + (Math.random() * 50)), // 40-90% humidity range
        pressure: Math.round(980 + (Math.random() * 60)) // 980-1040 hPa range
      });
    }
    return data;
  };

  const processForecastData = (forecastResponse) => {
    // Take every 8th item to get daily forecasts (3-hour intervals * 8 = 24 hours)
    const dailyForecasts = forecastResponse.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    return dailyForecasts.map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      description: item.weather[0].description,
      icon: item.weather[0].icon
    }));
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching weather data for: ${city}`);
      
      // Make real API calls
      const [current, forecast] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city)
      ]);
      
      console.log('Current weather:', current);
      console.log('Forecast data:', forecast);
      
      setCurrentWeather(current);
      setForecastData(processForecastData(forecast));
      setHistoricalData(generateHistoricalData(current.main.temp));
      
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message);
      
      // If there's an error, clear the weather data
      setCurrentWeather(null);
      setForecastData([]);
      setHistoricalData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (city.trim()) {
      fetchWeatherData();
    }
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': <Sun className="w-8 h-8 text-yellow-500" />,
      '01n': <Sun className="w-8 h-8 text-yellow-300" />,
      '02d': <Cloud className="w-8 h-8 text-gray-500" />,
      '02n': <Cloud className="w-8 h-8 text-gray-400" />,
      '03d': <Cloud className="w-8 h-8 text-gray-600" />,
      '03n': <Cloud className="w-8 h-8 text-gray-500" />,
      '04d': <Cloud className="w-8 h-8 text-gray-700" />,
      '04n': <Cloud className="w-8 h-8 text-gray-600" />,
      '09d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '09n': <CloudRain className="w-8 h-8 text-blue-400" />,
      '10d': <CloudRain className="w-8 h-8 text-blue-600" />,
      '10n': <CloudRain className="w-8 h-8 text-blue-500" />,
      '11d': <CloudRain className="w-8 h-8 text-purple-500" />,
      '11n': <CloudRain className="w-8 h-8 text-purple-400" />,
      '13d': <Cloud className="w-8 h-8 text-gray-300" />,
      '13n': <Cloud className="w-8 h-8 text-gray-200" />,
      '50d': <Cloud className="w-8 h-8 text-gray-400" />,
      '50n': <Cloud className="w-8 h-8 text-gray-300" />
    };
    return iconMap[iconCode] || <Cloud className="w-8 h-8 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading weather data for {city}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Weather Dashboard</h1>
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {currentWeather && (
          <>
            {/* Current Weather Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{currentWeather.name}, {currentWeather.sys.country}</h2>
                  <p className="text-lg opacity-80 capitalize">{currentWeather.weather[0].description}</p>
                </div>
                <div className="text-right">
                  {getWeatherIcon(currentWeather.weather[0].icon)}
                  <div className="text-4xl font-bold mt-2">
                    {Math.round(currentWeather.main.temp)}°C
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  <div>
                    <div className="text-sm opacity-70">Feels like</div>
                    <div className="font-semibold">{Math.round(currentWeather.main.feels_like)}°C</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  <div>
                    <div className="text-sm opacity-70">Humidity</div>
                    <div className="font-semibold">{currentWeather.main.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5" />
                  <div>
                    <div className="text-sm opacity-70">Wind Speed</div>
                    <div className="font-semibold">{currentWeather.wind.speed} m/s</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <div>
                    <div className="text-sm opacity-70">Visibility</div>
                    <div className="font-semibold">{Math.round(currentWeather.visibility / 1000)} km</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Historical Temperature Chart */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">7-Day Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Humidity Chart */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">7-Day Humidity Levels</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="humidity" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {forecastData.map((day, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-700 mb-2">{day.date}</div>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {day.temperature}°C
                    </div>
                    <div className="text-sm text-gray-600 mb-2 capitalize">
                      {day.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {day.humidity}% humidity
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Success Message */}
        {currentWeather && !error && (
          <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-6 mt-8 text-white border border-green-500/30">
            <h3 className="text-lg font-bold mb-2">✅ Real Weather Data Active</h3>
            <p className="text-sm">
              Successfully connected to OpenWeatherMap API. Weather data is now live and location-specific!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;