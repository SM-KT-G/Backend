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
      // [변경] API 호출 로직을 private 헬퍼로 분리
      const formattedWeather = await this.fetchFromApi(lat, lon);
      
      // 3. 캐시에 저장
      this.cache.set(cacheKey, {
        timestamp: now,
        data: formattedWeather,
      });

      return formattedWeather;
    } catch (error) {
      // axios 에러는 헬퍼 내부에서 처리되거나, 여기서 잡힘
      console.error(`Unexpected error (Weather): ${error}`);
      throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }
  }

  // [추가] ChatService의 private 메소드 스타일 적용
  /**
   * OpenWeatherMap API에서 데이터를 직접 가져오고 가공합니다.
   */
  private async fetchFromApi(lat: number, lon: number): Promise<WeatherInfo> {
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

      return {
        temp: mainData.temp,
        feels_like: mainData.feels_like,
        temp_min: mainData.temp_min,
        temp_max: mainData.temp_max,
        description: weatherData.description,
        icon: weatherData.icon,
      };
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