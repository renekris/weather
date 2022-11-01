/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
import { getCurrentLocationWeatherData, getNamedLocationWeatherData } from './weather-api';

// DOM CACHE
const elForm = document.getElementById('search');
const elForecastCity = Array.from(document.getElementsByClassName('forecast-city'))[0];

// EVENT LISTENERS
elForm.addEventListener('submit', searchCity);

let activeLocationData;

function setActiveLocationData(locationData) {
  activeLocationData = locationData;
  console.log(activeLocationData);
}

// credit: https://bobbyhadz.com/blog/javascript-get-country-name-from-country-code
const regionNames = new Intl.DisplayNames(
  ['en'], { type: 'region' }
);

function displayCity() {
  elForecastCity.innerHTML = '';

  const elCityName = elForecastCity.appendChild(document.createElement('p'));
  elCityName.textContent = activeLocationData.city.name;

  const elCityCountry = elForecastCity.appendChild(document.createElement('p'));
  elCityCountry.textContent = regionNames.of(activeLocationData.city.country);
}

function displayCurrent() {

}

function displayDays() {

}

function reloadDisplayData() {
  displayCity();
  displayCurrent();
  displayDays();
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
