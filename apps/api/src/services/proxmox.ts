/**
 * Proxmox PVE REST API client.
 *
 * Only the middleware calls this — the customer portal NEVER talks to Proxmox
 * directly. All calls go through auth + VMID ownership checks first.
 */

import https from 'https';
import { config } from '../config.js';
import type {
  ProxmoxVMStatus,
  ProxmoxRRDData,
  ProxmoxVNCProxy,
  ProxmoxTask,
} from '../types/index.js';

// ── HTTP agent that optionally skips TLS verification (self-signed certs) ──
const httpsAgent = new https.Agent({
  rejectUnauthorized: config.proxmox.verifyTls,
});

async function pve<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const url = `${config.proxmox.url}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `PVEAPIToken=${config.proxmox.token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    // @ts-expect-error node-fetch agent option
    agent: httpsAgent,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Proxmox ${method} ${path} → ${res.status}: ${txt}`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

const node = () => config.proxmox.node;

// ── VM operations ──────────────────────────────────────────────────────────

export async function getVMStatus(vmid: number): Promise<ProxmoxVMStatus> {
  return pve('GET', `/nodes/${node()}/qemu/${vmid}/status/current`);
}

export async function startVM(vmid: number): Promise<ProxmoxTask> {
  return pve('POST', `/nodes/${node()}/qemu/${vmid}/status/start`);
}

export async function stopVM(vmid: number): Promise<ProxmoxTask> {
  return pve('POST', `/nodes/${node()}/qemu/${vmid}/status/stop`);
}

export async function rebootVM(vmid: number): Promise<ProxmoxTask> {
  return pve('POST', `/nodes/${node()}/qemu/${vmid}/status/reboot`);
}

export async function shutdownVM(vmid: number): Promise<ProxmoxTask> {
  return pve('POST', `/nodes/${node()}/qemu/${vmid}/status/shutdown`);
}

export async function resetVM(vmid: number): Promise<ProxmoxTask> {
  return pve('POST', `/nodes/${node()}/qemu/${vmid}/status/reset`);
}

// ── Metrics / RRD ──────────────────────────────────────────────────────────

export type RRDTimeframe = 'hour' | 'day' | 'week' | 'month' | 'year';

export async function getVMMetrics(
  vmid: number,
  timeframe: RRDTimeframe = 'hour',
): Promise<ProxmoxRRDData[]> {
  return pve('GET', `/nodes/${node()}/qemu/${vmid}/rrddata?timeframe=${timeframe}&cf=AVERAGE`);
}

// ── VNC / noVNC Console ────────────────────────────────────────────────────

export async function createVNCProxy(vmid: number): Promise<ProxmoxVNCProxy> {
  return pve('POST', `/nodes/${node()}/qemu/${vmid}/vncproxy`, {
    websocket: 1,
    'generate-password': 0,
  });
}

// ── VM config (for display) ────────────────────────────────────────────────

export async function getVMConfig(vmid: number): Promise<Record<string, unknown>> {
  return pve('GET', `/nodes/${node()}/qemu/${vmid}/config`);
}

// ── Node list ─────────────────────────────────────────────────────────────

export async function listNodes(): Promise<{ node: string; status: string }[]> {
  return pve('GET', '/nodes');
}

// ── Snapshot operations ───────────────────────────────────────────────────

export async function listSnapshots(vmid: number): Promise<unknown[]> {
  return pve('GET', `/nodes/${node()}/qemu/${vmid}/snapshot`);
}

export async function createSnapshot(vmid: number, snapname: string, description?: string): Promise<ProxmoxTask> {
  return pve('POST', `/nodes/${node()}/qemu/${vmid}/snapshot`, {
    snapname,
    description: description ?? `Manual snapshot ${new Date().toISOString()}`,
    vmstate: 0,
  });
}

// ── Batch: get status for multiple VMIDs ─────────────────────────────────

export async function batchVMStatus(vmids: number[]): Promise<Map<number, ProxmoxVMStatus>> {
  const results = await Promise.allSettled(vmids.map(id => getVMStatus(id)));
  const map = new Map<number, ProxmoxVMStatus>();
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') map.set(vmids[i], r.value);
  });
  return map;
}
