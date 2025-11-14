import { Request, Response } from 'express';
// 1번 파일(서비스)을 import
import weatherService from '../services/WeatherService'; 

class WeatherController {
  /**
   * GET /weather?lat=...&lon=... 요청을 처리합니다.
   */
  async getWeather(req: Request, res: Response): Promise<Response> {
    try {
      // 1. 요청 검증 (Query Parameter)
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({ error: 'Missing lat or lon query parameters' });
      }

      // 문자열로 들어온 값을 숫자로 변환
      const numLat = parseFloat(lat as string);
      const numLon = parseFloat(lon as string);

      if (isNaN(numLat) || isNaN(numLon)) {
        return res.status(400).json({ error: 'Invalid lat or lon values' });
      }

      // 2. 서비스 호출
      const weatherData = await weatherService.getCurrentWeather(numLat, numLon);

      // 3. 성공 응답
      return res.status(200).json(weatherData);

    } catch (error) {
      // 4. 서비스에서 발생한 에러 처리
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

// 컨트롤러도 싱글톤 인스턴스로 export
export default new WeatherController();