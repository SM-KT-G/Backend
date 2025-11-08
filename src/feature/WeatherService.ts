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