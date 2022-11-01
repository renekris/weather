/* eslint-disable no-console */
const url = 'https://api.openweathermap.org/data/2.5/weather';
// not concealing the api key, since it's free
const apiKey = '285f541ba6b93f37872dfd16ad3edb20';

async function getLocationWeather(lat, lon) {
  const response = await fetch(`${url}?lat=${lat}&lon=${lon}&appid=${apiKey}`, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const locationData = await response.json();
  return locationData;
}

async function getNamedLocationWeather(location) {
  const response = await fetch(`${url}?q=${location}&appid=${apiKey}`, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const locationData = await response.json();
  return locationData;
}

function getCurrentCoordinatesRaw() {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getCurrentCoordinates() {
  const rawData = await getCurrentCoordinatesRaw();
  return {
    lat: rawData.coords.latitude,
    lon: rawData.coords.longitude,
  }
}

export default async function weatherInit() {
  const currentPosition = await getCurrentCoordinates();
  console.log(currentPosition);
  const locationData = await getLocationWeather(currentPosition.lat, currentPosition.lon);
  console.log(locationData);
}
