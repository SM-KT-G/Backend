import { Router } from 'express';
// 3개 서비스를 통합한 'WeatherController'를 import
import weatherController from '../controllers/WeatherController';

const weatherRouter = Router();

/**
 * @swagger
 * /api/weather:
 * get:
 * summary: 통합 현재 날씨 조회 (날씨 + 특보 + 미세먼지)
 * description: 위도(lat)와 경도(lon)를 쿼리 파라미터로 받아 '현재 날씨', '기상특보', '대기질' 정보를 통합하여 반환합니다.
 * parameters:
 * - in: query
 * name: lat
 * required: true
 * description: 위도
 * schema:
 * type: number
 * example: 37.5665
 * - in: query
 * name: lon
 * required: true
 * description: 경도
 * schema:
 * type: number
 * example: 126.9780
 * responses:
 * '200':
 * description: 성공 (data 래퍼로 감싸진 통합 날씨 정보)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * data:
 * $ref: '#/components/schemas/CombinedWeatherInfo'
 * '400':
 * description: 잘못된 요청 (좌표 누락 또는 값 오류)
 * '500':
 * description: 서버 오류
 */
weatherRouter.get('/', weatherController.getWeather);

export default weatherRouter;