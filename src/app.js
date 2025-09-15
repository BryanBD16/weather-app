const apiKey = "9c8df6cfe7964a0cb5421f997063669d";

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


// Sélection des éléments
const form = document.getElementById("weatherForm");
const input = document.getElementById("city");
const results = document.getElementById("results");

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

    const cityName = data.name;
    const tempKelvin = data.main.temp;
    const tempCelsius = tempKelvin - 273.15;
    const description = data.weather[0].description;
    const windSpeed = data.wind.speed;
    const humidity = data.main.humidity;
    const iconCode = data.weather[0].icon;
    const weatherIconClass = iconMap[iconCode];

    results.innerHTML = `
    <h2>Weather in ${cityName}</h2>
    <p><i class="wi ${weatherIconClass}"></i> ${description}</p>
    <p>Temperature : ${tempCelsius.toFixed(1)} °C</p>
    <p>Humidity : ${humidity}%</p>
    <p>Wind : ${windSpeed} m/s</p>
    `;

  } catch (error) {
    console.error("Erreur :", error);
  }
}

// On passe la fonction au listener
form.addEventListener("submit", handleFormSubmit);

