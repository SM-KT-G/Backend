import { Router } from 'express';
// 2번 파일(컨트롤러)을 import
import weatherController from '../controllers/WeatherController'; 

const weatherRouter = Router();

// GET /api/weather
weatherRouter.get('/', weatherController.getWeather);

export default weatherRouter;