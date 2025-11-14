/**
 * 서비스가 프론트엔드에 제공할 가공된 날씨 정보 (최종 반환 타입)
 */
export interface WeatherInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

/**
 * OpenWeatherMap API 원본 응답 인터페이스
 */
export interface OpenWeatherApiResponse {
  weather: {
    description: string;
    icon: string;
  }[]; // 날씨 정보가 배열로 올 수 있음
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
}