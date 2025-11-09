// src/types/weather.types.ts

/**
 * OpenWeatherMap API 원본 응답 인터페이스
 */
export interface OpenWeatherApiResponse {
  weather: {
    description: string;
    icon: string;
  }[]; // [수정] 튜플 -> 유연한 배열
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
}