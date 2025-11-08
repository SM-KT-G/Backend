import axios from "axios";

class WeatherService {

}

export interface WeatherInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

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
  static async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    try {
      // 내용은 비워둠
    } catch (error) {
      // 내용은 비워둠
    }
  }
const response = await axios.get<OpenWeatherApiResponse>(
        OPENWEATHER_API_URL,
        {
          params: {
            lat: lat,
            lon: lon,
            appid: process.env.OPENWEATHER_API_KEY, 
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