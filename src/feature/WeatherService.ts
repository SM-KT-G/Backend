import axios from "axios";
import { WeatherInfo, OpenWeatherApiResponse } from "../types/weather.types";

interface CacheEntry {
  timestamp: number;
  data: WeatherInfo;
}
const CACHE_TTL = 10 * 60 * 1000; // 10분

const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

class WeatherService {
  private static cache: Map<string, CacheEntry> = new Map();

  /**
   * (JSDoc...)
   */
  // [변경] static 제거
  async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const now = Date.now();

    if (WeatherService.cache.has(cacheKey)) { // [변경] this.cache -> WeatherService.cache (임시)
      const entry = WeatherService.cache.get(cacheKey)!; // [변경] this.cache -> WeatherService.cache (임시)
      if (now - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache] HIT: Weather data for ${cacheKey}`);
        return entry.data;
      }
    }

    console.log(`[Cache] MISS: Fetching new weather data for ${cacheKey}`);

    try {
      const response = await axios.get<OpenWeatherApiResponse>(
        OPENWEATHER_API_URL,
        {
          params: {
            lat: lat,
            lon: lon,
            appid: process.env.OPENWEATHER_API_KEY,
            units: "metric",
            lang: "kr",
          },
        }
      );

      const { data } = response;

      if (!data.weather || data.weather.length === 0) {
        console.error(
          "API Error (Weather): Received 200 OK but no weather data."
        );
        throw new Error("유효한 날씨 정보를 수신하지 못했습니다.");
      }

      const weatherData = data.weather[0];
      const mainData = data.main;

      const formattedWeather: WeatherInfo = {
        temp: mainData.temp,
        feels_like: mainData.feels_like,
        temp_min: mainData.temp_min,
        temp_max: mainData.temp_max,
        description: weatherData.description,
        icon: weatherData.icon,
      };

      WeatherService.cache.set(cacheKey, { // [변경] this.cache -> WeatherService.cache (임시)
        timestamp: now,
        data: formattedWeather,
      });

      return formattedWeather;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API Error (Weather) : ${error.response?.status}: ${error.message}`
        );
      } else {
        console.error(`Unexpected error (Weather): ${error}`);
      }
      throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }
  }
}

export default WeatherService;