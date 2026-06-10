/**
 * Zustand global store — auth session + real-time VM state.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer, VMInfo } from './types';

interface AuthState {
  accessToken:  string | null;
  customer:     (Customer & { vmIds: number[] }) | null;
  setSession:   (token: string, customer: Customer & { vmIds: number[] }) => void;
  clearSession: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken:  null,
      customer:     null,
      setSession:   (accessToken, customer) => {
        if (typeof window !== 'undefined') sessionStorage.setItem('accessToken', accessToken);
        set({ accessToken, customer });
      },
      clearSession: () => {
        if (typeof window !== 'undefined') sessionStorage.removeItem('accessToken');
        set({ accessToken: null, customer: null });
      },
    }),
    {
      name:    'vmp-auth',
      partialize: (s) => ({ customer: s.customer }),  // don't persist token
    },
  ),
);

// ── Real-time VM state ────────────────────────────────────────────────────
interface VMState {
  vms:       Map<number, VMInfo>;
  setVM:     (vm: VMInfo) => void;
  patchVM:   (vmId: number, patch: Partial<VMInfo>) => void;
  setAllVMs: (vms: VMInfo[]) => void;
}

export const useVMStore = create<VMState>((set) => ({
  vms: new Map(),

  setVM: (vm) => set((s) => {
    const next = new Map(s.vms);
    next.set(vm.vmId, vm);
    return { vms: next };
  }),

  patchVM: (vmId, patch) => set((s) => {
    const next = new Map(s.vms);
    const existing = next.get(vmId);
    if (existing) next.set(vmId, { ...existing, ...patch });
    return { vms: next };
  }),

  setAllVMs: (vms) => set(() => {
    const next = new Map<number, VMInfo>();
    vms.forEach(v => next.set(v.vmId, v));
    return { vms: next };
  }),
}));
