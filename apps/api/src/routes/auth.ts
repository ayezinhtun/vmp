import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  findCustomerByEmail, findCustomerById, createCustomer,
  getCustomerVMIds, createSession, findSession, deleteSession,
} from '../services/database.js';
import { signAccessToken, signRefreshToken } from '../middleware/auth.js';

const router = Router();

// ── Register ──────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  name:    z.string().min(2).max(128),
  email:   z.string().email(),
  phone:   z.string().optional(),
  company: z.string().optional(),
  password:z.string().min(8).max(128),
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const body = RegisterSchema.parse(req.body);
    const existing = await findCustomerByEmail(body.email);
    if (existing) return res.status(409).json({ ok: false, error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(body.password, 12);
    const customer = await createCustomer({ ...body, passwordHash });

    res.status(201).json({ ok: true, data: { id: customer.id, email: customer.email } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, error: err.errors });
    console.error('[auth/register]', err.message);
    res.status(500).json({ ok: false, error: 'Registration failed' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const customer = await findCustomerByEmail(email);
    if (!customer) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    const vmIds = await getCustomerVMIds(customer.id);

    const accessToken  = signAccessToken({
      sub:       customer.id,
      email:     customer.email,
      name:      customer.name,
      kycStatus: customer.kyc_status,
      vmIds,
    });
    const refreshToken = signRefreshToken(customer.id);
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await createSession({
      customerId:   customer.id,
      refreshToken,
      userAgent:    req.headers['user-agent'],
      ipAddress:    req.ip,
      expiresAt,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      ok: true,
      data: {
        accessToken,
        customer: {
          id:        customer.id,
          name:      customer.name,
          email:     customer.email,
          company:   customer.company,
          kycStatus: customer.kyc_status,
          vmIds,
        },
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, error: err.errors });
    console.error('[auth/login]', err.message);
    res.status(500).json({ ok: false, error: 'Login failed' });
  }
});

// ── Refresh access token ──────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!token) return res.status(401).json({ ok: false, error: 'No refresh token' });

    const session = await findSession(token);
    if (!session) return res.status(401).json({ ok: false, error: 'Session expired — please log in again' });

    const vmIds = await getCustomerVMIds(session.cid);

    const accessToken = signAccessToken({
      sub:       session.cid,
      email:     session.email,
      name:      session.name,
      kycStatus: session.kyc_status,
      vmIds,
    });

    res.json({ ok: true, data: { accessToken } });
  } catch (err: any) {
    console.error('[auth/refresh]', err.message);
    res.status(500).json({ ok: false, error: 'Token refresh failed' });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  if (token) await deleteSession(token).catch(() => {});
  res.clearCookie('refreshToken');
  res.json({ ok: true });
});

// ── Whoami ────────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  // Minimal check — full check is in requireAuth middleware
  res.json({ ok: true, data: 'ok' });
});

export default router;
