const url = 'https://api.openweathermap.org/data/2.5/forecast';
// not concealing the api key, since it's free
const apiKey = '285f541ba6b93f37872dfd16ad3edb20';

function formatData(locationData, sortedData) {
  return {
    city: locationData.city,
    sortedByDate: sortedData,
  }
}

function sortData(locationData) {
  const filteredByDates = [];

  let activeDate = '';
  for (let i = 0; i < locationData.list.length; i += 1) {
    const threeHourData = locationData.list[i];
    const currentDate = threeHourData.dt_txt.split(' ')[0];
    if (activeDate !== currentDate) {
      activeDate = currentDate;
      const structuredObject = {
        date: activeDate,
        list: [],
      }
      filteredByDates.push(structuredObject);
    }
    const currentFilteredByDateIndex = filteredByDates.length - 1;
    filteredByDates[currentFilteredByDateIndex].list.push(threeHourData);
  }

  return filteredByDates;
}

async function fetchData(thisUrl) {
  const response = await fetch(thisUrl, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const locationData = await response.json();
  const sortedData = sortData(locationData);
  const formattedData = formatData(locationData, sortedData);
  return formattedData;
}

function fetchErrorHandle(error) {
  console.warn(error);
  return 0;
}

export async function getLocationWeatherData(lat, lon) {
  const thisUrl = `${url}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const locationData = await fetchData(thisUrl).catch(fetchErrorHandle);
  return locationData;
}

export async function getNamedLocationWeatherData(location) {
  const thisUrl = `${url}?q=${location}&appid=${apiKey}`;
  const locationData = await fetchData(thisUrl).catch(fetchErrorHandle);
  return locationData;
}

function getCurrentCoordinatesRaw() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getCurrentCoordinates() {
  try {
    const rawData = await getCurrentCoordinatesRaw();
    return {
      lat: rawData.coords.latitude,
      lon: rawData.coords.longitude,
    }
  } catch (error) {
    console.warn(error.message);
    return null;
  }
}

export async function getCurrentLocationWeatherData() {
  const currentPosition = await getCurrentCoordinates();
  if (currentPosition === null) {
    return null;
  }
  const locationData = await getLocationWeatherData(currentPosition.lat, currentPosition.lon);
  return locationData;
}


