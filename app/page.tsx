"use client";

import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState("");

  // 🔴 YAHAN APNI NEW API KEY DAALO (quotes ke andar)
  const API_KEY = "4e7fc85b34cfa0c580c2e8aed14b4b9c";

  const getWeather = async () => {
    if (!city) {
      setError("Please enter a city name");
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();

      if (data.cod !== 200) {
        setError("City not found");
        setWeather(null);
        return;
      }

      setWeather(data);
      setError("");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">

        {/* TITLE */}
        <h1 className="text-5xl font-extrabold">SKYTRACK 🌤️</h1>
        <p className="mt-2 text-blue-100">Live Weather Finder</p>

        {/* SEARCH */}
        <div className="mt-10 flex w-full max-w-xl flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Enter city (e.g. Pune, Mumbai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/20 px-5 py-4 text-white placeholder:text-blue-100 outline-none"
          />
          <button
            onClick={getWeather}
            className="rounded-2xl bg-white px-6 py-4 font-semibold text-blue-700"
          >
            Search
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <p className="mt-4 text-red-200">{error}</p>
        )}

        {/* RESULT */}
        {weather && (
          <div className="mt-10 rounded-3xl bg-white/20 p-8 backdrop-blur shadow-lg">

            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold">{weather.name}</h2>

              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="weather icon"
              />

              <p className="text-4xl font-semibold">
                {weather.main.temp}°C
              </p>
            </div>

            <div className="mt-6 space-y-2 text-lg">
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Wind: {weather.wind.speed} km/h</p>
              <p>Condition: {weather.weather[0].main}</p>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}