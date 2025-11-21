import { Request, Response } from 'express';
// 1번 파일(서비스)을 import
import navigationService from '../services/NavigationService'; 
// 4번 파일(타입)을 import
import { Coordinates } from '../types/navigation.types';

class NavigationController {
  /**
   * POST /directions 요청을 처리합니다.
   * Body: { "origin": { "lat": ..., "lon": ... }, "destination": { ... } }
   */
  async getDirections(req: Request, res: Response): Promise<Response> {
    try {
      // 1. 요청 검증 (Request Body)
      const { origin, destination }: { origin: Coordinates, destination: Coordinates } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ error: '출발지(origin)와 도착지(destination)가 필요합니다.' });
      }

      if (!origin.lat || !origin.lon || !destination.lat || !destination.lon) {
        return res.status(400).json({ error: '좌표 형식이 올바르지 않습니다. lat과 lon 값을 확인해주세요.' });
      }

      // 2. 서비스 호출
      const directionsData = await navigationService.getDirections(origin, destination);

      // 3. 성공 응답 [수정됨]
      // { "data": ... } 형태로 감싸서 반환
      return res.status(200).json({ data: directionsData });

    } catch (error) {
      // 4. 서비스에서 발생한 에러 처리
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      // [수정됨] 에러 응답도 { error: ... } 형태로 통일
      return res.status(500).json({ error: errorMessage });
    }
  }
}

// 컨트롤러도 싱글톤 인스턴스로 export
export default new NavigationController();