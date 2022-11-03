import { format } from 'date-fns';
import initMap from './map-api';
import { getCurrentLocationWeatherData, getNamedLocationWeatherData } from './weather-api';
import loadingSvg from '../svg/loading.svg';

// DOM CACHE
const elToggleFormat = document.getElementById('toggle-format');
const elForm = document.getElementById('search');
const elForecastCity = Array.from(document.getElementsByClassName('forecast-city'))[0];
const elForecastCurrent = Array.from(document.getElementsByClassName('forecast-current'))[0];
const elForecastDays = Array.from(document.getElementsByClassName('forecast-days'))[0];
const elForecastNote = Array.from(document.getElementsByClassName('note'))[0];
const elLoading = document.getElementById('loading');

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

const elImg = elLoading.appendChild(document.createElement('img'));
elImg.src = loadingSvg;

function displayCity() {
  elForecastCity.innerHTML = '';

  const elCityCountry = elForecastCity.appendChild(document.createElement('p'));
  elCityCountry.textContent = regionNames.of(activeLocationData.city.country);

  const elCityName = elForecastCity.appendChild(document.createElement('p'));
  elCityName.textContent = activeLocationData.city.name;

  if (activeLocationData.city.coords) {
    const elCityCoords = elForecastCity.appendChild(document.createElement('p'));
    elCityCoords.textContent = `Lat: ${activeLocationData.city.coords.lat} Lon: ${activeLocationData.city.coords.lon}`;
  }

  const elMapDiv = elForecastCity.appendChild(document.createElement('div'));
  elMapDiv.id = 'map';

  initMap(activeLocationData.city.coords.lat, activeLocationData.city.coords.lon);
}

function displayCurrent() {
  elForecastCurrent.innerHTML = '';
  const todayData = activeLocationData.sortedByDate[0].list[0];

  const elDate = elForecastCurrent.appendChild(document.createElement('p'));
  elDate.textContent = format(new Date(todayData.dt * 1000), 'cccc do');

  const elIcon = elForecastCurrent.appendChild(document.createElement('img'));
  elIcon.src = getWeatherIconUrl(todayData.weather[0].icon, '4x');
  elIcon.alt = todayData.weather[0].description;
  elIcon.title = todayData.weather[0].description;

  const elTime = elForecastCurrent.appendChild(document.createElement('p'));
  elTime.textContent = format(new Date(todayData.dt * 1000), 'HH:mm');

  const elTemp = elForecastCurrent.appendChild(document.createElement('p'));
  elTemp.textContent = `Temp: ${returnCurrentUnitTemp(todayData.main.temp)}`;

  const elFeelsLike = elForecastCurrent.appendChild(document.createElement('p'));
  elFeelsLike.textContent = `Feels like: ${returnCurrentUnitTemp(todayData.main.feels_like)}`;
}

function getWeatherIconUrl(weatherIconName, size = '2x') {
  // https://openweathermap.org/weather-conditions | http://openweathermap.org/img/wn/10d@2x.png
  const mainUrl = 'https://openweathermap.org/img/wn/';
  return `${mainUrl}${weatherIconName}@${size}.png`
}

function displayDayMini(dateListObj) {

  const elCard = elForecastDays.appendChild(document.createElement('div'));
  elCard.classList.add('forecast-card');

  const elDate = elCard.appendChild(document.createElement('p'));
  elDate.textContent = format(new Date(dateListObj.list[0].dt * 1000), 'cccc do');
  elDate.classList.add('forecast-card-date');

  for (let i = 0; i < dateListObj.list.length; i += 1) {
    const threeHourData = dateListObj.list[i];

    const elCardItem = elCard.appendChild(document.createElement('div'));
    elCardItem.classList.add('forecast-card-item');

    const elIcon = elCardItem.appendChild(document.createElement('img'));
    elIcon.src = getWeatherIconUrl(threeHourData.weather[0].icon);
    elIcon.alt = threeHourData.weather[0].description;
    elIcon.title = threeHourData.weather[0].description;

    const elTimeTempDiv = elCardItem.appendChild(document.createElement('div'));
    elTimeTempDiv.classList.add('time-temperature');

    const elTime = elTimeTempDiv.appendChild(document.createElement('p'));
    elTime.textContent = `${format(new Date(threeHourData.dt * 1000), 'HH:mm')}`;
    elTime.classList.add('card-time');

    const elTemp = elTimeTempDiv.appendChild(document.createElement('p'));
    elTemp.textContent = `${returnCurrentUnitTemp(threeHourData.main.temp)}`;
    elTemp.classList.add('card-temp');
  }
}

function displayDays() {
  elForecastDays.innerHTML = '';
  for (let i = 1; i < activeLocationData.sortedByDate.length; i += 1) {
    const dateListObj = activeLocationData.sortedByDate[i];
    displayDayMini(dateListObj);
  }
}

function displayNote() {
  elForecastNote.innerHTML = '';
  const elNotePara = elForecastNote.appendChild(document.createElement('p'));
  elNotePara.textContent = 'Due to the limitations of the free API, I cannot extract more specific data in a more accurate state.';
  elNotePara.classList.add('note');
}

function reloadDisplayData() {
  startLoading();
  displayCity();
  displayCurrent();
  displayDays();
  displayNote();
  finishLoading();
}

function reloadFormat() {
  displayCurrent();
  displayDays();
}

function startLoading() {
  elLoading.classList.add('shown');
}

function finishLoading() {
  elLoading.classList.remove('shown');
}

function toggleFormat() {
  isFormatCelsius = !isFormatCelsius;
  console.log(`isFormatCelsius: ${isFormatCelsius}`);
  reloadFormat();
}

async function searchCity(e) {
  e.preventDefault();
  startLoading();
  setActiveLocationData(await getNamedLocationWeatherData(e.target.search.value));
  reloadDisplayData();
}

export default async function initDisplay() {
  startLoading();
  const currentLocationWeatherData = await getCurrentLocationWeatherData();

  // has user declined location opt-in
  if (currentLocationWeatherData === null) {
    setActiveLocationData(await getNamedLocationWeatherData(elForm.search.value));
  } else {
    setActiveLocationData(currentLocationWeatherData);
  }
  reloadDisplayData();
}
