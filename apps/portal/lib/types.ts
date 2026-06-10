// ── Shared portal types ───────────────────────────────────────────────────

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

export interface VMInfo {
  vmId: number;
  legacyId?: string;
  name: string;
  node: string;
  status: 'running' | 'stopped' | 'paused' | 'unknown';
  cpu: number;          // 0–100 %
  ramUsed: number;      // bytes
  ramTotal: number;     // bytes
  diskUsed: number;
  diskTotal: number;
  uptime: number;       // seconds
  netIn: number;
  netOut: number;
  config?: Record<string, unknown>;
}

export interface RRDPoint {
  time: number;
  cpu?: number;
  mem?: number;
  netin?: number;
  netout?: number;
  diskread?: number;
  diskwrite?: number;
}

export interface Ticket {
  id: string;
  legacyId?: string;
  subject: string;
  body?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  category?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  replies?: TicketReply[];
}

export interface TicketReply {
  id: string;
  authorName?: string;
  authorType: 'customer' | 'staff';
  message: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  legacyId?: string;
  totalAmount: number;
  currency?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface VMRequest {
  id: string;
  hostname: string;
  purpose?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  vcpu: number;
  ramGb: number;
  osName?: string;
  osVersion?: string;
  zone?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface AuthSession {
  accessToken: string;
  customer: Customer & { vmIds: number[] };
}

// WebSocket event shapes
export type WSVMStatus = {
  type: 'vm:status';
  vmId: number;
  payload: Partial<VMInfo>;
};

export type WSVMMetrics = {
  type: 'vm:metrics';
  vmId: number;
  payload: RRDPoint[];
};

export type WSEvent = WSVMStatus | WSVMMetrics;
