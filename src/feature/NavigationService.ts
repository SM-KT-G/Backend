import axios from "axios";
import {
  Coordinates,
  RouteInfo,
  NcpDirectionsApiResponse,
} from "../types/navigation.types";

const NAVER_DIRECTIONS_API_URL =
  "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving";

class NavigationService {
  /**
   * 출발지에서 도착지까지의 경로 정보를 가져옵니다. (자동차 기준)
   * @param origin 출발지 좌표
   * @param destination 도착지 좌표
   * @returns 가공된 경로 정보(RouteInfo) Promise 객체
   */
  static async getDirections(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<RouteInfo> {
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

      return {
        totalDistance: routeSummary.distance,
        // !! 중요: 네이버는 ms 단위이므로 1000으로 나눠 초(s) 단위로 변환
        totalDuration: Math.round(routeSummary.duration / 1000),
      };

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

export default NavigationService;