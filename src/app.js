const apiKey = "9c8df6cfe7964a0cb5421f997063669d";

//#region icons const
const iconMap = {
  "01d": "wi-day-sunny",
  "01n": "wi-night-clear",
  "02d": "wi-day-cloudy",
  "02n": "wi-night-cloudy",
  "03d": "wi-cloud",
  "03n": "wi-cloud",
  "04d": "wi-cloudy",
  "04n": "wi-cloudy",
  "09d": "wi-showers",
  "09n": "wi-showers",
  "10d": "wi-day-rain",
  "10n": "wi-night-rain",
  "11d": "wi-thunderstorm",
  "11n": "wi-thunderstorm",
  "13d": "wi-snow",
  "13n": "wi-snow",
  "50d": "wi-fog",
  "50n": "wi-fog"
};
//#endregion icons const

// Sélection des éléments
const form = document.getElementById("weatherForm");
const input = document.getElementById("city");
const hourlyForecast = document.getElementById("hourly-forecast");
const dailyForecast = document.getElementById("daily-forecast");

// Sélecteurs météo
const cityNameEl   = document.getElementById("cityName");
const descriptionEl= document.getElementById("description");
const tempEl       = document.getElementById("temp");
const humidityEl   = document.getElementById("humidity");
const windEl       = document.getElementById("wind");
const iconEl       = document.getElementById("weatherIcon");

// Obtenir la position de l'utilisateur
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      getWeatherByCoords(latitude,longitude);
      getDailyWeatherByCoords(latitude,longitude);
    },
    (error) => {
      console.error("Erreur géolocalisation :", error);
    }
  );
} else {
  console.log("Géolocalisation non supportée par ce navigateur");
}

async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("Problème avec l'API");
    const data = await response.json();

    // Conversion température
    const tempCelsius = data.main.temp - 273.15;

    // Remplissage du contenu
    cityNameEl.textContent   = data.name;
    descriptionEl.textContent= data.weather[0].description;
    tempEl.textContent       = tempCelsius.toFixed(1);
    humidityEl.textContent   = data.main.humidity;
    windEl.textContent       = data.wind.speed;

    // Mise à jour de l'icône (on remplace complètement la className)
    iconEl.className = "wi " + iconMap[data.weather[0].icon];

  } catch (err) {
    console.error(err);
  }
}

async function getDailyWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("Problème avec l'API");
    const data = await response.json();

    const dailyForecast = document.getElementById("daily-forecast");
    if (!dailyForecast) return;

    dailyForecast.innerHTML = ""; // on efface le contenu existant

    // Sélectionner l'item le plus proche de midi pour chaque jour
    const daysMap = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const hour = date.getHours();

      if (!daysMap[key]) {
        daysMap[key] = item;
      } else {
        const currentHour = new Date(daysMap[key].dt * 1000).getHours();
        if (Math.abs(hour - 12) < Math.abs(currentHour - 12)) {
          daysMap[key] = item;
        }
      }
    });

    const dayKeys = Object.keys(daysMap).slice(0, 5); // max 5 jours

    dayKeys.forEach(key => {
      const day = daysMap[key];

      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
      const iconClass = iconMap[day.weather[0].icon] || "wi-na";

      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-3";
      col.innerHTML = `
        <div class="card h-100 text-center p-3">
          <h5 class="fw-bold">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h5>
          <i class="wi ${iconClass} display-1 my-2"></i>
          <div>🌡️ ${Math.round(day.main.temp)} °C</div>
          <div>💨 ${Math.round(day.wind.speed)} km/h</div>
          <div>💧 ${day.main.humidity}%</div>
        </div>
      `;

      dailyForecast.appendChild(col);
    });

  } catch (err) {
    console.error(err);
  }
}



// Fonction qui sera appelée quand le formulaire est soumis
function handleFormSubmit(event) {
    event.preventDefault();
    const cityName = input.value.trim(); 
    getCityWeather(cityName);
}

async function getCityWeather(city) {
  try {
    const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+apiKey);
    if (!response.ok) {
      throw new Error("Problème avec l'API");
    }
    const data = await response.json();

    // Conversion température
    const tempCelsius = data.main.temp - 273.15;

    // Remplissage du contenu
    cityNameEl.textContent   = data.name;
    descriptionEl.textContent= data.weather[0].description;
    tempEl.textContent       = tempCelsius.toFixed(1);
    humidityEl.textContent   = data.main.humidity;
    windEl.textContent       = data.wind.speed;

    // Mise à jour de l'icône (on remplace complètement la className)
    iconEl.className = "wi " + iconMap[data.weather[0].icon];

  } catch (error) {
    console.error("Erreur :", error);
  }
}

// On passe la fonction au listener
form.addEventListener("submit", handleFormSubmit);




