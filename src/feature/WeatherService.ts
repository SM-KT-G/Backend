import axios from "axios";
import { WeatherInfo, OpenWeatherApiResponse } from "../types/weather.types";
// ... (CacheEntry, CACHE_TTL, OPENWEATHER_API_URL) ...

class WeatherService {
  private cache: Map<string, CacheEntry> = new Map();

  async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const now = Date.now();

    // 1. 캐시 확인
    if (this.cache.has(cacheKey)) { /* ... */ }

    console.log(`[Cache] MISS: Fetching new weather data for ${cacheKey}`);

    try {
      const formattedWeather = await this.fetchFromApi(lat, lon);
      
      this.cache.set(cacheKey, {
        timestamp: now,
        data: formattedWeather,
      });

      return formattedWeather;
    } catch (error) {
      // [변경] 헬퍼 메소드가 에러 로깅을 담당하므로, 여기서는 최종 에러만 던짐
      // (이미 로깅된 에러)
      if (axios.isAxiosError(error)) {
        // 이미 fetchFromApi에서 로깅됨
      } else {
        // fetchFromApi에서 발생한 "유효한 날씨 정보" 에러 등
        console.error(`Error in getCurrentWeather: ${error}`);
      }
      throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }
  }

  private async fetchFromApi(lat: number, lon: number): Promise<WeatherInfo> {
    try {
      const response = await axios.get<OpenWeatherApiResponse>(
        OPENWEATHER_API_URL,
        { /* ... */ }
      );

      const { data } = response;
      if (!data.weather || data.weather.length === 0) {
        throw new Error("유효한 날씨 정보를 수신하지 못했습니다.");
      }

      // ... (데이터 가공)
      const formattedWeather: WeatherInfo = { /* ... */ };
      return formattedWeather;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API Error (Weather) : ${error.response?.status}: ${error.message}`
        );
      }
      // 에러를 다시 던져서 getCurrentWeather의 catch 블록에서 처리
      throw error; 
    }
  }
}

export default new WeatherService();