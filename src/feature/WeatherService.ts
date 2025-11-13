import axios from "axios";
import { WeatherInfo, OpenWeatherApiResponse } from "../types/weather.types";

/**
 * 캐시된 데이터를 저장하기 위한 인터페이스 (내부용)
 */
interface CacheEntry {
  timestamp: number;
  data: WeatherInfo;
}

// 캐시 유효 시간: 10분
const CACHE_TTL = 10 * 60 * 1000;

const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

class WeatherService {
  /**
   * 인스턴스 속성으로 캐시를 관리합니다.
   */
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 특정 위도와 경도를 기반으로 현재 날씨 정보를 가져옵니다.
   * (결과는 10분 동안 캐시됩니다.)
   * @param lat 위도
   * @param lon 경도
   * @returns 가공된 날씨 정보(WeatherInfo) Promise 객체
   */
  async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    // 1. 캐시 키 생성 (소수점 2자리까지 통일)
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const now = Date.now();

    // 2. 캐시 확인
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (now - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache] HIT: Weather data for ${cacheKey}`);
        return entry.data;
      }
    }

    console.log(`[Cache] MISS: Fetching new weather data for ${cacheKey}`);

    try {
      // 3. API 호출 (private 헬퍼 메소드)
      const formattedWeather = await this.fetchFromApi(lat, lon);

      // 4. 캐시에 저장
      this.cache.set(cacheKey, {
        timestamp: now,
        data: formattedWeather,
      });

      return formattedWeather;
    } catch (error) {
      // 헬퍼 메소드에서 이미 구체적인 에러를 로깅함
      // 여기서는 사용자에게 전달할 최종 에러를 전달
      throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }
  }

  /**
   * (Private) OpenWeatherMap API에서 데이터를 직접 가져오고 가공합니다.
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

      // API 응답 검증
      if (!data.weather || data.weather.length === 0) {
        console.error(
          "API Error (Weather): Received 200 OK but no weather data."
        );
        throw new Error("유효한 날씨 정보를 수신하지 못했습니다.");
      }

      // 데이터 가공
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

// ChatService와 동일하게 싱글톤 인스턴스를 export
export default new WeatherService();