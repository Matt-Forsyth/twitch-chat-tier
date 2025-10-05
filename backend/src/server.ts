import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database';
import { initializeWebSocket } from './websocket/websocketHandler';
import tierListRoutes from './routes/tierListRoutes';
import authRoutes from './routes/authRoutes';
import voteRoutes from './routes/voteRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 8081;

// Trust proxy for Railway
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tierlists', tierListRoutes);
app.use('/api/votes', voteRoutes);

// WebSocket initialization
initializeWebSocket(wss);

// Error handling middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 WebSocket server ready at ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
