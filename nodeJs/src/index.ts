import express from 'express';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth.router';
import chatbotRoutes from './routes/chatbot.router';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// 디버깅 모든 요청 출력(제발 되라 ㅠㅠ)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

console.log('chatbotRoutes:', chatbotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);
// 이게 요청을 가로채냐?? 제발 그랬으면 좋겠다 ㅠㅠ 
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
