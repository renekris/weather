/* eslint-disable no-console */
const url = 'https://api.openweathermap.org/data/2.5/forecast';
// not concealing the api key, since it's free
const apiKey = '285f541ba6b93f37872dfd16ad3edb20';

async function fetchData(thisUrl) {
  const response = await fetch(thisUrl, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const locationData = await response.json();
  return locationData;
}

function formatData(locationData) {
  return {
    city: {
      coords: locationData.city.coord,
      country: locationData.city.country,
      name: locationData.city.name,
    },
    list: locationData.list,
  }
}

export async function getLocationWeatherData(lat, lon) {
  const thisUrl = `${url}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const locationData = await fetchData(thisUrl);
  return formatData(locationData);
}

export async function getNamedLocationWeatherData(location) {
  const thisUrl = `${url}?q=${location}&appid=${apiKey}`;
  const locationData = await fetchData(thisUrl);
  return formatData(locationData);
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

export async function getCurrentLocationWeatherData() {
  const currentPosition = await getCurrentCoordinates();
  console.log(currentPosition);
  const locationData = await getLocationWeatherData(currentPosition.lat, currentPosition.lon);
  return formatData(locationData);
}


