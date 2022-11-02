import { format } from 'date-fns';
import initMap from './map-api';
import { getCurrentLocationWeatherData, getNamedLocationWeatherData } from './weather-api';

// DOM CACHE
const elToggleFormat = document.getElementById('toggle-format');
const elForm = document.getElementById('search');
const elForecastCity = Array.from(document.getElementsByClassName('forecast-city'))[0];
const elForecastCurrent = Array.from(document.getElementsByClassName('forecast-current'))[0]
const elForecastDays = Array.from(document.getElementsByClassName('forecast-days'))[0];
const elForecastNote = Array.from(document.getElementsByClassName('note'))[0];

// EVENT LISTENERS
elForm.addEventListener('submit', searchCity);
elToggleFormat.addEventListener('click', () => toggleFormat());

// credit: https://bobbyhadz.com/blog/javascript-get-country-name-from-country-code
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

let activeLocationData;
let isFormatCelsius = true;

function setActiveLocationData(locationData) {
  activeLocationData = locationData;
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

  const elCityCountry = elForecastCity.appendChild(document.createElement('p'));
  elCityCountry.textContent = regionNames.of(activeLocationData.city.country);

  const elCityName = elForecastCity.appendChild(document.createElement('p'));
  elCityName.textContent = activeLocationData.city.name;

  if (activeLocationData.city.coords) {
    const elCityLat = elForecastCity.appendChild(document.createElement('p'));
    elCityLat.textContent = `Lat: ${activeLocationData.city.coords.lat}`;
    const elCityLon = elForecastCity.appendChild(document.createElement('p'));
    elCityLon.textContent = `Lon: ${activeLocationData.city.coords.lon}`;
  }

  const elMapDiv = elForecastCity.appendChild(document.createElement('div'));
  elMapDiv.id = 'map';

  initMap(activeLocationData.city.coords.lat, activeLocationData.city.coords.lon);
}

function displayCurrent() {
  elForecastCurrent.innerHTML = '';
  const CURRENT_DATA_PATH = activeLocationData.list[0];

  const elDate = elForecastCurrent.appendChild(document.createElement('p'));
  elDate.textContent = format(new Date(CURRENT_DATA_PATH.dt * 1000), 'cccc do');

  const elIcon = elForecastCurrent.appendChild(document.createElement('img'));
  elIcon.src = getWeatherIconUrl(CURRENT_DATA_PATH.weather[0].icon, '4x');
  elIcon.alt = CURRENT_DATA_PATH.weather[0].description;
  elIcon.title = CURRENT_DATA_PATH.weather[0].description;

  const elTime = elForecastCurrent.appendChild(document.createElement('p'));
  elTime.textContent = format(new Date(CURRENT_DATA_PATH.dt * 1000), 'p');

  const elTemp = elForecastCurrent.appendChild(document.createElement('p'));
  elTemp.textContent = `Temp: ${returnCurrentUnitTemp(CURRENT_DATA_PATH.main.temp)}`;

  const elFeelsLike = elForecastCurrent.appendChild(document.createElement('p'));
  elFeelsLike.textContent = `Feels like: ${returnCurrentUnitTemp(CURRENT_DATA_PATH.main.feels_like)}`;
}

function getWeatherIconUrl(weatherIconName, size = '2x') {
  // https://openweathermap.org/weather-conditions | http://openweathermap.org/img/wn/10d@2x.png
  const mainUrl = 'https://openweathermap.org/img/wn/';
  return `${mainUrl}${weatherIconName}@${size}.png`
}

function displayDayMini(locationData) {
  const elCard = elForecastDays.appendChild(document.createElement('div'));
  elCard.classList.add('forecast-card');

  const elDate = elCard.appendChild(document.createElement('p'));
  elDate.textContent = format(new Date(locationData.dt * 1000), 'cccc do');

  const elIcon = elCard.appendChild(document.createElement('img'));
  elIcon.src = getWeatherIconUrl(locationData.weather[0].icon);
  elIcon.alt = locationData.weather[0].description;
  elIcon.title = locationData.weather[0].description;

  const elTime = elCard.appendChild(document.createElement('p'));
  elTime.textContent = `${format(new Date(locationData.dt * 1000), 'p')}`;
  elTime.classList.add('card-time');

  const elTemp = elCard.appendChild(document.createElement('p'));
  elTemp.textContent = `${returnCurrentUnitTemp(locationData.main.temp)}`;
  elTemp.classList.add('card-temp');
}

function displayDays() {
  elForecastDays.innerHTML = '';
  let skipFirstDayLatch = true;
  const ELEMENTS_PER_DAY = 8
  for (let i = 0; i < activeLocationData.list.length; i += ELEMENTS_PER_DAY) {
    if (skipFirstDayLatch) {
      skipFirstDayLatch = false;
      i += ELEMENTS_PER_DAY;
    }
    const element = activeLocationData.list[i];
    displayDayMini(element);
  }
}

function displayNote() {
  elForecastNote.innerHTML = '';
  const elNotePara = elForecastNote.appendChild(document.createElement('p'));
  elNotePara.textContent = 'Due to the limitations of the free API, I cannot extract more specific data in a more accurate state.';
  elNotePara.classList.add('note');
}

function reloadDisplayData() {
  displayCity();
  displayCurrent();
  displayDays();
  displayNote();
}

// to lessen the google map API queries <3
function reloadFormat() {
  displayCurrent();
  displayDays();
}

function toggleFormat() {
  isFormatCelsius = !isFormatCelsius;
  console.log(`isFormatCelsius: ${isFormatCelsius}`);
  reloadFormat();
}

async function searchCity(e) {
  e.preventDefault();
  setActiveLocationData(await getNamedLocationWeatherData(e.target.search.value));
  reloadDisplayData();
}

export default async function initDisplay() {
  const currentLocationWeatherData = await getCurrentLocationWeatherData();

  // has user declined location opt-in
  if (currentLocationWeatherData === null) {
    setActiveLocationData(await getNamedLocationWeatherData(elForm.search.value));
  } else {
    setActiveLocationData(currentLocationWeatherData);
  }
  reloadDisplayData();
}
