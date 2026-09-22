import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import leadRoutes from './modules/leads/lead.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options('*', cors());
app.use(express.json());


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'LeadFlow API is online', timestamp: new Date().toISOString() });
});

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

export default app;
