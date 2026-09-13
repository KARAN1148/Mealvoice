import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import restaurantRoutes from './routes/restaurant.routes';
import orderRoutes from './routes/order.routes';
import callOrderRoutes from './routes/callOrder.routes';
import riderRoutes from './routes/rider.routes';
import adminRoutes from './routes/admin.routes';
import supportRoutes from './routes/support.routes';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/call-orders', callOrderRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'MealVoice Food API',
    time: new Date().toISOString()
  });
});

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`🚀 MealVoice Food Backend API running on port ${PORT}`);
  logger.info(`   Health check: http://localhost:${PORT}/api/health`);
  logger.info(`==================================================`);
});
