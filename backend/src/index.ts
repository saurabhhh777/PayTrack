import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import PayTrackBot from './bot/telegramBot';
import authRoutes from './routes/auth';
import telegramRoutes from './routes/telegram';
import workerRoutes from './routes/workers';
import workerPaymentRoutes from './routes/workerPayments';
import paymentRoutes from './routes/payments';
import attendanceRoutes from './routes/attendance';
import meelRoutes from './routes/meel';
import personRoutes from './routes/persons';
import cultivationRoutes from './routes/cultivations';
import propertyRoutes from './routes/properties';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/worker-payments', workerPaymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/meel', meelRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/cultivations', cultivationRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'PayTrack API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 PayTrack Backend running on port ${PORT}`);
    });

    // Start Telegram Bot
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      const bot = new PayTrackBot(botToken);
      await bot.start();
      console.log('🤖 Telegram Bot started successfully!');
    } else {
      console.log('⚠️  TELEGRAM_BOT_TOKEN not found. Bot will not start.');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 