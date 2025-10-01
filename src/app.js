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
    dailyForecast.innerHTML = "";

    const hourlyForecast = document.getElementById("hourly-forecast");
    if (!hourlyForecast) return;
    hourlyForecast.innerHTML = "";

    //days forecast
    const daysMap = {};
    data.list.forEach(item => {
      const key = item.dt_txt.slice(0, 10); // YYYY-MM-DD
      const hour = item.dt_txt.slice(11, 13);// HH

      if (hour == "18") {
        daysMap[key] = item;
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
        <div class="card text-center p-2 flex-shrink-0" style="min-width: 120px;">
          <h6 class="fw-bold">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h6>
          <i class="wi ${iconClass} display-1 my-2"></i>
            <div class="mt-2">
              <div>🌡️ ${Math.round(day.main.temp)} °C</div>
              <div>💨 ${Math.round(day.wind.speed)} km/h</div>
              <div>💧 ${day.main.humidity}%</div>
            </div>
        </div>
      `;

      dailyForecast.appendChild(col);
    });

    //hours forecast

    const hoursMap = {};
      data.list.forEach(item => {
      const key = item.dt_txt;
      hoursMap[key] = item;
    });
    const hoursKeys = Object.keys(hoursMap).slice(0, 8); // 24 prochaines heures

     hoursKeys.forEach(key => {
      const hour = hoursMap[key];

      const date = new Date(hour.dt * 1000);
      const iconClass = iconMap[hour.weather[0].icon] || "wi-na";

      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-3";
      col.innerHTML = `
          <div class="card text-center p-2 flex-shrink-0" style="min-width: 120px;">
            <h6 class="fw-bold">${date.getHours()} H</h6>
            <i class="wi ${iconClass} display-1 my-2"></i>
            <div class="mt-2">
              <div>🌡️ ${Math.round(hour.main.temp)} °C</div>
              <div>💨 ${Math.round(hour.wind.speed)} km/h</div>
              <div>💧 ${hour.main.humidity}%</div>
            </div>
          </div>
      `;

      hourlyForecast.appendChild(col);
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
    getDailyCityWeather(cityName);
}

async function getCityWeather(city) {
  try {
    const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+apiKey);
    if (!response.ok) {
      alert("Veuillez renseigner un nom de ville valide");
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

async function getDailyCityWeather(city) {
  try {                         
    const response = await fetch("https://api.openweathermap.org/data/2.5/forecast?q="+city+"&units=metric&appid="+apiKey);
    if (!response.ok) {
      throw new Error("Problème avec l'API");
    }
    const data = await response.json();

    const dailyForecast = document.getElementById("daily-forecast");
    if (!dailyForecast) return;
    dailyForecast.innerHTML = "";

    const hourlyForecast = document.getElementById("hourly-forecast");
    if (!hourlyForecast) return;
    hourlyForecast.innerHTML = "";

    // days forecast
   const daysMap = {};
    data.list.forEach(item => {
      const key = item.dt_txt.slice(0, 10); // YYYY-MM-DD
      const hour = item.dt_txt.slice(11, 13);

      if (hour == "18") {
        daysMap[key] = item;
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
        <div class="card text-center p-2 flex-shrink-0" style="min-width: 120px;">
          <h6 class="fw-bold">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h6>
          <i class="wi ${iconClass} display-1 my-2"></i>
            <div class="mt-2">
              <div>🌡️ ${Math.round(day.main.temp)} °C</div>
              <div>💨 ${Math.round(day.wind.speed)} km/h</div>
              <div>💧 ${day.main.humidity}%</div>
            </div>
        </div>
      `;

      dailyForecast.appendChild(col);
    });

    //hours forecast

    const hoursMap = {};
      data.list.forEach(item => {
      const key = item.dt_txt;
      hoursMap[key] = item;
    });
    const hoursKeys = Object.keys(hoursMap).slice(0, 8); // 24 prochaines heures

     hoursKeys.forEach(key => {
      const hour = hoursMap[key];

      const date = new Date(hour.dt * 1000);
      const iconClass = iconMap[hour.weather[0].icon] || "wi-na";

      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-3";
      col.innerHTML = `
          <div class="card text-center p-2 flex-shrink-0" style="min-width: 120px;">
            <h6 class="fw-bold">${date.getHours()} H</h6>
            <i class="wi ${iconClass} display-1 my-2"></i>
            <div class="mt-2">
              <div>🌡️ ${Math.round(hour.main.temp)} °C</div>
              <div>💨 ${Math.round(hour.wind.speed)} km/h</div>
              <div>💧 ${hour.main.humidity}%</div>
            </div>
          </div>
      `;

      hourlyForecast.appendChild(col);
    });

  } catch (error) {
    console.error("Erreur :", error);
  }
}

// On passe la fonction au listener
form.addEventListener("submit", handleFormSubmit);




