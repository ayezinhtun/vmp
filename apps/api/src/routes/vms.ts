/**
 * VM routes — all behind requireAuth + requireVMOwnership.
 *
 * Authorization flow:
 *   1. JWT validated → customer identity + allowed VMID list extracted
 *   2. Requested VMID checked against customer's whitelist
 *   3. Only then is Proxmox API called
 */

import { Router } from 'express';
import { requireAuth, requireVMOwnership } from '../middleware/auth.js';
import { apiLimiter, vmActionLimiter } from '../middleware/rateLimit.js';
import * as proxmox from '../services/proxmox.js';
import {
  getCustomerVMAssignments,
  getCustomerVMRequests,
  createVMRequest,
} from '../services/database.js';
import type { ApiResponse, VMInfo } from '../types/index.js';
import { z } from 'zod';

const router = Router();
router.use(requireAuth, apiLimiter);

// ── Helper: normalize Proxmox status → portal VMInfo ─────────────────────
function normalizeStatus(s: any, assignment: any): VMInfo {
  return {
    vmId:      s.vmid,
    legacyId:  assignment?.legacyVm,
    name:      s.name,
    node:      s.node ?? assignment?.nodeName ?? 'pve',
    status:    s.status ?? 'unknown',
    cpu:       Math.round((s.cpu ?? 0) * 100),         // → percentage 0–100
    ramUsed:   s.mem    ?? 0,
    ramTotal:  s.maxmem ?? 0,
    diskUsed:  s.disk   ?? 0,
    diskTotal: s.maxdisk ?? 0,
    uptime:    s.uptime ?? 0,
    netIn:     s.netin  ?? 0,
    netOut:    s.netout ?? 0,
  };
}

// ── GET /vms — list customer's VMs with live status ──────────────────────
router.get('/', async (req, res) => {
  try {
    const assignments = await getCustomerVMAssignments(req.customer!.sub);
    if (assignments.length === 0) return res.json({ ok: true, data: [] });

    const statusMap = await proxmox.batchVMStatus(assignments.map(a => a.vmId));

    const vms: VMInfo[] = assignments.map(a => {
      const s = statusMap.get(a.vmId);
      return s
        ? normalizeStatus(s, a)
        : { vmId: a.vmId, legacyId: a.legacyVm, name: a.hostname ?? `vm-${a.vmId}`,
            node: a.nodeName, status: 'unknown' as const,
            cpu: 0, ramUsed: 0, ramTotal: 0, diskUsed: 0, diskTotal: 0, uptime: 0, netIn: 0, netOut: 0 };
    });

    res.json({ ok: true, data: vms });
  } catch (err: any) {
    console.error('[vms/list]', err.message);
    res.status(502).json({ ok: false, error: 'Failed to fetch VM list from Proxmox' });
  }
});

// ── GET /vms/:vmid — single VM status ────────────────────────────────────
router.get('/:vmid', requireVMOwnership, async (req, res) => {
  const vmid = parseInt(req.params.vmid);
  try {
    const [status, config] = await Promise.all([
      proxmox.getVMStatus(vmid),
      proxmox.getVMConfig(vmid).catch(() => ({})),
    ]);
    const assignments = await getCustomerVMAssignments(req.customer!.sub);
    const assignment  = assignments.find(a => a.vmId === vmid);
    res.json({ ok: true, data: { ...normalizeStatus(status, assignment), config } });
  } catch (err: any) {
    console.error(`[vms/${vmid}]`, err.message);
    res.status(502).json({ ok: false, error: 'Failed to fetch VM status' });
  }
});

// ── Power actions ─────────────────────────────────────────────────────────
const powerActions = ['start', 'stop', 'reboot', 'shutdown', 'reset'] as const;
type PowerAction = typeof powerActions[number];

router.post('/:vmid/:action(start|stop|reboot|shutdown|reset)',
  requireVMOwnership, vmActionLimiter,
  async (req, res) => {
    const vmid   = parseInt(req.params.vmid);
    const action = req.params.action as PowerAction;
    try {
      const actionMap: Record<PowerAction, () => Promise<any>> = {
        start:    () => proxmox.startVM(vmid),
        stop:     () => proxmox.stopVM(vmid),
        reboot:   () => proxmox.rebootVM(vmid),
        shutdown: () => proxmox.shutdownVM(vmid),
        reset:    () => proxmox.resetVM(vmid),
      };
      const task = await actionMap[action]();
      console.log(`[vm:${action}] Customer ${req.customer!.sub} → VM ${vmid} | task: ${task.upid}`);
      res.json({ ok: true, data: { upid: task.upid, action } });
    } catch (err: any) {
      console.error(`[vms/${vmid}/${action}]`, err.message);
      res.status(502).json({ ok: false, error: `Failed to ${action} VM` });
    }
  },
);

// ── GET /vms/:vmid/metrics — RRD data ────────────────────────────────────
router.get('/:vmid/metrics', requireVMOwnership, async (req, res) => {
  const vmid      = parseInt(req.params.vmid);
  const timeframe = (req.query.timeframe as string) ?? 'hour';
  try {
    const data = await proxmox.getVMMetrics(vmid, timeframe as any);
    res.json({ ok: true, data });
  } catch (err: any) {
    res.status(502).json({ ok: false, error: 'Failed to fetch metrics' });
  }
});

// ── GET /vms/:vmid/snapshots ──────────────────────────────────────────────
router.get('/:vmid/snapshots', requireVMOwnership, async (req, res) => {
  const vmid = parseInt(req.params.vmid);
  try {
    const snaps = await proxmox.listSnapshots(vmid);
    res.json({ ok: true, data: snaps });
  } catch (err: any) {
    res.status(502).json({ ok: false, error: 'Failed to fetch snapshots' });
  }
});

// ── POST /vms/:vmid/snapshots ─────────────────────────────────────────────
router.post('/:vmid/snapshots', requireVMOwnership, async (req, res) => {
  const vmid  = parseInt(req.params.vmid);
  const { name, description } = req.body ?? {};
  try {
    const task = await proxmox.createSnapshot(vmid, name ?? `snap-${Date.now()}`, description);
    res.json({ ok: true, data: { upid: task.upid } });
  } catch (err: any) {
    res.status(502).json({ ok: false, error: 'Failed to create snapshot' });
  }
});

// ── POST /vms/request — deploy new VM ────────────────────────────────────
const RequestSchema = z.object({
  purpose:          z.string().min(1).max(256),
  hostname:         z.string().min(2).max(64).regex(/^[a-z0-9][a-z0-9-]*$/),
  sizing:           z.enum(['preset', 'custom']),
  preset:           z.string().optional(),
  vcpu:             z.number().int().min(1).max(128),
  ram:              z.number().int().min(1).max(512),
  volumes:          z.array(z.object({ size: z.number().int().min(10) })).min(1).max(3),
  bandwidth:        z.string(),
  os:               z.string(),
  osVersion:        z.string(),
  zone:             z.string(),
  nics:             z.array(z.object({ label: z.string(), type: z.string(), vlan: z.string() })),
  firewallPorts:    z.array(z.string()),
  portForwarding:   z.array(z.object({ srcPort: z.string(), dstPort: z.string(), protocol: z.string() })),
  backupEnabled:    z.boolean(),
  backupFrequency:  z.string().optional(),
  backupRetention:  z.number().int().optional(),
  monitoring:       z.boolean(),
  vmProtection:     z.string(),
  ddosProtection:   z.string(),
  sslCertificate:   z.string(),
  loadBalancer:     z.string(),
  additionalNotes:  z.string().optional(),
});

router.post('/request', async (req, res) => {
  try {
    const spec = RequestSchema.parse(req.body);
    const request = await createVMRequest(req.customer!.sub, {
      ...spec,
      osName:    spec.os,
      osVersion: spec.osVersion,
    });
    res.status(201).json({ ok: true, data: request });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, error: err.errors });
    console.error('[vms/request]', err.message);
    res.status(500).json({ ok: false, error: 'Failed to submit VM request' });
  }
});

// ── GET /vms/requests — customer's deploy requests ────────────────────────
router.get('/requests/list', async (req, res) => {
  try {
    const requests = await getCustomerVMRequests(req.customer!.sub);
    res.json({ ok: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Failed to fetch requests' });
  }
});

export default router;
