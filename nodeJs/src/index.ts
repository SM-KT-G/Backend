import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import './config/mongodb'; // MongoDB 연결 초기화
import exchangeRateRouter from './routes/exchangeRate.route';
import translationRoutes from './routes/translation.route';
import mainRouter from './routes/index';
import authRoutes from './routes/auth.router';
import chatbotRoutes from './routes/chatbot.router';
import disasterRouter from './routes/disaster.router';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// --- 미들웨어 설정 ---
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));

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
    // Navigation 관련 스키마
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
    
    // Weather 통합 스키마
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

app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/exchangeRates', exchangeRateRouter);
app.use('/api/disaster', disasterRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api', mainRouter);
app.use('/api', apiRoutes);

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
