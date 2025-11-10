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

    // [추가] 1. 캐시 확인
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      // 10분이 지나지 않았으면 캐시된 데이터 반환
      if (now - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache] HIT: Weather data for ${cacheKey}`);
        return entry.data;
      }
    }

    console.log(`[Cache] MISS: Fetching new weather data for ${cacheKey}`);
    try {
      // (기존 API 호출 로직)
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

      // (기존 검증 로직)
      const { data } = response;
      if (!data.weather || data.weather.length === 0) {
        console.error(
          "API Error (Weather): Received 200 OK but no weather data."
        );
        throw new Error("유효한 날씨 정보를 수신하지 못했습니다.");
      }

      // (기존 가공 로직)
      const weatherData = data.weather[0];
      const mainData = data.main;

      return {
        temp: mainData.temp,
        feels_like: mainData.feels_like,
        temp_min: mainData.temp_min,
        temp_max: mainData.temp_max,
        description: weatherData.description,
        icon: weatherData.icon,
      };
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