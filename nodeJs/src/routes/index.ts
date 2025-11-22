import { Router } from 'express';
import navigationRouter from './NavigationRouter';
import weatherRouter from './WeatherRouter';
import forecastRouter from './ForecastRouter'; // 새로 추가한 예보 라우터

const mainRouter = Router();

// /api/weather 로 들어오는 요청은 WeatherRouter가 처리
mainRouter.use('/weather', weatherRouter);
mainRouter.use('/navigation', navigationRouter);
// /api/forecast 로 들어오는 요청은 ForecastRouter가 처리
mainRouter.use('/forecast', forecastRouter);

export default mainRouter;