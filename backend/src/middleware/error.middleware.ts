import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error on ${req.method} ${req.path}:`, err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
