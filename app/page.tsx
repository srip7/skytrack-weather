"use client";

import { useEffect, useMemo, useState } from "react";

type WeatherData = {
  name: string;
  weather: { main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  coord: {
    lat: number;
    lon: number;
  };
  rain?: {
    ["1h"]?: number;
    ["3h"]?: number;
  };
};

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const API_KEY = "4e7fc85b34cfa0c580c2e8aed14b4b9c";

  const getWeatherByCity = async (searchCity: string) => {
    if (!searchCity.trim()) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          searchCity
        )}&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();

      if (data.cod !== 200) {
        setError("City not found. Please try another city.");
        setWeather(null);
        return;
      }

      setWeather(data);
      setCity(data.name);
    } catch (err) {
      setError("Something went wrong while fetching weather data.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();

      if (data.cod !== 200) {
        setError("Unable to fetch weather for your location.");
        setWeather(null);
        return;
      }

      setWeather(data);
      setCity(data.name);
    } catch (err) {
      setError("Unable to detect weather from your current location.");
      setWeather(null);
    } finally {
      setLoading(false);
      setLocating(false);
    }
  };

  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setLocating(false);
        setError("Location access denied. Please search by city name.");
      }
    );
  };

  useEffect(() => {
    detectMyLocation();
  }, []);

  const weatherMain = weather?.weather?.[0]?.main || "";
  const weatherDesc = weather?.weather?.[0]?.description || "";

  const weatherEmoji = useMemo(() => {
    switch (weatherMain.toLowerCase()) {
      case "rain":
      case "drizzle":
        return "🌧️";
      case "thunderstorm":
        return "⛈️";
      case "clouds":
        return "☁️";
      case "clear":
        return "☀️";
      case "snow":
        return "❄️";
      case "mist":
      case "haze":
      case "fog":
        return "🌫️";
      default:
        return "🌤️";
    }
  }, [weatherMain]);

  const bgClass = useMemo(() => {
    switch (weatherMain.toLowerCase()) {
      case "rain":
      case "drizzle":
        return "from-slate-700 via-sky-800 to-indigo-950";
      case "thunderstorm":
        return "from-slate-900 via-purple-950 to-black";
      case "clouds":
        return "from-slate-400 via-slate-600 to-slate-800";
      case "clear":
        return "from-cyan-400 via-sky-600 to-blue-900";
      case "snow":
        return "from-sky-100 via-slate-200 to-slate-500";
      case "mist":
      case "haze":
      case "fog":
        return "from-slate-300 via-slate-500 to-slate-700";
      default:
        return "from-sky-500 via-blue-700 to-indigo-900";
    }
  }, [weatherMain]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const weatherMessage = useMemo(() => {
    switch (weatherMain.toLowerCase()) {
      case "rain":
      case "drizzle":
        return "Rainy conditions are currently affecting the city. Carry an umbrella and expect wet roads.";
      case "clouds":
        return "Cloud cover is present today, bringing a softer sky and reduced sunlight.";
      case "clear":
        return "The weather is clear and sunny, with good visibility across the city.";
      case "thunderstorm":
        return "Thunderstorm activity is present. Stay indoors if possible and remain cautious.";
      case "snow":
        return "Snowfall conditions are present. Dress warmly and travel carefully.";
      case "mist":
      case "haze":
      case "fog":
        return "Visibility may be reduced due to mist or haze. Travel carefully outdoors.";
      default:
        return "Current live weather conditions are displayed below.";
    }
  }, [weatherMain]);

  const meaningMessage = useMemo(() => {
    switch (weatherMain.toLowerCase()) {
      case "rain":
      case "drizzle":
        return "Rain is likely to make outdoor movement less comfortable, so an umbrella or raincoat is recommended.";
      case "clear":
        return "Clear weather usually means stronger sunlight and brighter daytime conditions.";
      case "clouds":
        return "Cloudy weather may feel cooler and bring less direct sunlight.";
      case "thunderstorm":
        return "Thunderstorms can bring lightning, heavy rain, and sudden weather changes.";
      case "snow":
        return "Snow can reduce surface grip and lower temperatures significantly.";
      default:
        return "Use the current conditions to plan your travel, clothing, and outdoor activities.";
    }
  }, [weatherMain]);

  const rainWarning = useMemo(() => {
    if (!weather) return "";

    const main = weatherMain.toLowerCase();
    const rain1h = weather.rain?.["1h"] || 0;
    const rain3h = weather.rain?.["3h"] || 0;

    if (main === "rain" || main === "drizzle") {
      if (rain1h > 2 || rain3h > 5) {
        return "Heavy rain warning: Conditions may worsen. Avoid unnecessary travel if possible.";
      }
      return "Rain alert: Carry an umbrella and be careful on slippery roads.";
    }

    if (main === "thunderstorm") {
      return "Storm warning: Thunderstorm conditions detected. Stay alert and avoid open areas.";
    }

    return "No active rain warning at the moment.";
  }, [weather, weatherMain]);

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${bgClass} px-4 py-6 text-white transition-all duration-500`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col items-center justify-center">
        <div className="w-full rounded-[36px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="text-center">
            <div className="mx-auto inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium tracking-wide">
              Live Weather Intelligence
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              SKYTRACK PRO
            </h1>

            <p className="mx-auto mt-3 max-w-3xl text-sm text-blue-100 md:text-lg">
              Search any city or use your current location to view real-time
              temperature, weather conditions, humidity, wind speed, pressure,
              sunrise, sunset, and rain alerts in a premium app-style interface.
            </p>
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-3 md:flex-row">
            <input
              type="text"
              placeholder="Enter city name (e.g. Pune)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") getWeatherByCity(city);
              }}
              className="w-full rounded-2xl border border-white/30 bg-white/15 px-5 py-4 text-base text-white placeholder:text-blue-100 outline-none backdrop-blur"
            />

            <button
              onClick={() => getWeatherByCity(city)}
              className="rounded-2xl bg-white px-6 py-4 font-semibold text-blue-800 shadow-lg transition hover:scale-[1.02]"
            >
              Search
            </button>

            <button
              onClick={detectMyLocation}
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
            >
              {locating ? "Detecting..." : "Use My Location"}
            </button>
          </div>

          {locating && (
            <p className="mt-5 text-center text-blue-100">
              Detecting your current location...
            </p>
          )}

          {loading && (
            <p className="mt-5 text-center text-blue-100">
              Loading live weather data...
            </p>
          )}

          {error && (
            <p className="mt-5 text-center font-medium text-red-200">{error}</p>
          )}

          {weather && (
            <div className="mt-8">
              <div className="rounded-[30px] bg-white/10 p-6 shadow-xl backdrop-blur-xl">
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-3xl bg-white/10 p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-6xl md:text-7xl">{weatherEmoji}</div>

                      <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                        {weather.name}, {weather.sys.country}
                      </h2>

                      <p className="mt-2 text-base capitalize text-blue-100 md:text-lg">
                        {weatherDesc}
                      </p>

                      <div className="mt-5 flex items-center gap-4">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                          alt="weather icon"
                          className="h-20 w-20"
                        />
                        <p className="text-5xl font-extrabold md:text-6xl">
                          {Math.round(weather.main.temp)}°C
                        </p>
                      </div>

                      <p className="mt-4 max-w-2xl text-sm text-blue-100 md:text-base">
                        {weatherMessage}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/10 p-6">
                    <h3 className="text-lg font-semibold">Rain Warning</h3>
                    <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
                      {rainWarning}
                    </p>

                    <div className="mt-6 border-t border-white/15 pt-6">
                      <h3 className="text-lg font-semibold">Sunrise & Sunset</h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-2xl bg-white/10 p-4">
                          <div className="text-2xl">🌅</div>
                          <p className="mt-2 text-sm text-blue-100">Sunrise</p>
                          <p className="text-xl font-bold">
                            {formatTime(weather.sys.sunrise)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                          <div className="text-2xl">🌇</div>
                          <p className="mt-2 text-sm text-blue-100">Sunset</p>
                          <p className="text-xl font-bold">
                            {formatTime(weather.sys.sunset)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-white/15 p-5 text-center">
                    <div className="text-3xl">💧</div>
                    <h3 className="mt-2 text-lg font-semibold">Humidity</h3>
                    <p className="mt-1 text-2xl font-bold">
                      {weather.main.humidity}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-5 text-center">
                    <div className="text-3xl">🌬️</div>
                    <h3 className="mt-2 text-lg font-semibold">Wind Speed</h3>
                    <p className="mt-1 text-2xl font-bold">
                      {weather.wind.speed} km/h
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-5 text-center">
                    <div className="text-3xl">🌡️</div>
                    <h3 className="mt-2 text-lg font-semibold">Feels Like</h3>
                    <p className="mt-1 text-2xl font-bold">
                      {Math.round(weather.main.feels_like)}°C
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-5 text-center">
                    <div className="text-3xl">📈</div>
                    <h3 className="mt-2 text-lg font-semibold">Pressure</h3>
                    <p className="mt-1 text-2xl font-bold">
                      {weather.main.pressure} hPa
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-5">
                    <h3 className="text-lg font-semibold">What It Means</h3>
                    <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
                      {meaningMessage}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <h3 className="text-lg font-semibold">Live City Summary</h3>
                    <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
                      {weather.name} currently has a temperature of{" "}
                      {Math.round(weather.main.temp)}°C, feels like{" "}
                      {Math.round(weather.main.feels_like)}°C, humidity at{" "}
                      {weather.main.humidity}%, wind speed of{" "}
                      {weather.wind.speed} km/h, and atmospheric pressure of{" "}
                      {weather.main.pressure} hPa.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-white/10 p-5">
                  <h3 className="text-lg font-semibold">Coordinates</h3>
                  <p className="mt-3 text-sm text-blue-100 md:text-base">
                    Latitude: {weather.coord.lat} | Longitude: {weather.coord.lon}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}