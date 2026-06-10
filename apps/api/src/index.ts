import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { config } from './config.js';
import { pool } from './services/database.js';

import authRouter     from './routes/auth.js';
import vmRouter       from './routes/vms.js';
import consoleRouter, { attachVNCProxy } from './routes/console.js';
import customerRouter from './routes/customer.js';
import { initSocketServer } from './websocket/index.js';

const app    = express();
const server = http.createServer(app);

// ── Global middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin:      config.frontendUrl,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(compression() as any);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// ── Health check (used by docker-compose healthcheck) ────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────
app.use('/auth',    authRouter);
app.use('/vms',     vmRouter);
app.use('/console', consoleRouter);
app.use('/customer', customerRouter);

// ── 404 catch-all ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// ── Error handler ────────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[unhandled]', err.message);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

// ── WebSocket (Socket.io + noVNC proxy) ──────────────────────────────────
const io = initSocketServer(server);
attachVNCProxy(server);

// ── Start ─────────────────────────────────────────────────────────────────
async function start() {
  // Verify DB connection
  try {
    await pool.query('SELECT 1');
    console.log('[db] PostgreSQL connected');
  } catch (err: any) {
    console.error('[db] Connection failed:', err.message);
    process.exit(1);
  }

  server.listen(config.port, () => {
    console.log(`[api] VMP Middleware running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[api] Proxmox target: ${config.proxmox.url}`);
  });
}

start();

// ── Graceful shutdown ─────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('[api] SIGTERM — shutting down gracefully');
  await pool.end();
  server.close(() => process.exit(0));
});
