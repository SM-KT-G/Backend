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
 * 경로 옵션별 summary 인터페이스
 */
export interface RouteSummary {
  distance: number; // 미터(m)
  duration: number; // 밀리초(ms)
  tollFare?: number; // 통행료
  taxiFare?: number; // 택시 요금
  fuelPrice?: number; // 유류비
}

/**
 * 경로 옵션 인터페이스
 */
export interface RouteOption {
  summary: RouteSummary;
  path?: number[][]; // 경로 좌표 배열 (선택적)
}

/**
 * 네이버 맵 (NCP) Directions 5 API 원본 응답 인터페이스
 */
export interface NcpDirectionsApiResponse {
  code: number; // API 응답 코드 (0이 성공)
  message: string;
  route?: {
    traoptimal?: RouteOption[]; // 최적 경로 (추천)
    trafast?: RouteOption[]; // 빠른 경로
    traavoid?: RouteOption[]; // 무료 경로 (톨게이트 회피)
  };
}