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

      if (!origin || !destination || !origin.lat || !origin.lon || !destination.lat || !destination.lon) {
        return res.status(400).json({ error: 'Invalid origin or destination in request body' });
      }

      // 2. 서비스 호출
      const directionsData = await navigationService.getDirections(origin, destination);

      // 3. 성공 응답
      return res.status(200).json(directionsData);

    } catch (error) {
      // 4. 서비스에서 발생한 에러 처리
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

// 컨트롤러도 싱글톤 인스턴스로 export
export default new NavigationController();