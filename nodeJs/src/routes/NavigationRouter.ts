import { Router } from 'express';
import navigationController from '../controllers/NavigationController';

const navigationRouter = Router();

/**
 * @swagger
 * /api/navigation/directions:
 *   post:
 *     summary: 길찾기 경로 요청
 *     description: 출발지와 도착지 좌표를 Body로 받아 최적 경로 정보를 반환합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 $ref: '#/components/schemas/Coordinates'
 *               destination:
 *                 $ref: '#/components/schemas/Coordinates'
 *             example:
 *               origin: { "lat": 37.5665, "lon": 126.9780 }
 *               destination: { "lat": 37.5124, "lon": 127.1054 }
 *     responses:
 *       '200':
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RouteInfo'
 *       '400':
 *         description: 잘못된 요청 (좌표 누락 또는 형식 오류)
 *       '500':
 *         description: 서버 오류
 */
navigationRouter.post('/directions', navigationController.getDirections);

export default navigationRouter;