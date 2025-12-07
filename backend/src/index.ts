import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startCompetitionLifecycleJob, startJackpotUpdateJob } from './jobs/competition-lifecycle.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import competitionsRoutes from './routes/competitions.js';
import votingRoutes from './routes/voting.js';
import boostsRoutes from './routes/boosts.js';
import leaderboardRoutes from './routes/leaderboard.js';
import referralsRoutes from './routes/referrals.js';
import reportsRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';
import paymentsRoutes from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));

// Stripe webhook needs raw body
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON body parser for all other routes
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HOTNOTCLUB API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/competitions', competitionsRoutes);
app.use('/api/entries', votingRoutes);
app.use('/api/boosts', boostsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HOTNOTCLUB API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);

  // Start cron jobs
  if (process.env.NODE_ENV === 'production') {
    console.log('🕐 Starting cron jobs...');
    startCompetitionLifecycleJob();
    startJackpotUpdateJob();
  } else {
    console.log('⚠️  Cron jobs disabled in development mode');
  }
});

export default app;
