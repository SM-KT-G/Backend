import { Request, Response } from 'express';
// 방금 만든 싱글톤 서비스 인스턴스를 import
import forecastService from '../services/ForecastService';

class ForecastController {
  
  /**
   * (유틸리티) 요청에서 lat, lon을 파싱하고 검증합니다.
   */
  private parseLatLon(req: Request): { lat: number; lon: number } | { error: string; status: number } {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return { error: 'Missing lat or lon query parameters', status: 400 };
    }

    const numLat = parseFloat(lat as string);
    const numLon = parseFloat(lon as string);

    if (isNaN(numLat) || isNaN(numLon)) {
      return { error: 'Invalid lat or lon values', status: 400 };
    }
    
    return { lat: numLat, lon: numLon };
  }

  /**
   * GET /forecast/short?lat=...&lon=... 요청을 처리합니다.
   * (단기예보: 오늘~모레)
   */
  async getShortTerm(req: Request, res: Response): Promise<Response> {
    try {
      // 1. 위도/경도 검증
      const coords = this.parseLatLon(req);
      if ('error' in coords) {
        return res.status(coords.status).json({ error: coords.error });
      }

      // 2. 서비스 호출
      const forecastData = await forecastService.getShortTermForecast(coords.lat, coords.lon);

      // 3. 성공 응답 ({ data: ... } 래퍼 적용)
      return res.status(200).json({ data: forecastData });

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }

  /**
   * GET /forecast/mid?lat=...&lon=... 요청을 처리합니다.
   * (중기예보: 3일~10일)
   */
  async getMidTerm(req: Request, res: Response): Promise<Response> {
    try {
      // 1. 위도/경도 검증
      const coords = this.parseLatLon(req);
      if ('error' in coords) {
        return res.status(coords.status).json({ error: coords.error });
      }

      // 2. 서비스 호출
      const forecastData = await forecastService.getMidTermForecast(coords.lat, coords.lon);

      // 3. 성공 응답 ({ data: ... } 래퍼 적용)
      return res.status(200).json({ data: forecastData });

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

// 컨트롤러도 싱글톤 인스턴스로 export
export default new ForecastController();