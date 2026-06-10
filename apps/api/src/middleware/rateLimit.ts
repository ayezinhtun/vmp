import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { ok: false, error: 'Too many requests — slow down' },
  keyGenerator: (req) => req.customer?.sub ?? req.ip ?? 'unknown',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max:      config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { ok: false, error: 'Too many login attempts — wait 15 minutes' },
  keyGenerator: (req) => req.ip ?? 'unknown',
});

// Stricter limiter for VM power actions to prevent accidental spam
export const vmActionLimiter = rateLimit({
  windowMs: 60_000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { ok: false, error: 'Too many VM actions — slow down' },
  keyGenerator: (req) => `${req.customer?.sub}:${req.params.vmid}`,
});
