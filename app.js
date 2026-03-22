// FUN FACTS + QUOTES
const facts = [
  "Lightning is hotter than the sun 🌩️",
  "The coldest place is Antarctica ❄️",
  "Wind forms due to pressure differences 🌬️",
];

const quotes = [
  "Sunshine is the best medicine ☀️",
  "Storms make trees take deeper roots 🌳",
  "Every sunset brings a new dawn 🌅",
];

function randomFun() {
  const f = facts[Math.floor(Math.random() * facts.length)];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("fun").innerHTML =
    `<h3>💡 Fun Fact</h3><p>${f}</p><h3>💬 Quote</h3><p>${q}</p>`;
}

// 🌙 DAY/NIGHT SMART CONDITION
function getConditionEmoji(code, isDay) {
  let text = "";

  if (code === 0) text = "Clear";
  else if (code <= 2) text = "Partly Cloudy";
  else if (code === 3) text = "Cloudy";
  else if (code >= 45 && code <= 48) text = "Fog";
  else if (code >= 51 && code <= 67) text = "Rain";
  else if (code >= 71 && code <= 77) text = "Snow";
  else if (code >= 80 && code <= 82) text = "Rain Showers";
  else if (code >= 95) text = "Thunderstorm";
  else text = "Weather";

  // 🌙 NIGHT MODE
  if (!isDay) {
    if (text.includes("Clear")) return "🌙 Clear Night";
    if (text.includes("Cloud")) return "☁️ Cloudy Night";
    if (text.includes("Rain")) return "🌧️ Rainy Night";
    if (text.includes("Fog")) return "🌫️ Foggy Night";
    if (text.includes("Snow")) return "❄️ Snowy Night";
    return text + " 🌙";
  }

  // ☀️ DAY MODE
  return "☀️ " + text;
}

// WEATHER FETCH
async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Enter a city!");

  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
  );
  const g = await geo.json();
  if (!g.results) return alert("City not found");

  const { latitude, longitude, name, country } = g.results[0];

  // 🌆 BACKGROUND IMAGE
  const imgURL = `https://source.unsplash.com/1600x900/?${name}`;
  document.getElementById("weather").style.background =
    `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${imgURL}) center/cover no-repeat`;

  document.getElementById("cityName").innerText = `${name}, ${country}`;

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
  );
  const data = await res.json();

  // 🌡️ WEATHER DATA
  document.getElementById("temp").innerText =
    data.current_weather.temperature + "°C";

  document.getElementById("condition").innerText = getConditionEmoji(
    data.current_weather.weathercode,
    data.current_weather.is_day,
  );

  document.getElementById("wind").innerText =
    data.current_weather.windspeed + " km/h";

  document.getElementById("humidity").innerText = "50%";
  document.getElementById("uv").innerText = "5";
  document.getElementById("visibility").innerText = "Clear";

  // 📊 GRAPH + MAP + EFFECTS
  drawGraph(data.daily.time, data.daily.temperature_2m_max);
  loadMap(latitude, longitude);
  randomFun();
  rainEffect(data.current_weather.weathercode);
  lightningEffect(data.current_weather.weathercode);
}

// 📍 USE MY LOCATION
function useMyLocation() {
  navigator.geolocation.getCurrentPosition((pos) => {
    getWeatherFromCoords(pos.coords.latitude, pos.coords.longitude);
  });
}

// 📍 WEATHER FROM GPS
async function getWeatherFromCoords(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
  );
  const data = await res.json();

  document.getElementById("weather").innerHTML =
    `<h2>Your Location</h2><h1>${data.current_weather.temperature}°C</h1>`;
}

// 🗺️ MAP
function loadMap(lat, lon) {
  const map = L.map("map").setView([lat, lon], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  L.marker([lat, lon]).addTo(map);
}

// 📊 GRAPH
function drawGraph(labels, data) {
  const ctx = document.getElementById("weatherGraph").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels.map((d) =>
        new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
      ),
      datasets: [
        {
          label: "Max Temp °C",
          data: data,
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14,165,233,0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false } },
    },
  });
}

// 🌌 VANTA BACKGROUND
VANTA.CLOUDS({
  el: "#vanta-bg",
  backgroundAlpha: 0.2,
  skyColor: 0x111111,
  cloudColor: 0x555555,
  speed: 0.3,
  mouseControls: true,
  touchControls: true,
});

// 🌧️ RAIN EFFECT
function rainEffect(code) {
  const container = document.getElementById("rain-container");
  container.innerHTML = "";

  if (code >= 60) {
    for (let i = 0; i < 200; i++) {
      const drop = document.createElement("div");
      drop.className = "raindrop";
      drop.style.left = Math.random() * 100 + "%";
      drop.style.animationDuration = 0.5 + Math.random() + "s";
      container.appendChild(drop);
    }
  }
}

// ⚡ LIGHTNING EFFECT
function lightningEffect(code) {
  if (code >= 95) {
    const flash = document.createElement("div");

    flash.style.position = "fixed";
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "white";
    flash.style.opacity = 0;
    flash.style.zIndex = 3;
    flash.style.pointerEvents = "none";

    document.body.appendChild(flash);

    setInterval(() => {
      if (Math.random() < 0.02) {
        flash.style.opacity = 0.5;
        setTimeout(() => {
          flash.style.opacity = 0;
        }, 50);
      }
    }, 100);
  }
}

// 📲 PWA SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
