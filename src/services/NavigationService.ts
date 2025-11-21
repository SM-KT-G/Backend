import axios from "axios";
import {
  Coordinates,
  RouteInfo,
  NcpDirectionsApiResponse,
} from "../types/navigation.types";

const NAVER_DIRECTIONS_API_URL =
  "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving";

// 캐시 TTL (밀리초) - 기본 5분
const CACHE_TTL = 5 * 60 * 1000;

// 캐시 데이터 타입
interface CacheEntry {
  data: RouteInfo;
  timestamp: number;
}

class NavigationService {
  // 메모리 캐시 저장소
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 캐시 키 생성 (출발지-도착지 조합)
   */
  private generateCacheKey(origin: Coordinates, destination: Coordinates): string {
    return `${origin.lat},${origin.lon}-${destination.lat},${destination.lon}`;
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  private getFromCache(key: string): RouteInfo | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // TTL 체크
    const now = Date.now();
    if (now - entry.timestamp > CACHE_TTL) {
      // 만료된 캐시 삭제
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 캐시에 데이터 저장
   */
  private saveToCache(key: string, data: RouteInfo): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 출발지에서 도착지까지의 경로 정보를 가져옵니다. (자동차 기준)
   * @param origin 출발지 좌표
   * @param destination 도착지 좌표
   * @returns 가공된 경로 정보(RouteInfo) Promise 객체
   */
  async getDirections(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<RouteInfo> {
    // 1. 캐시 확인
    const cacheKey = this.generateCacheKey(origin, destination);
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedData;
    }

    console.log(`Cache miss for key: ${cacheKey}`);

    // 2. 캐시에 없으면 API 호출
    try {
      const response = await axios.get<NcpDirectionsApiResponse>(
        NAVER_DIRECTIONS_API_URL,
        {
          params: {
            // 네이버 파라미터: start, goal (경도,위도 순서)
            start: `${origin.lon},${origin.lat}`,
            goal: `${destination.lon},${destination.lat}`,
          },
          headers: {
            // 네이버 인증 헤더 (2개)
            "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLIENT_ID,
            "X-NCP-APIGW-API-KEY": process.env.NAVER_CLIENT_SECRET,
          },
        }
      );

      const { data } = response;

      // 1. API 응답 코드가 0(성공)이 아닌 경우
      if (data.code !== 0) {
        console.error(
          `API Error (Navigation): ${data.code} - ${data.message}`
        );
        throw new Error(`경로 API 응답 오류: ${data.message}`);
      }

      // 2. 경로 정보가 없는 경우
      if (!data.route || !data.route.traavoid || data.route.traavoid.length === 0) {
        console.error(
          "API Error (Navigation): Received code 0 but no routes found."
        );
        throw new Error("경로 정보를 수신하지 못했습니다.");
      }

      // [매핑 로직]
      const routeSummary = data.route.traavoid[0].summary;

      const routeInfo: RouteInfo = {
        totalDistance: routeSummary.distance,
        // !! 중요: 네이버는 ms 단위이므로 1000으로 나눠 초(s) 단위로 변환
        totalDuration: Math.round(routeSummary.duration / 1000),
      };

      // 3. 캐시에 저장
      this.saveToCache(cacheKey, routeInfo);

      return routeInfo;

    } catch (error) {
      // [에러 핸들링]
      if (axios.isAxiosError(error)) {
        console.error(
          `API Error (Navigation) : ${error.response?.status}: ${error.message}`
        );
      } else {
        console.error(`Unexpected error (Navigation): ${error}`);
      }
      throw new Error("길찾기 정보를 가져오는 데 실패했습니다.");
    }
  }
}

// 싱글톤 인스턴스로 export
export default new NavigationService();