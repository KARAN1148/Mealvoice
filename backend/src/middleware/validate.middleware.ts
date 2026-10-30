import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Production-grade input validation helper.
 * Returns a validation-error response when required fields are missing or invalid.
 */

export interface FieldRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'phone';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
}

export type ValidationSchema = Record<string, FieldRule>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()]{7,15}$/;

export function validateBody(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const body = req.body || {};

    for (const [field, rule] of Object.entries(schema)) {
      const val = body[field];
      const missing = val === undefined || val === null || val === '';

      if (rule.required && missing) {
        errors.push(`'${field}' is required.`);
        continue;
      }
      if (missing) continue; // Optional field absent — skip further checks

      if (rule.type === 'string' && typeof val !== 'string') {
        errors.push(`'${field}' must be a string.`);
      } else if (rule.type === 'number' && typeof val !== 'number') {
        errors.push(`'${field}' must be a number.`);
      } else if (rule.type === 'boolean' && typeof val !== 'boolean') {
        errors.push(`'${field}' must be a boolean.`);
      } else if (rule.type === 'array' && !Array.isArray(val)) {
        errors.push(`'${field}' must be an array.`);
      } else if (rule.type === 'email' && !EMAIL_RE.test(val)) {
        errors.push(`'${field}' must be a valid email address.`);
      } else if (rule.type === 'phone' && !PHONE_RE.test(val)) {
        errors.push(`'${field}' must be a valid phone number.`);
      }

      if (rule.minLength !== undefined && typeof val === 'string' && val.length < rule.minLength) {
        errors.push(`'${field}' must be at least ${rule.minLength} characters.`);
      }
      if (rule.maxLength !== undefined && typeof val === 'string' && val.length > rule.maxLength) {
        errors.push(`'${field}' must be at most ${rule.maxLength} characters.`);
      }
      if (rule.min !== undefined && typeof val === 'number' && val < rule.min) {
        errors.push(`'${field}' must be >= ${rule.min}.`);
      }
      if (rule.max !== undefined && typeof val === 'number' && val > rule.max) {
        errors.push(`'${field}' must be <= ${rule.max}.`);
      }
      if (rule.enum && !rule.enum.includes(val)) {
        errors.push(`'${field}' must be one of: ${rule.enum.join(', ')}.`);
      }
    }

    if (errors.length > 0) {
      logger.warn(`[VALIDATION] ${req.method} ${req.path} — ${errors.join(' | ')}`);
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }

    next();
  };
}

/**
 * Middleware that adds production-grade security headers (Helmet-lite).
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
}

