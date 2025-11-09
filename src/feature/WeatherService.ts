// src/feature/WeatherService.ts

import axios from "axios";
// [수정] types 폴더에서 인터페이스 import
import { WeatherInfo, OpenWeatherApiResponse } from "../types/weather.types";

const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

class WeatherService {
  /**
   * 특정 위도와 경도를 기반으로 현재 날씨 정보를 가져옵니다.
   * @param lat 위도
   * @param lon 경도
   * @returns 가공된 날씨 정보(WeatherInfo) Promise 객체
   */
  static async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
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

      // [수정] API 응답 데이터 검증 로직 추가
      if (!data.weather || data.weather.length === 0) {
        // API는 성공(200)했으나, weather 배열이 비어있는 경우
        console.error(
          "API Error (Weather): Received 200 OK but no weather data."
        );
        throw new Error("유효한 날씨 정보를 수신하지 못했습니다.");
      }

      // 검증이 완료되었으므로 안전하게 [0]에 접근
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
      } else {
        // (위에서 던진 `new Error` 포함)
        console.error(`Unexpected error (Weather): ${error}`);
      }
      // 서비스 사용자(컨트롤러 등)에게 일관된 에러 메시지 전달
      throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }
  }
}

export default WeatherService;