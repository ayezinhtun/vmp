// Central state store using React Context

const StoreContext = React.createContext(null);
const useStore = () => React.useContext(StoreContext);

const CUSTOMERS_KEY = '__vpsmm_customers_v1';

const loadPersistedCustomers = () => {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || 'null'); } catch { return null; }
};

const initialState = () => {
  const persisted = loadPersistedCustomers();
  return ({
  customers: persisted || window.MOCK.CUSTOMERS.map(c => ({...c})),
  vms: window.MOCK.VMS.map(v => ({...v, interconnect: [...v.interconnect], tags: v.tags || []})),
  tasks: window.MOCK.TASKS.map(t => ({...t})),
  invoices: window.MOCK.INVOICES.map(i => ({...i, vms: [...i.vms]})),
  alerts: window.MOCK.ALERTS.map(a => ({...a})),
  team: window.MOCK.TEAM.map(t => ({...t})),
  activity: window.MOCK.ACTIVITY.map(a => ({...a})),
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
  });
};

const StoreProvider = ({ children }) => {
  const [state, setState] = React.useState(initialState);
  const [toasts, setToasts] = React.useState([]);
  const toastIdRef = React.useRef(1);

  // Persist customers (so signups survive refresh and appear to admin)
  React.useEffect(() => {
    try { localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(state.customers)); } catch {}
  }, [state.customers]);

  const toast = React.useCallback((msg, kind = 'info', action) => {
    const id = toastIdRef.current++;
    setToasts(t => [...t, { id, msg, kind, action }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  const logActivity = (text, kind = 'vm', actor = 'You') => {
    const now = new Date();
    const ts = `${now.toISOString().slice(0,10)} ${now.toTimeString().slice(0,5)}`;
    setState(s => ({ ...s, activity: [{ ts, actor, kind, text }, ...s.activity] }));
  };

  // ── VM mutators ─────────────────────────────────────────────────────────
  const addVM = (vm) => {
    const maxNum = state.vms.reduce((m, v) => { const n = parseInt((v.id || '').replace(/\D/g, '')); return n > m ? n : m; }, 2199);
    const id = `VM-${maxNum + 1}`;
    const newVM = { id, ...vm };
    setState(s => ({ ...s, vms: [newVM, ...s.vms] }));
    logActivity(`Created VM ${vm.name} (${id})`, 'vm');
    toast(`VM ${vm.name} created`, 'ok');
    return id;
  };
  const updateVM = (id, patch) => {
    setState(s => ({ ...s, vms: s.vms.map(v => v.id === id ? { ...v, ...patch } : v) }));
  };
  const deleteVM = (id) => {
    const vm = state.vms.find(v => v.id === id);
    setState(s => ({ ...s, vms: s.vms.filter(v => v.id !== id) }));
    logActivity(`Deleted VM ${vm?.name} (${id})`, 'vm');
    toast(`VM ${vm?.name} deleted`, 'bad');
  };
  const setVMStatus = (id, status, powerState) => {
    const vm = state.vms.find(v => v.id === id);
    updateVM(id, { status, ...(powerState ? { powerState } : {}) });
    logActivity(`${vm?.name} → ${status}`, 'vm');
    toast(`${vm?.name} is now ${status}`, status === 'Active' ? 'ok' : status === 'Suspended' ? 'warn' : 'info');
  };

  // ── Customer mutators ───────────────────────────────────────────────────
  const addCustomer = (c) => {
    const maxNum = state.customers.reduce((m, x) => { const n = parseInt((x.id || '').replace(/\D/g, '')); return n > m ? n : m; }, 1099);
    const id = `C-${maxNum + 1}`;
    const newC = {
      id, totalSpend: 0, status: 'Active', kyc: 'Pending', notes: '',
      since: new Date().toISOString().slice(0, 10),
      ...c,
    };
    setState(s => ({ ...s, customers: [newC, ...s.customers] }));
    logActivity(`Added customer ${c.name} (${c.company})`, 'customer');
    toast(`${c.name} added`, 'ok');
    return id;
  };
  const updateCustomer = (id, patch) => {
    setState(s => ({ ...s, customers: s.customers.map(c => c.id === id ? { ...c, ...patch } : c) }));
  };
  const setKYC = (id, decision) => {
    const c = state.customers.find(c => c.id === id);
    updateCustomer(id, { kyc: decision });
    logActivity(`KYC ${decision.toLowerCase()} for ${c?.name}`, 'customer');
    toast(`${c?.name} — KYC ${decision}`, decision === 'Approved' ? 'ok' : decision === 'Rejected' ? 'bad' : 'warn');
  };

  // ── Task mutators ───────────────────────────────────────────────────────
  const addTask = (t) => {
    const id = `TSK-${3300 + Math.floor(Math.random() * 600)}`;
    const newT = {
      id, status: 'Pending', priority: 'Normal', assignee: '—', team: 'Provisioning',
      created: new Date().toISOString().slice(0, 10),
      notes: '',
      ...t,
    };
    setState(s => ({ ...s, tasks: [newT, ...s.tasks] }));
    logActivity(`Created task ${id}: ${t.title}`, 'task');
    toast(`Task created: ${t.title}`, 'ok');
    return id;
  };
  const updateTask = (id, patch) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }));
  };

  // ── Provisioning workflow: advance a request through Phase-1 stages ──────
  // Stages: 0 Submitted · 1 Sales review/KYC · 2 KYC approved → notify Eng ·
  //         3 System: provision VM · 4 Network: firewall · 5 KT: credentials ·
  //         6 VM Ready (customer access)
  const advanceProvision = (id, parsedSpec) => {
    const t = state.tasks.find(x => x.id === id);
    if (!t) return;
    const stage = (t.wfStage || 0) + 1;
    const c = state.customers.find(c => c.id === t.customer);
    const notes = {
      1: { team: 'Sales', msg: `Sales reviewing ${t.id} — KYC check in progress`, kind: 'task', status: 'In Progress' },
      2: { team: 'Engineering', msg: `KYC approved for ${c?.company} — Engineering notified`, kind: 'customer', status: 'In Progress' },
      3: { team: 'Engineering', msg: `System team provisioning VM for ${c?.company}`, kind: 'vm', status: 'In Progress' },
      4: { team: 'Network', msg: `Network team configuring firewall rules`, kind: 'vm', status: 'In Progress' },
      5: { team: 'Engineering', msg: `KT testing VM & uploading credentials`, kind: 'vm', status: 'In Progress' },
      6: { team: 'Customer', msg: `${c?.company}: VM is ready — customer notified ✓`, kind: 'customer', status: 'Done' },
    }[stage];

    let patch = { wfStage: stage, status: notes?.status || t.status };

    // Stage 3: actually create the VM in the customer's account (sync to portal)
    if (stage === 3 && !t.createdVmId && parsedSpec) {
      const vmId = addVM(parsedSpec);
      patch.createdVmId = vmId;
    }
    // Stage 6: activate the VM so the customer can access it
    if (stage === 6 && t.createdVmId) {
      updateVM(t.createdVmId, { status: 'Active', powerState: 'Running' });
    }

    setState(s => ({ ...s, tasks: s.tasks.map(x => x.id === id ? { ...x, ...patch } : x) }));
    if (notes) { logActivity(notes.msg, notes.kind); toast(notes.msg, stage === 6 ? 'ok' : 'info'); }
  };
  const setProvisionStage = (id, stage) => {
    setState(s => ({ ...s, tasks: s.tasks.map(x => x.id === id ? { ...x, wfStage: stage } : x) }));
  };

  const deleteTask = (id) => {
    const t = state.tasks.find(t => t.id === id);
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
    logActivity(`Deleted task ${id}`, 'task');
    toast(`Task ${t?.title} deleted`, 'bad');
  };
  const moveTask = (id, status) => {
    const t = state.tasks.find(t => t.id === id);
    if (!t || t.status === status) return;
    updateTask(id, { status });
    logActivity(`${id} → ${status}`, 'task');
  };

  // ── Invoice mutators ────────────────────────────────────────────────────
  const addInvoice = (i) => {
    const id = `INV-2026-${String(420 + Math.floor(Math.random() * 80)).padStart(4, '0')}`;
    const newI = {
      id, status: 'Pending', method: '—', receipt: '—', currency: 'MMK',
      issued: new Date().toISOString().slice(0, 10),
      ...i,
    };
    setState(s => ({ ...s, invoices: [newI, ...s.invoices] }));
    logActivity(`Created invoice ${id}`, 'finance');
    toast(`Invoice ${id} created`, 'ok');
    return id;
  };
  const updateInvoice = (id, patch) => {
    setState(s => ({ ...s, invoices: s.invoices.map(i => i.id === id ? { ...i, ...patch } : i) }));
  };
  const markPaid = (id) => {
    const inv = state.invoices.find(i => i.id === id);
    updateInvoice(id, { status: 'Payment Received', receipt: `RCT-${id.slice(4)}` });
    logActivity(`Marked ${id} as paid`, 'finance');
    toast(`${id} marked paid`, 'ok');
  };

  // ── Team ────────────────────────────────────────────────────────────────
  const addMember = (m) => {
    const id = `U-${String(state.team.length + 1).padStart(2, '0')}`;
    setState(s => ({ ...s, team: [...s.team, { id, last: 'just now', status: 'Active', ...m }] }));
    logActivity(`Invited ${m.name} (${m.role})`, 'customer');
    toast(`Invited ${m.name}`, 'ok');
  };
  const updateMember = (id, patch) => {
    setState(s => ({ ...s, team: s.team.map(m => m.id === id ? { ...m, ...patch } : m) }));
  };
  const removeMember = (id) => {
    const m = state.team.find(m => m.id === id);
    setState(s => ({ ...s, team: s.team.filter(m => m.id !== id) }));
    toast(`Removed ${m?.name}`, 'bad');
  };

  // ── Alerts ──────────────────────────────────────────────────────────────
  const markAlertRead = (id) => {
    setState(s => ({ ...s, alerts: s.alerts.map(a => a.id === id ? { ...a, read: true } : a) }));
  };
  const markAllAlertsRead = () => {
    setState(s => ({ ...s, alerts: s.alerts.map(a => ({ ...a, read: true })) }));
    toast('All alerts marked read', 'info');
  };

  // ── Bulk renew / suspend ────────────────────────────────────────────────
  const bulkAction = (ids, action) => {
    if (action === 'suspend') ids.forEach(id => setVMStatus(id, 'Suspended', 'Stopped'));
    if (action === 'activate') ids.forEach(id => setVMStatus(id, 'Active', 'Running'));
    if (action === 'terminate') ids.forEach(id => setVMStatus(id, 'Expired', 'Stopped'));
    if (action === 'renew') {
      const newExpiry = new Date(window.MOCK.TODAY);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      ids.forEach(id => updateVM(id, { expiry: newExpiry.toISOString().slice(0, 10), status: 'Active' }));
      toast(`Renewed ${ids.length} VMs (1 year)`, 'ok');
      logActivity(`Bulk renew: ${ids.length} VMs`, 'vm');
    }
  };

  const renew = (id, months = 12) => {
    const vm = state.vms.find(v => v.id === id);
    const base = vm.expiry && vm.expiry !== '—' ? new Date(vm.expiry) : new Date(window.MOCK.TODAY);
    base.setMonth(base.getMonth() + months);
    updateVM(id, { expiry: base.toISOString().slice(0, 10), status: 'Active', powerState: 'Running' });
    logActivity(`Renewed ${vm?.name} for ${months} months`, 'vm');
    toast(`${vm?.name} renewed by ${months} months`, 'ok');
  };

  // ── VM power & snapshots ────────────────────────────────────────────────
  const startVM = (id) => {
    const vm = state.vms.find(v => v.id === id);
    updateVM(id, { powerState: 'Running', status: vm?.status === 'Suspended' ? 'Active' : vm?.status });
    logActivity(`Started ${vm?.name}`, 'vm');
    toast(`${vm?.name} is starting…`, 'ok');
  };
  const stopVM = (id) => {
    const vm = state.vms.find(v => v.id === id);
    updateVM(id, { powerState: 'Stopped' });
    logActivity(`Stopped ${vm?.name}`, 'vm');
    toast(`${vm?.name} is stopping…`, 'warn');
  };
  const restartVM = (id) => {
    const vm = state.vms.find(v => v.id === id);
    logActivity(`Restarted ${vm?.name}`, 'vm');
    toast(`${vm?.name} is restarting…`, 'info');
  };
  const snapshotVM = (id, name) => {
    const vm = state.vms.find(v => v.id === id);
    const snap = name || `manual-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 999)}`;
    logActivity(`Created snapshot ${snap} of ${vm?.name}`, 'vm');
    toast(`Snapshot created: ${snap}`, 'ok');
  };
  const updateVMTags = (id, tags) => updateVM(id, { tags });
  const updateVMNotes = (id, notes) => updateVM(id, { notes });

  // ── Tickets ─────────────────────────────────────────────────────────────
  const addTicket = (t) => {
    const id = `TKT-2026-${String(120 + Math.floor(Math.random() * 80)).padStart(3, '0')}`;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newT = { id, status: 'Open', priority: 'Normal', assignee: '—', created: now, updated: now, replies: [], ...t };
    setState(s => ({ ...s, tickets: [newT, ...s.tickets] }));
    logActivity(`Opened ticket ${id}: ${t.subject}`, 'customer');
    toast(`Ticket ${id} submitted — Sales will respond within 4 hours`, 'ok');
    return id;
  };
  const updateTicket = (id, patch) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState(s => ({ ...s, tickets: s.tickets.map(t => t.id === id ? { ...t, ...patch, updated: now } : t) }));
  };
  const setTicketStatus = (id, status) => {
    updateTicket(id, { status });
    const t = state.tickets.find(t => t.id === id);
    logActivity(`Ticket ${id} → ${status}`, 'customer');
    toast(`${id} marked ${status}`, status === 'Resolved' || status === 'Closed' ? 'ok' : 'info');
  };
  const replyTicket = (id, who, body) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState(s => ({
      ...s, tickets: s.tickets.map(t => t.id === id
        ? { ...t, updated: now, replies: [...t.replies, { who, when: now, body }] }
        : t)
    }));
    toast('Reply sent', 'ok');
  };
  const deleteTicket = (id) => {
    setState(s => ({ ...s, tickets: s.tickets.filter(t => t.id !== id) }));
    toast('Ticket deleted', 'bad');
  };

  const value = {
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
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

window.StoreProvider = StoreProvider;
window.useStore = useStore;
