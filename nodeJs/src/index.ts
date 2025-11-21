import 'dotenv/config';
import exchangeRateRouter from './routes/exchangeRate.route';
import express from 'express';
import dotenv from 'dotenv';
import translationRoutes from './routes/translation.route';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth.router';
import chatbotRoutes from './routes/chatbot.router';
import cors from 'cors';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
// Middleware
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/exchangeRates', exchangeRateRouter);
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
