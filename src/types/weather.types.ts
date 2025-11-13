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

/**
 * 서비스가 프론트엔드에 제공할 가공된 날씨 정보
 */
export interface WeatherInfo {
  temp: number;
  feels_bads: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}