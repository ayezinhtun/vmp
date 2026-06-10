/**
 * Mock Proxmox PVE REST API
 * Mimics https://pve.proxmox.com/pve-docs/api-viewer/
 * Used for local development when real Proxmox is not available.
 *
 * Listens on :8006 (same port as real Proxmox)
 * Responds to all endpoints the VMP API middleware calls.
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = process.env.PORT || 8006;
const NODE = 'pve';

// ── In-memory VM store ─────────────────────────────────────────────────────
const vms = new Map([
  [100, {
    vmid: 100, name: 'web-prod-01', status: 'running', node: NODE,
    cpu: 0.12, mem: 2_147_483_648, maxmem: 4_294_967_296,
    disk: 10_737_418_240, maxdisk: 107_374_182_400,
    uptime: 86400 * 3, netin: 15_000, netout: 8_000,
    config: { cores: 2, sockets: 1, memory: 4096, ostype: 'l26', net0: 'virtio,bridge=vmbr0' },
  }],
  [101, {
    vmid: 101, name: 'db-mysql-01', status: 'running', node: NODE,
    cpu: 0.35, mem: 6_442_450_944, maxmem: 8_589_934_592,
    disk: 32_212_254_720, maxdisk: 214_748_364_800,
    uptime: 86400 * 14, netin: 5_000, netout: 2_000,
    config: { cores: 4, sockets: 1, memory: 8192, ostype: 'l26', net0: 'virtio,bridge=vmbr0' },
  }],
  [102, {
    vmid: 102, name: 'dev-staging', status: 'stopped', node: NODE,
    cpu: 0, mem: 0, maxmem: 2_147_483_648,
    disk: 5_368_709_120, maxdisk: 53_687_091_200,
    uptime: 0, netin: 0, netout: 0,
    config: { cores: 2, sockets: 1, memory: 2048, ostype: 'l26' },
  }],
]);

// Per-VM snapshots
const snapshots = new Map([
  [100, [{ name: 'snap-2026-06-01', description: 'Before nginx upgrade', snaptime: 1748736000 }]],
  [101, [{ name: 'weekly-backup',   description: 'Automated weekly',     snaptime: 1748822400 }]],
  [102, []],
]);

// ── Pending tasks ──────────────────────────────────────────────────────────
let taskCounter = 1;
const pendingTasks = new Map();

function makeUpid(vmid, action) {
  const id = String(taskCounter++).padStart(8, '0');
  return `UPID:${NODE}:${id}:${Date.now().toString(16)}:${action}:${vmid}:root@pam:`;
}

// Simulate async VM power change
function applyPowerAction(vmid, action) {
  const vm = vms.get(vmid);
  if (!vm) return;
  const delay = 1500 + Math.random() * 1000;
  setTimeout(() => {
    if (action === 'start')    { vm.status = 'running'; vm.uptime = 0; }
    if (action === 'stop')     { vm.status = 'stopped'; vm.uptime = 0; vm.cpu = 0; vm.mem = 0; }
    if (action === 'shutdown') { vm.status = 'stopped'; vm.uptime = 0; vm.cpu = 0; vm.mem = 0; }
    if (action === 'reboot')   { vm.status = 'running'; vm.uptime = 0; }
    if (action === 'reset')    { vm.status = 'running'; vm.uptime = 0; }
    console.log(`[mock-pve] VM ${vmid} ${action} → ${vm.status}`);
  }, delay);
}

// Simulate CPU/mem fluctuation for running VMs
setInterval(() => {
  for (const vm of vms.values()) {
    if (vm.status === 'running') {
      vm.cpu     = Math.max(0.01, Math.min(0.95, vm.cpu + (Math.random() - 0.5) * 0.05));
      vm.mem     = Math.min(vm.maxmem * 0.9, Math.max(vm.maxmem * 0.1, vm.mem + (Math.random() - 0.5) * 100_000_000));
      vm.uptime += 2;
      vm.netin  += Math.random() * 5000;
      vm.netout += Math.random() * 3000;
    }
  }
}, 2000);

// ── Request router ─────────────────────────────────────────────────────────
function route(method, pathname, body, res) {
  const seg = pathname.replace(/^\/api2\/json/, '').split('/').filter(Boolean);
  // seg[0]=nodes, seg[1]=pve, seg[2]=qemu, seg[3]=vmid, seg[4]=action...

  // GET /api2/json/version
  if (method === 'GET' && seg[0] === 'version') {
    return ok(res, { version: '8.1.0', release: '8', repoid: 'mock' });
  }

  // GET /nodes  (only when no further segments)
  if (method === 'GET' && seg[0] === 'nodes' && !seg[1]) {
    return ok(res, [{ node: NODE, status: 'online', uptime: 99999, cpu: 0.05, maxcpu: 16, mem: 34_359_738_368, maxmem: 68_719_476_736 }]);
  }

  // GET /nodes/pve/qemu  — list all VMs
  if (method === 'GET' && seg[0] === 'nodes' && seg[2] === 'qemu' && !seg[3]) {
    return ok(res, [...vms.values()].map(v => ({
      vmid: v.vmid, name: v.name, status: v.status, node: v.node,
      cpu: v.cpu, mem: v.mem, maxmem: v.maxmem,
      disk: v.disk, maxdisk: v.maxdisk,
      uptime: v.uptime, netin: v.netin, netout: v.netout,
    })));
  }

  // GET /nodes/pve/qemu/:vmid/status/current
  if (method === 'GET' && seg[0] === 'nodes' && seg[2] === 'qemu' && seg[4] === 'status' && seg[5] === 'current') {
    const vmid = parseInt(seg[3]);
    const vm   = vms.get(vmid);
    if (!vm) return notFound(res);
    return ok(res, { ...vm });
  }

  // POST /nodes/pve/qemu/:vmid/status/:action
  if (method === 'POST' && seg[0] === 'nodes' && seg[2] === 'qemu' && seg[4] === 'status') {
    const vmid   = parseInt(seg[3]);
    const action = seg[5];
    const vm     = vms.get(vmid);
    if (!vm) return notFound(res);
    const upid = makeUpid(vmid, action);
    applyPowerAction(vmid, action);
    console.log(`[mock-pve] POST status/${action} VM ${vmid} → task ${upid}`);
    return ok(res, { upid, node: NODE, type: 'qmstatus', id: String(vmid), user: 'root@pam', starttime: Math.floor(Date.now()/1000) });
  }

  // GET /nodes/pve/qemu/:vmid/config
  if (method === 'GET' && seg[0] === 'nodes' && seg[2] === 'qemu' && seg[4] === 'config') {
    const vm = vms.get(parseInt(seg[3]));
    if (!vm) return notFound(res);
    return ok(res, vm.config ?? {});
  }

  // GET /nodes/pve/qemu/:vmid/rrddata  — RRD metrics
  if (method === 'GET' && seg[0] === 'nodes' && seg[2] === 'qemu' && seg[4] === 'rrddata') {
    const vm   = vms.get(parseInt(seg[3]));
    const now  = Math.floor(Date.now() / 1000);
    const pts  = 60;
    const data = Array.from({ length: pts }, (_, i) => ({
      time:   now - (pts - i) * 60,
      cpu:    vm?.status === 'running' ? 0.05 + Math.random() * 0.3 : 0,
      mem:    vm?.status === 'running' ? (vm.mem / vm.maxmem) + (Math.random() - 0.5) * 0.05 : 0,
      netin:  vm?.status === 'running' ? Math.random() * 50000 : 0,
      netout: vm?.status === 'running' ? Math.random() * 30000 : 0,
      diskread:  vm?.status === 'running' ? Math.random() * 10000 : 0,
      diskwrite: vm?.status === 'running' ? Math.random() * 5000  : 0,
    }));
    return ok(res, data);
  }

  // GET /nodes/pve/qemu/:vmid/snapshot
  if (method === 'GET' && seg[0] === 'nodes' && seg[2] === 'qemu' && seg[4] === 'snapshot') {
    const vmid = parseInt(seg[3]);
    return ok(res, snapshots.get(vmid) ?? []);
  }

  // POST /nodes/pve/qemu/:vmid/snapshot
  if (method === 'POST' && seg[0] === 'nodes' && seg[2] === 'qemu' && seg[4] === 'snapshot') {
    const vmid    = parseInt(seg[3]);
    const snapName = body?.snapname ?? `snap-${Date.now()}`;
    const list     = snapshots.get(vmid) ?? [];
    list.unshift({ name: snapName, description: body?.description ?? '', snaptime: Math.floor(Date.now()/1000) });
    snapshots.set(vmid, list);
    const upid = makeUpid(vmid, 'snapshot');
    return ok(res, upid);
  }

  // GET /nodes/pve/tasks/:upid/status
  if (method === 'GET' && seg[0] === 'nodes' && seg[2] === 'tasks') {
    return ok(res, { upid: seg[3], status: 'stopped', exitstatus: 'OK', node: NODE });
  }

  // Fallback
  console.log(`[mock-pve] UNHANDLED ${method} ${pathname}`);
  return ok(res, null);
}

// ── HTTP helpers ────────────────────────────────────────────────────────────
function ok(res, data)       { json(res, 200, { data }); }
function notFound(res)       { json(res, 404, { errors: { vmid: 'not found' } }); }
function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

// ── Server ─────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE' });
    return res.end();
  }

  // Auth check (accept any token in dev)
  const auth = req.headers['authorization'] ?? '';
  if (!auth.startsWith('PVEAPIToken=') && !auth.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ errors: { permission: 'Permission check failed' } }));
  }

  // Parse body
  let body = {};
  if (req.method === 'POST') {
    await new Promise(resolve => {
      let raw = '';
      req.on('data', c => raw += c);
      req.on('end', () => { try { body = JSON.parse(raw); } catch {} resolve(); });
    });
  }

  const { pathname, query } = url.parse(req.url, true);
  route(req.method, pathname, { ...body, ...query }, res);
});

server.listen(PORT, () => {
  console.log(`[mock-proxmox] PVE mock API running on http://localhost:${PORT}`);
  console.log(`[mock-proxmox] VMs: ${[...vms.keys()].join(', ')}`);
  console.log(`[mock-proxmox] Auth: any PVEAPIToken= header accepted`);
});
