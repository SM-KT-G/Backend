import express from 'express';
import 'dotenv/config'; // .env 파일 로드 (가장 상단에)
import mainRouter from './routes'; // ./routes/index.ts 를 가져옴

// Swagger 모듈 import (API Docs용)
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3000;

// --- 미들웨어 설정 ---
// 1. JSON Body 파서 (req.body 사용)
app.use(express.json());
// 2. URL Encoded Body 파서 (폼 제출 등)
app.use(express.urlencoded({ extended: true }));


// --- 메인 라우트 설정 ---
// 모든 API 요청은 /api 접두사를 가짐
// 예: /api/navigation/directions
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
        Coordinates: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lon: { type: 'number' }
          }
        },
        RouteInfo: {
          type: 'object',
          properties: {
            totalDistance: { type: 'number' },
            totalDuration: { type: 'number' }
          }
        },
        WeatherInfo: {
           type: 'object',
           properties: {
             temp: { type: 'number' },
             feels_like: { type: 'number' },
             temp_min: { type: 'number' },
             temp_max: { type: 'number' },
             description: { type: 'string' },
             icon: { type: 'string' }
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