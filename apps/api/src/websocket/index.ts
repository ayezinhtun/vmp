/**
 * Socket.io real-time server.
 *
 * Each authenticated customer joins a room named after their UUID.
 * A background poller fetches live VM metrics from Proxmox every 5s
 * and emits them only to the rooms of customers who own those VMs.
 */

import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer }  from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getCustomerVMIds, getCustomerVMAssignments } from '../services/database.js';
import * as proxmox from '../services/proxmox.js';
import type { JWTPayload, WSEvent } from '../types/index.js';

// Map: vmId → Set of customerIds watching it
const watchers = new Map<number, Set<string>>();
// Map: customerId → socket room
const customerSockets = new Map<string, string>();

export function initSocketServer(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin:      config.frontendUrl,
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // ── Auth handshake ────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Missing auth token'));

    try {
      const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
      (socket as any).customer = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection ────────────────────────────────────────────────────────
  io.on('connection', async (socket) => {
    const customer = (socket as any).customer as JWTPayload;
    const room     = `customer:${customer.sub}`;

    await socket.join(room);
    customerSockets.set(customer.sub, room);

    console.log(`[ws] Customer ${customer.sub} connected (${socket.id})`);

    // Register VM watchers
    for (const vmId of customer.vmIds) {
      if (!watchers.has(vmId)) watchers.set(vmId, new Set());
      watchers.get(vmId)!.add(customer.sub);
    }

    // ── Client-initiated refresh ────────────────────────────────────────
    socket.on('vm:refresh', async ({ vmId }: { vmId: number }) => {
      if (!customer.vmIds.includes(vmId)) return;
      try {
        const status = await proxmox.getVMStatus(vmId);
        socket.emit('vm:status', { vmId, payload: status } satisfies WSEvent);
      } catch {}
    });

    socket.on('disconnect', () => {
      customerSockets.delete(customer.sub);
      for (const vmId of customer.vmIds) {
        watchers.get(vmId)?.delete(customer.sub);
      }
      console.log(`[ws] Customer ${customer.sub} disconnected`);
    });
  });

  // ── Background metrics poller (every 5 seconds) ───────────────────────
  const POLL_INTERVAL = 5_000;

  setInterval(async () => {
    // Collect all unique VMIDs being watched
    const activeVmIds = [...watchers.entries()]
      .filter(([, subs]) => subs.size > 0)
      .map(([vmId]) => vmId);

    if (activeVmIds.length === 0) return;

    try {
      const statusMap = await proxmox.batchVMStatus(activeVmIds);

      for (const [vmId, status] of statusMap) {
        const subs = watchers.get(vmId);
        if (!subs) continue;

        const event: WSEvent = {
          type:    'vm:status',
          vmId,
          payload: {
            vmId,
            status:   status.status,
            cpu:      Math.round(status.cpu * 100),
            ramUsed:  status.mem,
            ramTotal: status.maxmem,
            uptime:   status.uptime,
            netIn:    status.netin,
            netOut:   status.netout,
          },
        };

        for (const customerId of subs) {
          io.to(`customer:${customerId}`).emit('vm:status', event);
        }
      }
    } catch (err: any) {
      // Silently absorb polling errors — Proxmox may be temporarily unreachable
      if (config.isDev) console.warn('[ws:poller]', err.message);
    }
  }, POLL_INTERVAL);

  // ── RRD metrics poller (every 30 seconds) ────────────────────────────
  setInterval(async () => {
    const activeVmIds = [...watchers.entries()]
      .filter(([, subs]) => subs.size > 0)
      .map(([vmId]) => vmId);

    for (const vmId of activeVmIds) {
      try {
        const rrd = await proxmox.getVMMetrics(vmId, 'hour');
        const subs = watchers.get(vmId);
        if (!subs) continue;

        const event: WSEvent = { type: 'vm:metrics', vmId, payload: rrd };
        for (const customerId of subs) {
          io.to(`customer:${customerId}`).emit('vm:metrics', event);
        }
      } catch {}
    }
  }, 30_000);

  return io;
}
