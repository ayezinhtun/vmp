import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { MOCK } from './data'

interface StoreContextValue {
  state: AppState
  toast: (msg: string, kind?: string, action?: any) => void
  toasts: Toast[]
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>
  addVM: (vm: any) => string
  updateVM: (id: string, patch: any) => void
  deleteVM: (id: string) => void
  setVMStatus: (id: string, status: string, powerState?: string) => void
  renew: (id: string, months?: number) => void
  bulkAction: (ids: string[], action: string) => void
  startVM: (id: string) => void
  stopVM: (id: string) => void
  restartVM: (id: string) => void
  snapshotVM: (id: string, name?: string) => void
  updateVMTags: (id: string, tags: string[]) => void
  updateVMNotes: (id: string, notes: string) => void
  addCustomer: (c: any) => string
  updateCustomer: (id: string, patch: any) => void
  setKYC: (id: string, decision: string) => void
  addTask: (t: any) => string
  updateTask: (id: string, patch: any) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: string) => void
  advanceProvision: (id: string, parsedSpec?: any) => void
  setProvisionStage: (id: string, stage: number) => void
  addInvoice: (i: any) => string
  updateInvoice: (id: string, patch: any) => void
  markPaid: (id: string) => void
  addMember: (m: any) => void
  updateMember: (id: string, patch: any) => void
  removeMember: (id: string) => void
  markAlertRead: (id: string) => void
  markAllAlertsRead: () => void
  addTicket: (t: any) => string
  updateTicket: (id: string, patch: any) => void
  setTicketStatus: (id: string, status: string) => void
  replyTicket: (id: string, who: string, body: string) => void
  deleteTicket: (id: string) => void
  logActivity: (text: string, kind?: string, actor?: string) => void
}

interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  kyc: string
  since: string
  totalSpend: number
  salesperson: string
  status: string
  notes: string
}

interface VM {
  id: string
  name: string
  customer: string
  type: string
  status: string
  powerState: string
  vcpu: number
  ram: number
  storage: number
  bandwidth: string
  os: string
  publicAccess: boolean
  interconnect: string[]
  portForward: string
  publicIp: string
  vlan: string
  datacenter: string
  node: string
  start: string
  expiry: string
  firewallPolicy: string
  backup: string
  proxmoxFlag: string
  security: boolean
  notes: string
  subscription: string
  priceMonth: number
}

interface Task {
  id: string
  title: string
  customer: string
  vm: string
  type: string
  priority: string
  assignee: string
  team: string
  status: string
  subscription: string
  created: string
  notes: string
  wfStage?: number
  createdVmId?: string
}

interface Invoice {
  id: string
  customer: string
  vms: string[]
  amount: number
  currency: string
  issued: string
  due: string
  status: string
  method: string
  receipt: string
}

interface Activity {
  ts: string
  actor: string
  kind: string
  text: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  team: string
  last: string
  status: string
}

interface Alert {
  id: string
  sev: string
  title: string
  body: string
  ts: string
  read: boolean
  type: string
}

interface Ticket {
  id: string
  customer: string
  subject: string
  body: string
  priority: string
  status: string
  created: string
  updated: string
  assignee: string
  replies: Array<{ who: string; when: string; body: string }>
}

interface Toast {
  id: number
  msg: string
  kind: string
  action?: any
}

interface AppState {
  customers: Customer[]
  vms: VM[]
  tasks: Task[]
  invoices: Invoice[]
  alerts: Alert[]
  team: TeamMember[]
  activity: Activity[]
  tickets: Ticket[]
}

const StoreContext = createContext<StoreContextValue | null>(null)

const CUSTOMERS_KEY = '__vpsmm_customers_v1'

const loadPersistedCustomers = () => {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || 'null') } catch { return null }
}

const initialState = (): AppState => {
  const persisted = loadPersistedCustomers()
  return ({
    customers: persisted || MOCK.CUSTOMERS.map((c: Customer) => ({...c})),
    vms: MOCK.VMS.map((v: VM) => ({...v, interconnect: [...v.interconnect], tags: (v as any).tags || []})),
    tasks: MOCK.TASKS.map((t: Task) => ({...t})),
    invoices: MOCK.INVOICES.map((i: Invoice) => ({...i, vms: [...i.vms]})),
    alerts: MOCK.ALERTS.map((a: Alert) => ({...a})),
    team: MOCK.TEAM.map((t: TeamMember) => ({...t})),
    activity: MOCK.ACTIVITY.map((a: Activity) => ({...a})),
    tickets: [
      { id: 'TKT-2026-118', customer: 'C-1043', subject: 'SSL certificate renewal question', body: 'Hi team, my certificate for yfg-app-01 expires next month. Can you walk me through renewal?', priority: 'Normal', status: 'In Progress', created: '2026-05-25 10:30', updated: '2026-05-26 14:08', assignee: 'Ko Naing', replies: [
        { who: 'Ko Naing', when: '2026-05-25 11:15', body: 'Hi Thiri, we manage the cert via Let\'s Encrypt with auto-renewal. I\'ll send the runbook link.' },
        { who: 'Thiri Ko', when: '2026-05-26 09:42', body: 'Thanks! Could we schedule a 15-min call to walk through it?' },
        { who: 'Ko Naing', when: '2026-05-26 14:08', body: 'Sure — booked 30 May 10:00 ICT. Calendar invite sent.' },
      ]},
      { id: 'TKT-2026-115', customer: 'C-1043', subject: 'Storage upgrade for yfg-db-01', body: 'We\'re running low on disk space. Can we add 500 GB to yfg-db-01?', priority: 'Normal', status: 'Resolved', created: '2026-05-12 09:00', updated: '2026-05-13 16:20', assignee: 'Ko Naing', replies: [
        { who: 'Ko Naing', when: '2026-05-12 10:00', body: 'Confirmed. Scheduling spec change for tonight\'s maintenance window.' },
        { who: 'Ko Naing', when: '2026-05-13 16:20', body: 'Done — storage upgraded to 2 TB. Invoice adjusted accordingly.' },
      ]},
      { id: 'TKT-2026-110', customer: 'C-1042', subject: 'Backup retention policy', body: 'Need to extend backup retention to 30 days for compliance.', priority: 'Urgent', status: 'Open', created: '2026-05-26 15:00', updated: '2026-05-26 15:00', assignee: '—', replies: [] },
    ],
  })
}

export const useStore = (): StoreContextValue => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}

const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<AppState>(initialState)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(1)

  React.useEffect(() => {
    try { localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(state.customers)) } catch {}
  }, [state.customers])

  const toast = useCallback((msg: string, kind = 'info', action?: any) => {
    const id = toastIdRef.current++
    setToasts(t => [...t, { id, msg, kind, action }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200)
  }, [])

  const logActivity = (text: string, kind = 'vm', actor = 'You') => {
    const now = new Date()
    const ts = `${now.toISOString().slice(0,10)} ${now.toTimeString().slice(0,5)}`
    setState(s => ({ ...s, activity: [{ ts, actor, kind, text }, ...s.activity] }))
  }

  const addVM = (vm: any) => {
    const maxNum = state.vms.reduce((m, v) => { const n = parseInt((v.id || '').replace(/\D/g, '')); return n > m ? n : m; }, 2199)
    const id = `VM-${maxNum + 1}`
    const newVM = { id, ...vm }
    setState(s => ({ ...s, vms: [newVM, ...s.vms] }))
    logActivity(`Created VM ${vm.name} (${id})`, 'vm')
    toast(`VM ${vm.name} created`, 'ok')
    return id
  }

  const updateVM = (id: string, patch: any) => {
    setState(s => ({ ...s, vms: s.vms.map(v => v.id === id ? { ...v, ...patch } : v) }))
  }

  const deleteVM = (id: string) => {
    const vm = state.vms.find(v => v.id === id)
    setState(s => ({ ...s, vms: s.vms.filter(v => v.id !== id) }))
    logActivity(`Deleted VM ${vm?.name} (${id})`, 'vm')
    toast(`VM ${vm?.name} deleted`, 'bad')
  }

  const setVMStatus = (id: string, status: string, powerState?: string) => {
    const vm = state.vms.find(v => v.id === id)
    updateVM(id, { status, ...(powerState ? { powerState } : {}) })
    logActivity(`${vm?.name} → ${status}`, 'vm')
    toast(`${vm?.name} is now ${status}`, status === 'Active' ? 'ok' : status === 'Suspended' ? 'warn' : 'info')
  }

  const addCustomer = (c: any) => {
    const maxNum = state.customers.reduce((m, x) => { const n = parseInt((x.id || '').replace(/\D/g, '')); return n > m ? n : m; }, 1099)
    const id = `C-${maxNum + 1}`
    const newC = {
      id, totalSpend: 0, status: 'Active', kyc: 'Pending', notes: '',
      since: new Date().toISOString().slice(0, 10),
      ...c,
    }
    setState(s => ({ ...s, customers: [newC, ...s.customers] }))
    logActivity(`Added customer ${c.name} (${c.company})`, 'customer')
    toast(`${c.name} added`, 'ok')
    return id
  }

  const updateCustomer = (id: string, patch: any) => {
    setState(s => ({ ...s, customers: s.customers.map(c => c.id === id ? { ...c, ...patch } : c) }))
  }

  const setKYC = (id: string, decision: string) => {
    const c = state.customers.find(c => c.id === id)
    updateCustomer(id, { kyc: decision })
    logActivity(`KYC ${decision.toLowerCase()} for ${c?.name}`, 'customer')
    toast(`${c?.name} — KYC ${decision}`, decision === 'Approved' ? 'ok' : decision === 'Rejected' ? 'bad' : 'warn')
  }

  const addTask = (t: any) => {
    const id = `TSK-${3300 + Math.floor(Math.random() * 600)}`
    const newT = {
      id, status: 'Pending', priority: 'Normal', assignee: '—', team: 'Provisioning',
      created: new Date().toISOString().slice(0, 10),
      notes: '',
      ...t,
    }
    setState(s => ({ ...s, tasks: [newT, ...s.tasks] }))
    logActivity(`Created task ${id}: ${t.title}`, 'task')
    toast(`Task created: ${t.title}`, 'ok')
    return id
  }

  const updateTask = (id: string, patch: any) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }))
  }

  const advanceProvision = (id: string, parsedSpec?: any) => {
    const t = state.tasks.find(x => x.id === id)
    if (!t) return
    const stage = (t.wfStage || 0) + 1
    const c = state.customers.find(c => c.id === t.customer)
    const notes: any = {
      1: { team: 'Sales', msg: `Sales reviewing ${t.id} — KYC check in progress`, kind: 'task', status: 'In Progress' },
      2: { team: 'Engineering', msg: `KYC approved for ${c?.company} — Engineering notified`, kind: 'customer', status: 'In Progress' },
      3: { team: 'Engineering', msg: `System team provisioning VM for ${c?.company}`, kind: 'vm', status: 'In Progress' },
      4: { team: 'Network', msg: `Network team configuring firewall rules`, kind: 'vm', status: 'In Progress' },
      5: { team: 'Engineering', msg: `KT testing VM & uploading credentials`, kind: 'vm', status: 'In Progress' },
      6: { team: 'Customer', msg: `${c?.company}: VM is ready — customer notified ✓`, kind: 'customer', status: 'Done' },
    }[stage]

    let patch: any = { wfStage: stage, status: notes?.status || t.status }

    if (stage === 3 && !t.createdVmId && parsedSpec) {
      const vmId = addVM(parsedSpec)
      patch.createdVmId = vmId
    }
    if (stage === 6 && t.createdVmId) {
      updateVM(t.createdVmId, { status: 'Active', powerState: 'Running' })
    }

    setState(s => ({ ...s, tasks: s.tasks.map(x => x.id === id ? { ...x, ...patch } : x) }))
    if (notes) { logActivity(notes.msg, notes.kind); toast(notes.msg, stage === 6 ? 'ok' : 'info') }
  }

  const setProvisionStage = (id: string, stage: number) => {
    setState(s => ({ ...s, tasks: s.tasks.map(x => x.id === id ? { ...x, wfStage: stage } : x) }))
  }

  const deleteTask = (id: string) => {
    const t = state.tasks.find(t => t.id === id)
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }))
    logActivity(`Deleted task ${id}`, 'task')
    toast(`Task ${t?.title} deleted`, 'bad')
  }

  const moveTask = (id: string, status: string) => {
    const t = state.tasks.find(t => t.id === id)
    if (!t || t.status === status) return
    updateTask(id, { status })
    logActivity(`${id} → ${status}`, 'task')
  }

  const addInvoice = (i: any) => {
    const id = `INV-2026-${String(420 + Math.floor(Math.random() * 80)).padStart(4, '0')}`
    const newI = {
      id, status: 'Pending', method: '—', receipt: '—', currency: 'MMK',
      issued: new Date().toISOString().slice(0, 10),
      ...i,
    }
    setState(s => ({ ...s, invoices: [newI, ...s.invoices] }))
    logActivity(`Created invoice ${id}`, 'finance')
    toast(`Invoice ${id} created`, 'ok')
    return id
  }

  const updateInvoice = (id: string, patch: any) => {
    setState(s => ({ ...s, invoices: s.invoices.map(i => i.id === id ? { ...i, ...patch } : i) }))
  }

  const markPaid = (id: string) => {
    if (!state.invoices.find(i => i.id === id)) return
    updateInvoice(id, { status: 'Payment Received', receipt: `RCT-${id.slice(4)}` })
    logActivity(`Marked ${id} as paid`, 'finance')
    toast(`${id} marked paid`, 'ok')
  }

  const addMember = (m: any) => {
    const id = `U-${String(state.team.length + 1).padStart(2, '0')}`
    setState(s => ({ ...s, team: [...s.team, { id, last: 'just now', status: 'Active', ...m }] }))
    logActivity(`Invited ${m.name} (${m.role})`, 'customer')
    toast(`Invited ${m.name}`, 'ok')
  }

  const updateMember = (id: string, patch: any) => {
    setState(s => ({ ...s, team: s.team.map(m => m.id === id ? { ...m, ...patch } : m) }))
  }

  const removeMember = (id: string) => {
    const m = state.team.find(m => m.id === id)
    setState(s => ({ ...s, team: s.team.filter(m => m.id !== id) }))
    toast(`Removed ${m?.name}`, 'bad')
  }

  const markAlertRead = (id: string) => {
    setState(s => ({ ...s, alerts: s.alerts.map(a => a.id === id ? { ...a, read: true } : a) }))
  }

  const markAllAlertsRead = () => {
    setState(s => ({ ...s, alerts: s.alerts.map(a => ({ ...a, read: true })) }))
    toast('All alerts marked read', 'info')
  }

  const bulkAction = (ids: string[], action: string) => {
    if (action === 'suspend') ids.forEach(id => setVMStatus(id, 'Suspended', 'Stopped'))
    if (action === 'activate') ids.forEach(id => setVMStatus(id, 'Active', 'Running'))
    if (action === 'terminate') ids.forEach(id => setVMStatus(id, 'Expired', 'Stopped'))
    if (action === 'renew') {
      const newExpiry = new Date(MOCK.TODAY)
      newExpiry.setFullYear(newExpiry.getFullYear() + 1)
      ids.forEach(id => updateVM(id, { expiry: newExpiry.toISOString().slice(0, 10), status: 'Active' }))
      toast(`Renewed ${ids.length} VMs (1 year)`, 'ok')
      logActivity(`Bulk renew: ${ids.length} VMs`, 'vm')
    }
  }

  const renew = (id: string, months = 12) => {
    const vm = state.vms.find(v => v.id === id)
    if (!vm) return
    const base = vm.expiry && vm.expiry !== '—' ? new Date(vm.expiry) : new Date(MOCK.TODAY)
    base.setMonth(base.getMonth() + months)
    updateVM(id, { expiry: base.toISOString().slice(0, 10), status: 'Active', powerState: 'Running' })
    logActivity(`Renewed ${vm.name} for ${months} months`, 'vm')
    toast(`${vm.name} renewed by ${months} months`, 'ok')
  }

  const startVM = (id: string) => {
    const vm = state.vms.find(v => v.id === id)
    updateVM(id, { powerState: 'Running', status: vm?.status === 'Suspended' ? 'Active' : vm?.status })
    logActivity(`Started ${vm?.name}`, 'vm')
    toast(`${vm?.name} is starting…`, 'ok')
  }

  const stopVM = (id: string) => {
    const vm = state.vms.find(v => v.id === id)
    updateVM(id, { powerState: 'Stopped' })
    logActivity(`Stopped ${vm?.name}`, 'vm')
    toast(`${vm?.name} is stopping…`, 'warn')
  }

  const restartVM = (id: string) => {
    const vm = state.vms.find(v => v.id === id)
    logActivity(`Restarted ${vm?.name}`, 'vm')
    toast(`${vm?.name} is restarting…`, 'info')
  }

  const snapshotVM = (id: string, name?: string) => {
    const vm = state.vms.find(v => v.id === id)
    const snap = name || `manual-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 999)}`
    logActivity(`Created snapshot ${snap} of ${vm?.name}`, 'vm')
    toast(`Snapshot created: ${snap}`, 'ok')
  }

  const updateVMTags = (id: string, tags: string[]) => updateVM(id, { tags })
  const updateVMNotes = (id: string, notes: string) => updateVM(id, { notes })

  const addTicket = (t: any) => {
    const id = `TKT-2026-${String(120 + Math.floor(Math.random() * 80)).padStart(3, '0')}`
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const newT = { id, status: 'Open', priority: 'Normal', assignee: '—', created: now, updated: now, replies: [], ...t }
    setState(s => ({ ...s, tickets: [newT, ...s.tickets] }))
    logActivity(`Opened ticket ${id}: ${t.subject}`, 'customer')
    toast(`Ticket ${id} submitted — Sales will respond within 4 hours`, 'ok')
    return id
  }

  const updateTicket = (id: string, patch: any) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    setState(s => ({ ...s, tickets: s.tickets.map(t => t.id === id ? { ...t, ...patch, updated: now } : t) }))
  }

  const setTicketStatus = (id: string, status: string) => {
    updateTicket(id, { status })
    if (!state.tickets.find(t => t.id === id)) return
    logActivity(`Ticket ${id} → ${status}`, 'customer')
    toast(`${id} marked ${status}`, status === 'Resolved' || status === 'Closed' ? 'ok' : 'info')
  }

  const replyTicket = (id: string, who: string, body: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    setState(s => ({
      ...s, tickets: s.tickets.map(t => t.id === id
        ? { ...t, updated: now, replies: [...t.replies, { who, when: now, body }] }
        : t)
    }))
    toast('Reply sent', 'ok')
  }

  const deleteTicket = (id: string) => {
    setState(s => ({ ...s, tickets: s.tickets.filter(t => t.id !== id) }))
    toast('Ticket deleted', 'bad')
  }

  const value: StoreContextValue = {
    state,
    toast, toasts, setToasts,
    addVM, updateVM, deleteVM, setVMStatus, renew, bulkAction,
    startVM, stopVM, restartVM, snapshotVM, updateVMTags, updateVMNotes,
    addCustomer, updateCustomer, setKYC,
    addTask, updateTask, deleteTask, moveTask, advanceProvision, setProvisionStage,
    addInvoice, updateInvoice, markPaid,
    addMember, updateMember, removeMember,
    markAlertRead, markAllAlertsRead,
    addTicket, updateTicket, setTicketStatus, replyTicket, deleteTicket,
    logActivity,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export default StoreProvider
