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

  static async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const now = Date.now();

    // 1. 캐시 확인
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (now - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache] HIT: Weather data for ${cacheKey}`);
        return entry.data;
      }
    }

    console.log(`[Cache] MISS: Fetching new weather data for ${cacheKey}`);

    try {
      // 2. API 호출
      const response = await axios.get<OpenWeatherApiResponse>(
        OPENWEATHER_API_URL,
        {
          params: { /* ... */ },
        }
      );

      const { data } = response;

      // 3. 검증
      if (!data.weather || data.weather.length === 0) {
        throw new Error("유효한 날씨 정보를 수신하지 못했습니다."); // (간소화)
      }

      const weatherData = data.weather[0];
      const mainData = data.main;

      // 4. 데이터 가공
      const formattedWeather: WeatherInfo = {
        temp: mainData.temp,
        feels_like: mainData.feels_like,
        temp_min: mainData.temp_min,
        temp_max: mainData.temp_max,
        description: weatherData.description,
        icon: weatherData.icon,
      };

      // [추가] 5. 캐시에 저장
      this.cache.set(cacheKey, {
        timestamp: now,
        data: formattedWeather,
      });

      return formattedWeather;
    } catch (error) {
      // (기존 에러 핸들링)
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