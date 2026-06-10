/**
 * noVNC console proxy route.
 *
 * Flow:
 *  1. Customer POSTs /console/:vmid/ticket → middleware calls Proxmox vncproxy
 *  2. Proxmox returns a ticket + WebSocket port
 *  3. Middleware returns a short-lived signed token (30s TTL) to the portal
 *  4. Portal opens wss://<host>/api/vnc/<token> → middleware proxies to Proxmox WS
 *
 * The customer NEVER sees the Proxmox host/port/ticket directly.
 */

import { Router } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import httpProxy from 'http-proxy';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { requireAuth, requireVMOwnership } from '../middleware/auth.js';
import { vmActionLimiter } from '../middleware/rateLimit.js';
import * as proxmox from '../services/proxmox.js';
import { config } from '../config.js';

const router = Router();
router.use(requireAuth);

// In-memory ticket store (swap for Redis in production for multi-instance)
const consoleTickets = new Map<string, {
  vmid: number;
  proxmoxTicket: string;
  proxmoxPort: number;
  proxmoxHost: string;
  expiresAt: number;
}>();

// Clean up expired tickets every 60s
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of consoleTickets) {
    if (v.expiresAt < now) consoleTickets.delete(k);
  }
}, 60_000);

// ── POST /console/:vmid/ticket — get a short-lived console token ──────────
router.post('/:vmid/ticket', requireVMOwnership, vmActionLimiter, async (req, res) => {
  const vmid = parseInt(req.params.vmid);
  try {
    const vncData = await proxmox.createVNCProxy(vmid);

    // Generate a single-use console token (30s TTL)
    const token = crypto.randomBytes(24).toString('hex');
    const proxmoxHost = new URL(config.proxmox.url).hostname;

    consoleTickets.set(token, {
      vmid,
      proxmoxTicket: vncData.ticket,
      proxmoxPort:   vncData.port,
      proxmoxHost,
      expiresAt:     Date.now() + 30_000,   // 30 seconds to connect
    });

    console.log(`[console] Token issued for VM ${vmid} by ${req.customer!.sub}`);

    res.json({
      ok: true,
      data: {
        token,
        wsUrl: `/api/vnc/${token}`,
        expiresIn: 30,
      },
    });
  } catch (err: any) {
    console.error(`[console/${vmid}]`, err.message);
    res.status(502).json({ ok: false, error: 'Failed to create console session' });
  }
});

// ── WebSocket upgrade handler (attached to HTTP server in index.ts) ───────
export function attachVNCProxy(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true });
  const proxy = httpProxy.createServer({ ws: true });

  server.on('upgrade', (req, socket, head) => {
    const url = req.url ?? '';
    const match = url.match(/^\/api\/vnc\/([a-f0-9]{48})/);
    if (!match) {
      socket.destroy();
      return;
    }

    const token = match[1];
    const info  = consoleTickets.get(token);

    if (!info || info.expiresAt < Date.now()) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Token consumed — remove so it can't be reused
    consoleTickets.delete(token);

    // Proxy the WebSocket to Proxmox's VNC WebSocket port
    const target = `wss://${info.proxmoxHost}:${info.proxmoxPort}`;
    console.log(`[vnc-proxy] VM ${info.vmid} → ${target}`);

    proxy.ws(req, socket, head, {
      target,
      ws: true,
      secure: config.proxmox.verifyTls,
      headers: {
        // Pass the Proxmox VNC ticket as the sub-protocol or query param
        Cookie: `PVEAuthCookie=${info.proxmoxTicket}`,
      },
    });
  });

  proxy.on('error', (err, req, res) => {
    console.error('[vnc-proxy] error:', err.message);
  });

  return wss;
}

export default router;
