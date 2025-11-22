import { Request, Response } from 'express';
// [수정] 3개의 서비스를 모두 import합니다.
import weatherService from '../services/WeatherService';
import advisoryService from '../services/AdvisoryService';
import airQualityService from '../services/AirQualityService';
// [수정] 최종 반환 타입을 import
import { CombinedWeatherInfo } from '../types/weather.types';

class WeatherController {
  /**
   * [수정됨]
   * GET /weather?lat=...&lon=... 요청을 처리합니다.
   * 3개의 서비스(날씨, 특보, 미세먼지)를 모두 호출하여 조합된 데이터를 반환합니다.
   */
  async getWeather(req: Request, res: Response): Promise<Response> {
    try {
      // 1. 요청 검증 (Query Parameter)
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({ error: 'Missing lat or lon query parameters' });
      }

      const numLat = parseFloat(lat as string);
      const numLon = parseFloat(lon as string);

      if (isNaN(numLat) || isNaN(numLon)) {
        return res.status(400).json({ error: 'Invalid lat or lon values' });
      }

      // [핵심] 3개의 서비스 API를 '동시에' 호출합니다.
      // Promise.all을 사용하면 3개의 요청이 병렬로 실행되어 응답 시간이 단축됩니다.
      const [weather, advisory, airQuality] = await Promise.all([
        weatherService.getCurrentWeather(numLat, numLon),
        advisoryService.getCurrentAdvisory(numLat, numLon),
        airQualityService.getCurrentAirQuality(numLat, numLon),
      ]);

      // 3. 3개의 결과를 'CombinedWeatherInfo' 객체 하나로 조합
      const combinedData: CombinedWeatherInfo = {
        weather,
        advisory,
        airQuality,
      };

      // 4. 성공 응답 ({ data: ... } 래퍼 적용)
      return res.status(200).json({ data: combinedData });

    } catch (error) {
      // 5. 에러 처리
      // (하나의 API라도 실패하면 Promise.all이 실패하고 이리로 옵니다)
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

// 컨트롤러도 싱글톤 인스턴스로 export
export default new WeatherController();