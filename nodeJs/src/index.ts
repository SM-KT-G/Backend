import express, { Request, Response } from 'express';
import apiRoutes from './routes/api';
import exchangeRateRouter from './routes/exchangeRate.route';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});


app.use('/api', apiRoutes);

// 추후 router 추가 예정
app.use('/api/exchangeRates', exchangeRateRouter);







// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
