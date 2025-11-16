import { Router } from 'express';
// 방금 만든 컨트롤러를 import
import forecastController from '../controllers/ForecastController';

const forecastRouter = Router();

/**
 * @swagger
 * /api/forecast/short:
 * get:
 * summary: 단기예보 조회 (오늘~모레)
 * description: 위도(lat)와 경도(lon)를 쿼리 파라미터로 받아 3일치 3시간 단위 예보를 반환합니다.
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
 * description: 성공 (data 래퍼로 감싸진 단기예보 배열)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/HourlyForecast'
 * '400':
 * description: 잘못된 요청 (좌표 누락)
 * '500':
 * description: 서버 오류
 */
forecastRouter.get('/short', forecastController.getShortTerm);

/**
 * @swagger
 * /api/forecast/mid:
 * get:
 * summary: 중기예보 조회 (3일~10일)
 * description: 위도(lat)와 경도(lon)를 쿼리 파라미터로 받아 3일~10일치 주간 예보를 반환합니다.
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
 * description: 성공 (data 래퍼로 감싸진 중기예보 배열)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/DailyForecast'
 * '400':
 * description: 잘못된 요청 (좌표 누락)
 * '500':
 * description: 서버 오류
 */
forecastRouter.get('/mid', forecastController.getMidTerm);

export default forecastRouter;