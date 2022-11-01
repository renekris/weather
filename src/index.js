import './index.css';
import { getCurrentLocationWeatherData, getNamedLocationWeatherData, getLocationWeatherData } from './js/weather-api';
// import './js/map-api';

(async () => {
  console.log(await getNamedLocationWeatherData('Pirita'));
})();

