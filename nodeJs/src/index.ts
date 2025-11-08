import express from 'express';
import apiRoutes from './routes/api';
import translationRoutes from './routes/translation.route';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

app.use('/api', apiRoutes);
app.use('/api/translation', translationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
