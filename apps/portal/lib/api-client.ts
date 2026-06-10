/**
 * Typed API client for VMP Portal → Middleware.
 * All calls go through /api/* which Nginx proxies to the middleware.
 */
import axios from 'axios';
import type { VMInfo, Ticket, Invoice, VMRequest, RRDPoint } from './types';

const http = axios.create({
  baseURL:         '/api',
  withCredentials: true,
  timeout:         15_000,
});

// ── Request interceptor: attach access token ──────────────────────────────
http.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('accessToken');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let refreshing: Promise<void> | null = null;

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = http.post('/auth/refresh')
          .then((r) => {
            sessionStorage.setItem('accessToken', r.data.data.accessToken);
          })
          .finally(() => { refreshing = null; });
      }
      await refreshing;
      return http(original);
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    http.post('/auth/login', { email, password }).then(r => r.data.data),

  register: (data: { name: string; email: string; password: string; company?: string; phone?: string }) =>
    http.post('/auth/register', data).then(r => r.data.data),

  logout: () => http.post('/auth/logout'),

  refresh: () =>
    http.post('/auth/refresh').then(r => {
      sessionStorage.setItem('accessToken', r.data.data.accessToken);
    }),
};

// ── VMs ───────────────────────────────────────────────────────────────────
export const vmApi = {
  list: (): Promise<VMInfo[]> =>
    http.get('/vms').then(r => r.data.data),

  get: (vmId: number): Promise<VMInfo> =>
    http.get(`/vms/${vmId}`).then(r => r.data.data),

  start: (vmId: number) =>
    http.post(`/vms/${vmId}/start`).then(r => r.data.data),

  stop: (vmId: number) =>
    http.post(`/vms/${vmId}/stop`).then(r => r.data.data),

  reboot: (vmId: number) =>
    http.post(`/vms/${vmId}/reboot`).then(r => r.data.data),

  shutdown: (vmId: number) =>
    http.post(`/vms/${vmId}/shutdown`).then(r => r.data.data),

  metrics: (vmId: number, timeframe = 'hour'): Promise<RRDPoint[]> =>
    http.get(`/vms/${vmId}/metrics?timeframe=${timeframe}`).then(r => r.data.data),

  snapshots: (vmId: number) =>
    http.get(`/vms/${vmId}/snapshots`).then(r => r.data.data),

  createSnapshot: (vmId: number, name?: string) =>
    http.post(`/vms/${vmId}/snapshots`, { name }).then(r => r.data.data),

  request: (spec: Record<string, unknown>): Promise<VMRequest> =>
    http.post('/vms/request', spec).then(r => r.data.data),

  listRequests: (): Promise<VMRequest[]> =>
    http.get('/vms/requests/list').then(r => r.data.data),
};

// ── Console ────────────────────────────────────────────────────────────────
export const consoleApi = {
  getTicket: (vmId: number): Promise<{ token: string; wsUrl: string; expiresIn: number }> =>
    http.post(`/console/${vmId}/ticket`).then(r => r.data.data),
};

// ── Customer ──────────────────────────────────────────────────────────────
export const customerApi = {
  me: () =>
    http.get('/customer/me').then(r => r.data.data),

  tickets: (): Promise<Ticket[]> =>
    http.get('/customer/me/tickets').then(r => r.data.data),

  createTicket: (data: { subject: string; body: string; priority: string; category: string }) =>
    http.post('/customer/me/tickets', data).then(r => r.data.data),

  replyTicket: (id: string, body: string) =>
    http.post(`/customer/me/tickets/${id}/reply`, { body }),

  invoices: (): Promise<Invoice[]> =>
    http.get('/customer/me/invoices').then(r => r.data.data),
};
