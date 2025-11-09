import axios from "axios";
import {
  Coordinates,
  RouteInfo,
  NcpDirectionsApiResponse,
} from "../types/navigation.types";

const NAVER_DIRECTIONS_API_URL =
  "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving";

class NavigationService {
  static async getDirections(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<RouteInfo> {
    try {
      const response = await axios.get<NcpDirectionsApiResponse>(
        NAVER_DIRECTIONS_API_URL,
        {
          params: {
            start: `${origin.lon},${origin.lat}`,
            goal: `${destination.lon},${destination.lat}`,
          },
          headers: {
            "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLIENT_ID,
            "X-NCP-APIGW-API-KEY": process.env.NAVER_CLIENT_SECRET,
          },
        }
      );

      const { data } = response;

      if (data.code !== 0) {
        console.error(
          `API Error (Navigation): ${data.code} - ${data.message}`
        );
        throw new Error(`경로 API 응답 오류: ${data.message}`);
      }
      
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
      // 에러 핸들링 로직 (마지막 단계에 추가)
    }
    // 임시로 에러 발생 (TypeScript 타입 에러 방지용)
    throw new Error("Method not fully implemented.");
  }
}

export default NavigationService;