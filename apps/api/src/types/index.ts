// ── Shared types used across API middleware ───────────────────────────────

export interface Customer {
  id: string;
  legacyId?: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  kycStatus: 'Pending' | 'Approved' | 'Rejected';
  salesperson?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface VMAssignment {
  vmId: number;        // Proxmox VMID
  legacyVm?: string;   // VM-2091
  nodeName: string;
  hostname?: string;
}

// JWT payload — embedded in every access token
export interface JWTPayload {
  sub: string;          // customer UUID
  email: string;
  name: string;
  kycStatus: string;
  vmIds: number[];      // allowed Proxmox VMIDs
  iat?: number;
  exp?: number;
}

// Proxmox API response shapes
export interface ProxmoxVMStatus {
  vmid: number;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  uptime: number;
  cpu: number;          // 0–1 fraction
  mem: number;          // bytes used
  maxmem: number;       // bytes total
  disk: number;
  maxdisk: number;
  netin: number;
  netout: number;
  node: string;
}

export interface ProxmoxRRDData {
  time: number;
  cpu?: number;
  mem?: number;
  netin?: number;
  netout?: number;
  diskread?: number;
  diskwrite?: number;
}

export interface ProxmoxVNCProxy {
  ticket: string;
  port: number;
  cert: string;
  user: string;
}

export interface ProxmoxTask {
  upid: string;         // Proxmox task ID
}

// Normalised VM object sent to portal
export interface VMInfo {
  vmId: number;
  legacyId?: string;
  name: string;
  node: string;
  status: 'running' | 'stopped' | 'paused' | 'unknown';
  cpu: number;
  ramUsed: number;
  ramTotal: number;
  diskUsed: number;
  diskTotal: number;
  uptime: number;
  netIn: number;
  netOut: number;
}

// Real-time event pushed over WebSocket
export interface WSEvent {
  type: 'vm:status' | 'vm:metrics' | 'task:update' | 'alert';
  vmId?: number;
  payload: unknown;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
