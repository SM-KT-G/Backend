/**
 * 위도, 경도 좌표 인터페이스
 */
export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * 서비스가 프론트엔드에 제공할 가공된 경로 정보
 */
export interface RouteInfo {
  totalDistance: number; // 총 거리 (미터)
  totalDuration: number; // 총 소요 시간 (초)
}