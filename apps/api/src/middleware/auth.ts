/**
 * JWT Authentication + VMID Authorization middleware.
 *
 * Security design:
 * - Access tokens are short-lived (15 min) and carry the customer's allowed VMID list.
 * - Every VM action verifies the requested VMID is in the customer's whitelist.
 * - Proxmox is NEVER called without this check passing first.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { JWTPayload } from '../types/index.js';

// Extend Express request to carry the decoded token
declare global {
  namespace Express {
    interface Request {
      customer?: JWTPayload;
    }
  }
}

// ── Verify Bearer JWT ─────────────────────────────────────────────────────

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Missing or malformed Authorization header' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.customer = payload;
    next();
  } catch (err: any) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ ok: false, error: msg });
  }
}

// ── VMID ownership check ──────────────────────────────────────────────────
// Usage: router.post('/:vmid/start', requireAuth, requireVMOwnership, handler)

export function requireVMOwnership(req: Request, res: Response, next: NextFunction) {
  const vmid = parseInt(req.params.vmid ?? req.params.id ?? '');
  if (isNaN(vmid)) {
    return res.status(400).json({ ok: false, error: 'Invalid VMID' });
  }

  const allowed = req.customer?.vmIds ?? [];
  if (!allowed.includes(vmid)) {
    // Log the attempt (could be probing another customer's VM)
    console.warn(
      `[SECURITY] Customer ${req.customer?.sub} attempted access to VM ${vmid}. ` +
      `Allowed: [${allowed.join(', ')}]`
    );
    return res.status(403).json({ ok: false, error: 'Forbidden: VM not assigned to your account' });
  }

  next();
}

// ── JWT factory ───────────────────────────────────────────────────────────

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export function signRefreshToken(customerId: string): string {
  return jwt.sign({ sub: customerId, type: 'refresh' }, config.jwtSecret, {
    expiresIn: config.refreshExpires as any,
  });
}
