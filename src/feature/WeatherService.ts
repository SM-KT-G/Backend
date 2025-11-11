import axios from "axios";
import { WeatherInfo, OpenWeatherApiResponse } from "../types/weather.types";

interface CacheEntry {
  timestamp: number;
  data: WeatherInfo;
}
const CACHE_TTL = 10 * 60 * 1000; // 10분

const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

class WeatherService {
  // [변경] private static cache -> private cache (인스턴스 속성)
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * (JSDoc...)
   */
  async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const now = Date.now();

    // [변경] WeatherService.cache -> this.cache (인스턴스 캐시 접근)
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
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
          params: { /* ... */ },
        }
      );

      const { data } = response;

      if (!data.weather || data.weather.length === 0) {
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

      // [변경] WeatherService.cache -> this.cache (인스턴스 캐시 저장)
      this.cache.set(cacheKey, {
        timestamp: now,
        data: formattedWeather,
      });

      return formattedWeather;
    } catch (error) {
      if (axios.isAxiosError(error)) { /* ... */ } else { /* ... */ }
      throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }
  }
}

export default WeatherService;