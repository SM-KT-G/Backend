import axios from "axios";

// 프론트엔드와 약속한, 우리가 실제로 사용할 날씨 데이터 형식
export interface WeatherInfo {
  temp: number; // 현재 기온
  feels_like: number; // 체감 기온
  temp_min: number; // 최저 기온
  temp_max: number; // 최고 기온
  description: string; // 날씨 설명 (예: "맑음")
  icon: string; // 날씨 아이콘 ID
}

// OpenWeatherMap API가 반환하는 원본 데이터 중 일부 (타입스크립트의 이점)
interface OpenWeatherApiResponse {
  weather: [
    {
      description: string;
      icon: string;
    }
  ];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
}

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
            appid: process.env.OPENWEATHER_API_KEY, // 환경 변수 사용
            units: "metric", // 섭씨 온도 사용
            lang: "kr", // 한국어 설명
          },
        }
      );

      // API 원본 데이터를 우리가 사용할 WeatherInfo 형태로 가공
      const { data } = response;
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
      // ExchangeRateService와 동일한 에러 핸들링 스타일 적용
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