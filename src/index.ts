import express from 'express';
import 'dotenv/config'; // .env 파일 로드 (가장 상단에)
import mainRouter from './routes'; // ./routes/index.ts 를 가져옴

// Swagger 모듈 import (API Docs용)
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3000;

// --- 미들웨어 설정 ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 메인 라우트 설정 ---
app.use('/api', mainRouter);


// --- Swagger 설정 ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'K-Travel API',
      version: '1.0.0',
      description: 'K-Travel 여행 도움 서비스 API 문서',
    },
    // API 명세에 공용 스키마(타입) 추가
    components: {
      schemas: {
        // [Navigation 스키마 (Coordinates, RouteInfo) 제외됨]
        
        // 1. Weather (통합)
        CombinedWeatherInfo: {
          type: 'object',
          properties: {
            weather: { $ref: '#/components/schemas/WeatherInfoComponent' },
            advisory: { $ref: '#/components/schemas/AdvisoryInfo' },
            airQuality: { $ref: '#/components/schemas/AirQualityInfo' }
          },
          description: "현재 날씨 + 특보 + 미세먼지 통합 정보"
        },
        WeatherInfoComponent: {
           type: 'object',
           properties: {
             temp: { type: 'number' },
             sky: { type: 'string' },
             rainType: { type: 'string' },
             rainAmount: { type: 'string' }
           },
           description: "초단기실황 (현재 날씨)"
        },
        AdvisoryInfo: {
          type: 'object',
          properties: {
            warning: { type: 'boolean' },
            details: { type: 'string', example: "강풍주의보 발효 중" }
          },
          description: "기상특보 정보"
        },
        AirQualityInfo: {
          type: 'object',
          properties: {
            pm10: { type: 'number', example: 35 },
            pm25: { type: 'number', example: 20 },
            dataTime: { type: 'string', example: '2025-11-16 13:00' }
          },
          description: "대기질(미세먼지) 정보"
        },

        // 2. Forecast (단기)
        HourlyForecast: {
          type: 'object',
          properties: {
            fcstDate: { type: 'string', example: '20251116' },
            fcstTime: { type: 'string', example: '0900' },
            temp: { type: 'number', example: 12.0 },
            sky: { type: 'string', example: '맑음' },
            rainType: { type: 'string', example: '없음' },
            rainProbability: { type: 'number', example: 0 }
          }
        },
        // 3. Forecast (중기)
        DailyForecast: {
          type: 'object',
          properties: {
            day: { type: 'number', example: 3 },
            tempMin: { type: 'number', example: 5.0 },
            tempMax: { type: 'number', example: 15.0 },
            weatherAm: { type: 'string', example: '구름많음' },
            weatherPm: { type: 'string', example: '맑음' }
          }
        }
      }
    }
  },
  // API 주석이 있는 파일 경로 (모든 Router 파일)
  apis: ['./src/routes/*.ts'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
// '/api-docs' 경로에 Swagger UI를 서빙
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// --- 서버 시작 ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});