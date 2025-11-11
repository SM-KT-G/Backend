import axios from "axios";
import { WeatherInfo, OpenWeatherApiResponse } from "../types/weather.types";
// ... (CacheEntry, CACHE_TTL, OPENWEATHER_API_URL) ...

class WeatherService {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * (JSDoc...)
   */
  async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    // ... (이전 단계와 동일한 로직) ...
  }
}

// [변경] 클래스 자체 대신 싱글톤 인스턴스를 export
export default new WeatherService();