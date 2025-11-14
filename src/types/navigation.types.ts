/**
 * 위도, 경도 좌표 인터페이스 (공용)
 */
export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * 서비스가 프론트엔드에 제공할 가공된 경로 정보 (최종 반환 타입)
 */
export interface RouteInfo {
  totalDistance: number; // 총 거리 (미터)
  totalDuration: number; // 총 소요 시간 (초)
}

/**
 * 네이버 맵 (NCP) Directions 5 API 원본 응답 인터페이스
 */
export interface NcpDirectionsApiResponse {
  code: number; // API 응답 코드 (0이 성공)
  message: string;
  route: {
    traavoid: {
      summary: {
        distance: number; // 미터(m)
        duration: number; // 밀리초(ms)
      };
    }[]; // 경로가 없을 수 있으므로 배열
  };
}