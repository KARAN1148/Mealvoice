import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { rateLimit } from './middleware/rateLimit.middleware';
import { securityHeaders } from './middleware/validate.middleware';

import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import restaurantRoutes from './routes/restaurant.routes';
import orderRoutes from './routes/order.routes';
import callOrderRoutes from './routes/callOrder.routes';
import riderRoutes from './routes/rider.routes';
import adminRoutes from './routes/admin.routes';
import supportRoutes from './routes/support.routes';

const prisma = new PrismaClient();
const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const explicitOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (curl, mobile, health checks)
    if (!origin) return cb(null, true);

    const isAllowed =
      explicitOrigins.includes('*') ||
      explicitOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin);

    if (isAllowed) {
      return cb(null, true);
    }

    logger.warn(`[CORS] Blocked origin: ${origin}`);
    cb(new Error(`CORS policy: origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// ─── SECURITY HEADERS ────────────────────────────────────────────────────────
app.use(securityHeaders);

// ─── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── REQUEST LOGGING ─────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID().slice(0, 8);
  res.setHeader('X-Request-ID', reqId);

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`[${reqId}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });

  next();
});

// ─── GLOBAL RATE LIMITS ──────────────────────────────────────────────────────
// 200 req / 15 min per IP across all endpoints
app.use('/api', rateLimit(15 * 60 * 1000, 200, 'Rate limit exceeded. Please try again later.'));

// Stricter limit on auth endpoints: 20 req / 15 min
app.use('/api/auth', rateLimit(15 * 60 * 1000, 20, 'Too many authentication attempts. Please wait before trying again.'));

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Live DB connectivity probe
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      app: 'MealVoice Food Delivery API',
      version: '2.0.0',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: 'connected'
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      app: 'MealVoice Food Delivery API',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message
    });
  }
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/call-orders', callOrderRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found.',
    path: req.path,
    method: req.method
  });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── SERVER START ────────────────────────────────────────────────────────────
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`══════════════════════════════════════════════════`);
  logger.info(`🚀  MealVoice Food Delivery API  v2.0.0`);
  logger.info(`    Port    : http://localhost:${PORT}`);
  logger.info(`    Health  : http://localhost:${PORT}/api/health`);
  logger.info(`    Env     : ${config.nodeEnv}`);
  logger.info(`══════════════════════════════════════════════════`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('[SHUTDOWN] SIGTERM received — closing DB connection...');
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGINT', async () => {
  logger.info('[SHUTDOWN] SIGINT received — closing DB connection...');
  await prisma.$disconnect();
  process.exit(0);
});
