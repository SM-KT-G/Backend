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
            // 네이버 파라미터: start, goal (경도,위도 순서)
            start: `${origin.lon},${origin.lat}`,
            goal: `${destination.lon},${destination.lat}`,
          },
        }
      );

    } catch (error) {
      // 에러 핸들링 로직 (마지막 단계에 추가)
    }
    // 임시로 에러 발생 (TypeScript 타입 에러 방지용)
    throw new Error("Method not fully implemented.");
  }
}

export default NavigationService;