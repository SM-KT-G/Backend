import { Router } from 'express';
import weatherRouter from './WeatherRouter';
import forecastRouter from './ForecastRouter'; // 새로 추가한 예보 라우터

const mainRouter = Router();

// /api/weather 로 들어오는 요청은 WeatherRouter가 처리
mainRouter.use('/weather', weatherRouter);

// /api/forecast 로 들어오는 요청은 ForecastRouter가 처리
mainRouter.use('/forecast', forecastRouter);

export default mainRouter;