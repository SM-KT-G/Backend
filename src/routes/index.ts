import { Router } from 'express';
import weatherRouter from './WeatherRouter';
import navigationRouter from './NavigationRouter';

const mainRouter = Router();

// /api/weather 로 들어오는 요청은 WeatherRouter가 처리
mainRouter.use('/weather', weatherRouter);

// /api/navigation 으로 들어오는 요청은 NavigationRouter가 처리
mainRouter.use('/navigation', navigationRouter);

export default mainRouter;