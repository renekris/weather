import { getCurrentLocationWeatherData, getNamedLocationWeatherData } from './weather-api';

// DOM CACHE
const elToggleFormat = document.getElementById('toggle-format');
const elForm = document.getElementById('search');
const elForecastCity = Array.from(document.getElementsByClassName('forecast-city'))[0];
const elForecastCurrent = Array.from(document.getElementsByClassName('forecast-current'))[0]
const elForecastDays = Array.from(document.getElementsByClassName('forecast-days'))[0];

// EVENT LISTENERS
elForm.addEventListener('submit', searchCity);
elToggleFormat.addEventListener('click', () => toggleFormat());

// credit: https://bobbyhadz.com/blog/javascript-get-country-name-from-country-code
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

let activeLocationData;
let isFormatCelsius = true;

function setActiveLocationData(locationData) {
  activeLocationData = locationData;
  console.log(activeLocationData);
}

const toCelsius = (value) => value - 273.15;
const toFahrenheit = (value) => (value - 273.15) * (9 / 5) + 32;

function returnCurrentUnitTemp(kelvin) {
  let temp;
  isFormatCelsius
    ? temp = `${toCelsius(kelvin).toFixed(2)}°C`
    : temp = `${toFahrenheit(kelvin).toFixed(2)}°F`;
  return temp;
}

function displayCity() {
  elForecastCity.innerHTML = '';

  const elCityName = elForecastCity.appendChild(document.createElement('p'));
  elCityName.textContent = activeLocationData.city.name;

  const elCityCountry = elForecastCity.appendChild(document.createElement('p'));
  elCityCountry.textContent = regionNames.of(activeLocationData.city.country);

  if (activeLocationData.city.coords) {
    const elCityCoords = elForecastCity.appendChild(document.createElement('p'));
    elCityCoords.textContent =
      `Lat: ${activeLocationData.city.coords.lat}
       Lon: ${activeLocationData.city.coords.lon}`;
  }
}

function displayCurrent() {
  elForecastCurrent.innerHTML = '';
  const CURRENT_DATA_PATH = activeLocationData.list[0];

  const elDate = elForecastCurrent.appendChild(document.createElement('p'));
  elDate.textContent = new Date(CURRENT_DATA_PATH.dt * 1000);

  const elTemp = elForecastCurrent.appendChild(document.createElement('p'));
  elTemp.textContent = `Temp: ${returnCurrentUnitTemp(CURRENT_DATA_PATH.main.temp)}`;

  const elFeelsLike = elForecastCurrent.appendChild(document.createElement('p'));
  elFeelsLike.textContent = `Feels like: ${returnCurrentUnitTemp(CURRENT_DATA_PATH.main.feels_like)}`;
}

function getWeatherIconUrl(weatherIconName) {
  const mainUrl = 'https://openweathermap.org/img/wn/';
  return `${mainUrl}${weatherIconName}@2x.png`
}

function displayDayMini(locationData) {
  const elCard = elForecastDays.appendChild(document.createElement('div'));
  elCard.classList.add('forecast-card');

  const elDate = elCard.appendChild(document.createElement('p'));
  elDate.textContent = new Date(locationData.dt * 1000);

  const elIcon = elCard.appendChild(document.createElement('img'));
  // https://openweathermap.org/weather-conditions | http://openweathermap.org/img/wn/10d@2x.png
  elIcon.src = getWeatherIconUrl(locationData.weather[0].icon);
  elIcon.alt = locationData.weather[0].description;

  const elTemp = elCard.appendChild(document.createElement('p'));
  elTemp.textContent = `${returnCurrentUnitTemp(locationData.main.temp)}`;
}

function displayDays() {
  elForecastDays.innerHTML = '';
  const ELEMENTS_PER_DAY = 8
  for (let i = 0; i < activeLocationData.list.length; i += ELEMENTS_PER_DAY) {
    const element = activeLocationData.list[i];
    displayDayMini(element);
  }
}

function reloadDisplayData() {
  displayCity();
  displayCurrent();
  displayDays();
}

function toggleFormat() {
  isFormatCelsius = !isFormatCelsius;
  console.log(`isFormatCelsius: ${isFormatCelsius}`);
  reloadDisplayData();
}

async function searchCity(e) {
  e.preventDefault();
  setActiveLocationData(await getNamedLocationWeatherData(e.target.search.value));
  reloadDisplayData();
}

export default async function initDisplay() {
  setActiveLocationData(await getCurrentLocationWeatherData());
  reloadDisplayData();
}
