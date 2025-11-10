import express, { Request, Response } from 'express';
import apiRoutes from './routes/api';
import chatRoutes from './routes/chatRoutes';
import { connectMongoDB } from './config/mongodb';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

app.use('/api', apiRoutes);
app.use('/api/chat', chatRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
