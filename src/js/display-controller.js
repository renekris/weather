import { addSeconds, format } from 'date-fns';
import { getCurrentLocationWeatherData, getNamedLocationWeatherData } from './weather-api';
import loadingSvg from '../svg/loading.svg';

// DOM CACHE
const elToggleFormat = document.getElementById('toggle-format');
const elForm = document.getElementById('search');
const elLocationButton = document.getElementById('location-share');
const elForecastCity = Array.from(document.getElementsByClassName('forecast-city'))[0];
const elForecastCurrent = Array.from(document.getElementsByClassName('forecast-current'))[0];
const elForecastDays = Array.from(document.getElementsByClassName('forecast-days'))[0];
const elForecastNote = Array.from(document.getElementsByClassName('note'))[0];
const elLoading = document.getElementById('loading');

// EVENT LISTENERS
elForm.addEventListener('submit', searchCity);
elLocationButton.addEventListener('click', () => initDisplay())
elToggleFormat.addEventListener('click', () => toggleFormat());

// credit: https://bobbyhadz.com/blog/javascript-get-country-name-from-country-code
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

let activeLocationData;
let isFormatCelsius = true;

function clearElement(element) {
  while (element.firstChild) {
    // .remove() also removes the listeners and observers
    element.firstChild.remove();
  }
}

// using public key with a lot of restrictions
async function displayMap(lat, lng) {
  const url = 'https://maps.googleapis.com/maps/api/staticmap';
  const zoom = 7;
  const mapId = 'd4fac8606dc8b109';
  const key = 'AIzaSyBQqW0X5ZTQKZb-iP78WQDLvqMuHTGCEpA';
  const size = '250x250';
  const elMapDiv = elForecastCity.appendChild(document.createElement('div'));
  elMapDiv.id = 'map';
  const image = elMapDiv.appendChild(document.createElement('img'));

  const response = await fetch(`${url}?map_id=${mapId}&center=${lat},${lng}&size=${size}&key=${key}&zoom=${zoom}`, { mode: 'cors' });
  if (response.ok) {
    image.src = response.url;
  }
}

function displayErrorMessage(msg) {
  const elPreExistingMessage = document.querySelector('.error-message');
  if (elPreExistingMessage) {
    elPreExistingMessage.remove();
  }
  const elError = elForm.appendChild(document.createElement('p'));
  elError.textContent = msg;
  elError.classList.add('error-message');
  elError.addEventListener('animationend', (e) => {
    e.target.remove();
  });
}

function setActiveLocationData(locationData) {
  if (locationData === 0) {
    displayErrorMessage('Location not found');
    return false;
  }
  activeLocationData = locationData;
  console.log(activeLocationData);
  return true;
}

const kelvinToCelsius = (kelvin) => kelvin - 273.15;
const kelvinToFahrenheit = (kelvin) => (kelvin - 273.15) * (9 / 5) + 32;

function returnCurrentUnitTemp(kelvin) {
  let temp;
  isFormatCelsius
    ? temp = `${kelvinToCelsius(kelvin).toFixed(2)}??C`
    : temp = `${kelvinToFahrenheit(kelvin).toFixed(2)}??F`;
  return temp;
}

const elImg = elLoading.appendChild(document.createElement('img'));
elImg.src = loadingSvg;

const runningClockIdArray = [];

function writeTime(element, id, stopped) {
  const time = `Local Time: ${addSeconds(Date.now(), activeLocationData.city.timezone).toUTCString().match(/[0-9]+:[0-9]+:[0-9]+/)}`;
  // eslint-disable-next-line no-param-reassign
  element.textContent = time;
  console.log('clock update');
  if (!runningClockIdArray.includes(id)) {
    // eslint-disable-next-line no-param-reassign
    stopped = true;
    console.log('old clock has been stopped');
  }
  createClock(element, id, stopped);
}

function createClock(element, id, stopped) {
  if (stopped === false) {
    setTimeout(() => writeTime(element, id, false), 1000);
  }
};

function displayCity() {
  clearElement(elForecastCity);

  const elCityCountry = elForecastCity.appendChild(document.createElement('p'));
  elCityCountry.textContent = `${regionNames.of(activeLocationData.city.country)}`;
  elCityCountry.classList.add('country-time');
  const elCityName = elForecastCity.appendChild(document.createElement('p'));
  elCityName.textContent = activeLocationData.city.name;

  runningClockIdArray.splice(0, 1);
  const elLocalClock = elForecastCity.appendChild(document.createElement('p'));
  elLocalClock.id = 'local-clock';
  elLocalClock.textContent = `Local Time: ${addSeconds(Date.now(), activeLocationData.city.timezone).toUTCString().match(/[0-9]+:[0-9]+:[0-9]+/)}`;
  const clockId = crypto.randomUUID();
  runningClockIdArray.push(clockId);
  createClock(elLocalClock, clockId, false);

  if (activeLocationData.city.coord) {
    const elCityCoords = elForecastCity.appendChild(document.createElement('p'));
    elCityCoords.textContent = `Lat: ${activeLocationData.city.coord.lat} Lon: ${activeLocationData.city.coord.lon}`;
  }

  displayMap(activeLocationData.city.coord.lat, activeLocationData.city.coord.lon);
}

function displayCurrent() {
  clearElement(elForecastCurrent);

  const elDate = elForecastCurrent.appendChild(document.createElement('p'));
  elDate.classList.add('current-title-date');
  elDate.textContent = format(new Date(
    (activeLocationData.sortedByDate[0].list[0].timeWithTimeZone).getUTCFullYear(),
    (activeLocationData.sortedByDate[0].list[0].timeWithTimeZone).getUTCMonth(),
    (activeLocationData.sortedByDate[0].list[0].timeWithTimeZone).getUTCDate()
  ), 'cccc do');


  const elCurrentDiv = elForecastCurrent.appendChild(document.createElement('div'));
  elCurrentDiv.classList.add('current-div');

  for (let i = 0; i < activeLocationData.sortedByDate[0].list.length; i += 1) {
    const threeHourData = activeLocationData.sortedByDate[0].list[i];

    const elCurrentItemDiv = elCurrentDiv.appendChild(document.createElement('div'));
    elCurrentItemDiv.classList.add('current-div-item');


    const elIcon = elCurrentItemDiv.appendChild(document.createElement('img'));
    elIcon.src = getWeatherIconUrl(threeHourData.weather[0].icon, '4x');
    elIcon.alt = threeHourData.weather[0].description;
    elIcon.title = threeHourData.weather[0].description;

    const elTime = elCurrentItemDiv.appendChild(document.createElement('p'));
    elTime.textContent = `${threeHourData.timeWithTimeZone.getUTCHours()}:00`;

    const elTemp = elCurrentItemDiv.appendChild(document.createElement('p'));
    elTemp.textContent = `Temp: ${returnCurrentUnitTemp(threeHourData.main.temp)}`;

    const elFeelsLike = elCurrentItemDiv.appendChild(document.createElement('p'));
    elFeelsLike.textContent = `Feels: ${returnCurrentUnitTemp(threeHourData.main.feels_like)}`;
  }

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
  elDate.classList.add('forecast-card-date');
  elDate.textContent = format(new Date(
    (dateListObj.list[0].timeWithTimeZone).getUTCFullYear(),
    (dateListObj.list[0].timeWithTimeZone).getUTCMonth(),
    (dateListObj.list[0].timeWithTimeZone).getUTCDate()
  ), 'cccc do');


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
    elTime.textContent = `${threeHourData.timeWithTimeZone.getUTCHours()}:00`;
    elTime.classList.add('card-time');

    const elTemp = elTimeTempDiv.appendChild(document.createElement('p'));
    elTemp.textContent = `${returnCurrentUnitTemp(threeHourData.main.temp)}`;
    elTemp.classList.add('card-temp');
  }
}

function displayDays() {
  clearElement(elForecastDays);
  for (let i = 1; i < activeLocationData.sortedByDate.length; i += 1) {
    const dateListObj = activeLocationData.sortedByDate[i];
    displayDayMini(dateListObj);
  }
}

function displayNote() {
  clearElement(elForecastNote);
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
  const isDataSet = setActiveLocationData(await getNamedLocationWeatherData(e.target.search.value));
  if (isDataSet) {
    reloadDisplayData();
  } else {
    finishLoading();
  }
}

export default async function initDisplay() {
  startLoading();
  const currentLocationWeatherData = await getCurrentLocationWeatherData();
  let isDataSet = false;
  // has user declined location opt-in
  if (currentLocationWeatherData === null) {
    isDataSet = setActiveLocationData(await getNamedLocationWeatherData(elForm.search.value));
    displayErrorMessage('No access to user coordinates');
  } else {
    isDataSet = setActiveLocationData(currentLocationWeatherData);
  }
  if (isDataSet) {
    reloadDisplayData();
  } else {
    finishLoading();
  }
}
