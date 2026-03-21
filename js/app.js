const loader = document.getElementById("loader");
const rainContainer = document.getElementById("rainContainer");
const windContainer = document.getElementById("windContainer");
const sparkleContainer = document.getElementById("sparkleContainer");
const dayNightOverlay = document.getElementById("dayNightOverlay");
const streakEl = document.getElementById("streak");

let streak = Number(localStorage.getItem("streak") || 0);
streakEl.innerText = streak;

// ===================== WEATHER ANIMATIONS =====================
function createRain(num) {
  rainContainer.innerHTML = "";
  for (let i = 0; i < num; i++) {
    let drop = document.createElement("div");
    drop.className = "rain-drop";
    drop.style.left = Math.random() * 100 + "%";
    drop.style.animationDuration = 0.5 + Math.random() + "s";
    drop.style.animationDelay = Math.random() + "s";
    rainContainer.appendChild(drop);
  }
}

function createWind(num) {
  windContainer.innerHTML = "";
  for (let i = 0; i < num; i++) {
    let line = document.createElement("div");
    line.className = "wind-line";
    line.style.top = Math.random() * 100 + "%";
    line.style.animationDuration = 5 + Math.random() * 5 + "s";
    windContainer.appendChild(line);
  }
}

function createSparkles(num) {
  sparkleContainer.innerHTML = "";
  for (let i = 0; i < num; i++) {
    let s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDuration = 3 + Math.random() * 3 + "s";
    sparkleContainer.appendChild(s);
  }
}

// ===================== BACKGROUND IMAGE =====================
async function setCityBackground(city) {
  try {
    const res = await fetch(`https://source.unsplash.com/1600x900/?${city}`);
    document.body.style.backgroundImage = `url(${res.url})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  } catch (e) {
    document.body.style.background =
      "linear-gradient(to bottom,#6a11cb,#2575fc)";
  }
}

// ===================== DAY/NIGHT OVERLAY =====================
function updateDayNight(hour) {
  if (hour >= 6 && hour < 18) {
    dayNightOverlay.style.background = "rgba(0,0,0,0.1)"; // day
  } else {
    dayNightOverlay.style.background = "rgba(0,0,0,0.35)"; // night
  }
}

// ===================== WEATHER FETCH =====================
async function getWeatherByCoords(lat, lon, name = "Your Location") {
  loader.style.display = "block";
  rainContainer.innerHTML = "";
  windContainer.innerHTML = "";
  sparkleContainer.innerHTML = "";

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode`,
  );
  const data = await res.json();
  const weather = data.current_weather;
  const daily = data.daily;

  document.getElementById("cityName").innerText = name;
  document.getElementById("temp").innerText = weather.temperature + "°C";
  document.getElementById("wind").innerText = weather.windspeed + " km/h";
  document.getElementById("feels").innerText = weather.temperature + "°C";

  // Update streak
  streak++;
  localStorage.setItem("streak", streak);
  streakEl.innerText = streak;

  // Update animations
  document.body.className = "";
  let condition = "";
  if (weather.weathercode < 3) {
    condition = "Sunny ☀️";
    createSparkles(30);
  } else if (weather.weathercode < 60) {
    condition = "Cloudy ☁️";
    createSparkles(10);
  } else {
    condition = "Rainy 🌧️";
    createRain(50);
    createWind(15);
  }
  document.getElementById("condition").innerText = condition;

  // Day/night overlay
  const now = new Date();
  updateDayNight(now.getHours());

  // Forecast cards
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";
  for (let i = 0; i < daily.time.length; i++) {
    let card = document.createElement("div");
    card.className = "forecast-card";
    let date = daily.time[i].slice(5);
    let max = daily.temperature_2m_max[i];
    let min = daily.temperature_2m_min[i];
    card.innerHTML = `<div class="front"><strong>${date}</strong><br>${max}°/${min}°</div>
                    <div class="back">Fun fact: ${name} might feel ${Math.round((max + min) / 2)}° today!</div>`;
    card.style.perspective = "1000px";
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
    forecastEl.appendChild(card);
  }

  loader.style.display = "none";
}

// ===================== CITY SEARCH =====================
async function searchCity() {
  const city = document.getElementById("cityInput").value;
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
  );
  const geoData = await geoRes.json();
  if (!geoData.results) {
    alert("City not found");
    return;
  }
  const { latitude, longitude, name } = geoData.results[0];
  setCityBackground(city);
  getWeatherByCoords(latitude, longitude, name);
}

// ===================== GEO LOCATION =====================
navigator.geolocation.getCurrentPosition(
  (pos) => {
    getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    setCityBackground("your location");
  },
  () => {
    document.getElementById("cityName").innerText = "Location denied";
  },
);

window.addEventListener("scroll", () => {
  document.body.style.filter =
    window.scrollY > 200 ? "brightness(0.95)" : "brightness(1)";
});
