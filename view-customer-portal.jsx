// Customer portal — sidebar layout with full features
// Nav: Dashboard, Request VM, My VMs, My requests, Invoices, Support/Tickets, Account
// VM list opens a full Details page (not modal); tickets have create/update/view/status CRUD.

const CustomerPortal = () => {
  const { state, addTask, toast } = useStore();
  const auth = typeof useAuth === 'function' ? useAuth() : null;
  // Customer identity: from auth (newly registered users) OR fall back to demo customer
  const meId = auth?.user?.customerId || 'C-1043';
  const me = state.customers.find(c => c.id === meId) || state.customers.find(c => c.id === 'C-1043');
  if (!me) return <div className="content"><div className="empty"><div className="title">Account not found</div><div className="sub">Try signing out and back in.</div></div></div>;
  const myVMs = state.vms.filter(v => v.customer === meId);
  const myInvs = state.invoices.filter(i => i.customer === meId);
  const myTickets = state.tickets.filter(t => t.customer === meId);
  const myRequests = state.tasks.filter(t => t.customer === meId && t.notes && t.notes.includes('Customer-initiated'));

  const [view, setView] = React.useState('dashboard');
  const [detailVm, setDetailVm] = React.useState(null);
  const [openTicket, setOpenTicket] = React.useState(null);
  const [detailRequest, setDetailRequest] = React.useState(null);
  const [detailInvoice, setDetailInvoice] = React.useState(null);
  const [renewVm, setRenewVm] = React.useState(null);

  const expiringSoon = myVMs.filter(v => {
    if (!v.expiry || v.expiry === '—') return false;
    const d = (new Date(v.expiry) - window.MOCK.TODAY) / 86400000;
    return d >= 0 && d <= 14;
  });
  const openTickets = myTickets.filter(t => t.status === 'Open' || t.status === 'In Progress');
  const pendingInv = myInvs.filter(i => i.status !== 'Payment Received');

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'request', label: 'Request VM', icon: 'plus', lockedByKyc: true },
    { id: 'vms', label: 'My VMs', icon: 'server', badge: myVMs.length || null, lockedByKyc: true },
    { id: 'requests', label: 'My requests', icon: 'tasks', badge: myRequests.length || null, lockedByKyc: true },
    { id: 'invoices', label: 'Invoices', icon: 'invoice', badge: pendingInv.length || null, lockedByKyc: true },
    { id: 'tickets', label: 'Support tickets', icon: 'mail', badge: openTickets.length || null },
    { id: 'account', label: 'Account', icon: 'users' },
  ];

  const submitRenewalRequest = (vm, months) => {
    addTask({
      title: `Customer renewal request — ${vm.name} (${months} months)`,
      customer: meId, vm: vm.id, type: 'Renewal', priority: 'Normal', status: 'Pending',
      team: 'Sales', subscription: `${months} months`,
      notes: `Customer-initiated renewal request via portal.`,
    });
    toast(`Renewal request submitted. Sales will be in touch.`, 'ok');
    setRenewVm(null);
  };

  // Force dashboard view if KYC blocks current view
  React.useEffect(() => {
    if (me.kyc !== 'Approved' && ['request', 'vms', 'requests', 'invoices'].includes(view)) {
      setView('dashboard');
    }
  }, [me.kyc, view]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <div className="brand-name">VPS Myanmar</div>
            <div className="brand-sub">Customer portal</div>
          </div>
        </div>
        <nav className="nav">
          <div className="nav-section">Workspace</div>
          {items.map(it => {
            const locked = it.lockedByKyc && me.kyc !== 'Approved';
            return (
              <button key={it.id}
                className={`nav-item ${view === it.id ? 'active' : ''}`}
                disabled={locked}
                onClick={() => { if (locked) return; setView(it.id); setDetailVm(null); setOpenTicket(null); setDetailRequest(null); setDetailInvoice(null); }}
                style={locked ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                title={locked ? `Locked — KYC ${me.kyc}` : ''}>
                <Icon name={it.icon} className="nav-icon"/>
                <span>{it.label}</span>
                {locked
                  ? <Icon name="lock" size={11} style={{ marginLeft: 'auto', opacity: 0.6 }}/>
                  : (it.badge && <span className="nav-badge">{it.badge}</span>)}
              </button>
            );
          })}
        </nav>
        <div className="nav-user">
          <Avatar name={me.name} size={28}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="who">{me.name}</div>
            <div className="role">{me.company}</div>
          </div>
          <button className="icon-btn" title="Sign out" onClick={() => { auth?.signout(); }}><Icon name="logout"/></button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>Customer portal</span>
            <Icon name="chevron-right" size={12} className="sep"/>
            {detailVm ? (
              <>
                <span style={{ cursor: 'pointer' }} onClick={() => setDetailVm(null)}>My VMs</span>
                <Icon name="chevron-right" size={12} className="sep"/>
                <strong>{detailVm.name}</strong>
              </>
            ) : openTicket ? (
              <>
                <span style={{ cursor: 'pointer' }} onClick={() => setOpenTicket(null)}>Support tickets</span>
                <Icon name="chevron-right" size={12} className="sep"/>
                <strong>{openTicket.id}</strong>
              </>
            ) : (
              <strong>{items.find(i => i.id === view)?.label || 'Dashboard'}</strong>
            )}
          </div>
          <div className="topbar-spacer"/>
          <div className="text-sm text-mute">{me.company} · <span className="mono">{me.id}</span></div>
          <button className="icon-btn" title="Notifications"><Icon name="bell" size={15}/></button>
        </div>

        {/* KYC review banner — blocks features until approved */}
        {me.kyc !== 'Approved' && !detailVm && !openTicket && !detailRequest && !detailInvoice && (
          <div style={{
            padding: '14px 28px',
            background: me.kyc === 'Rejected' ? 'var(--bad-soft)' : 'var(--warn-soft)',
            borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 14,
            animation: 'slideDown 0.3s ease-out',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: me.kyc === 'Rejected' ? 'var(--bad)' : 'oklch(0.55 0.16 75)',
              color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <Icon name={me.kyc === 'Rejected' ? 'alert' : 'shield'} size={16}/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="fw-7 text-sm" style={{ color: me.kyc === 'Rejected' ? 'var(--bad)' : 'oklch(0.4 0.13 75)' }}>
                {me.kyc === 'Rejected' ? 'KYC verification rejected' : 'Your account is under KYC review'}
              </div>
              <div className="text-xs mt-1" style={{ color: me.kyc === 'Rejected' ? 'oklch(0.4 0.12 25)' : 'oklch(0.45 0.12 75)', lineHeight: 1.5 }}>
                {me.kyc === 'Rejected'
                  ? 'Your documents didn\'t pass verification. Please re-upload via the Account page or contact your account manager.'
                  : 'Our team is reviewing your documents — usually within 1 business day. VM deployment and most features are locked until KYC is approved.'}
              </div>
            </div>
            <button className="btn" onClick={() => toast('Contact your account manager: Su Su · susu@vpsmm.co', 'info')}>
              <Icon name="mail" size={12}/>{me.kyc === 'Rejected' ? 'Contact support' : 'Check status'}
            </button>
          </div>
        )}

        <style>{`@keyframes slideDown { from { transform: translateY(-6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {expiringSoon.length > 0 && !detailVm && view !== 'request' && me.kyc === 'Approved' && (
          <div style={{ padding: '12px 28px', background: 'var(--warn-soft)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="alert" size={16} style={{ color: 'oklch(0.55 0.16 75)' }}/>
            <div className="text-sm" style={{ color: 'oklch(0.4 0.13 75)' }}>
              <span className="fw-6">{expiringSoon.length} VM{expiringSoon.length > 1 ? 's' : ''} expiring soon.</span> Renew now to avoid service interruption.
            </div>
            <div style={{ flex: 1 }}/>
            <button className="btn" onClick={() => setRenewVm(expiringSoon[0])}>Request renewal</button>
          </div>
        )}

        {/* If detail view active, render detail; else current view */}
        {detailVm
          ? <CustomerVMDetail vm={detailVm} onClose={() => setDetailVm(null)} onRenew={() => setRenewVm(detailVm)}/>
          : openTicket
            ? <CustomerTicketDetail ticket={openTicket} onClose={() => setOpenTicket(null)}/>
            : detailRequest
              ? <CustomerRequestDetail request={detailRequest} onClose={() => setDetailRequest(null)}/>
              : detailInvoice
                ? <CustomerInvoiceDetail invoice={detailInvoice} onClose={() => setDetailInvoice(null)}/>
                : (
                  <>
                    {view === 'dashboard' && <CustomerDashboard me={me} myVMs={myVMs} myInvs={myInvs} myTickets={myTickets} myRequests={myRequests} setView={setView} setDetailVm={setDetailVm} setOpenTicket={setOpenTicket} setDetailRequest={setDetailRequest} setDetailInvoice={setDetailInvoice}/>}
                    {view === 'request' && <CustomerRequestVMView me={me} setView={setView}/>}
                    {view === 'vms' && <CustomerVMListView myVMs={myVMs} setDetailVm={setDetailVm} setRenewVm={setRenewVm}/>}
                    {view === 'requests' && <CustomerRequestsView myRequests={myRequests} setDetailRequest={setDetailRequest}/>}
                    {view === 'invoices' && <CustomerInvoicesView myInvs={myInvs} setDetailInvoice={setDetailInvoice}/>}
                    {view === 'tickets' && <CustomerTicketsView me={me} myTickets={myTickets} setOpenTicket={setOpenTicket}/>}
                    {view === 'account' && <CustomerAccountView me={me}/>}
                  </>
                )
        }
      </div>

      {renewVm && <CustRenewModal vm={renewVm} onClose={() => setRenewVm(null)} onSubmit={submitRenewalRequest}/>}
    </div>
  );
};

// ── Dashboard (all data synced) ───────────────────────────────────────────
const CustomerDashboard = ({ me, myVMs, myInvs, myTickets, myRequests, setView, setDetailVm, setOpenTicket, setDetailRequest, setDetailInvoice }) => {
  const kycLocked = me.kyc !== 'Approved';
  const activeVMs = myVMs.filter(v => v.status === 'Active').length;
  const totalVcpu = myVMs.filter(v => v.status === 'Active').reduce((a, v) => a + v.vcpu, 0);
  const totalRam = myVMs.filter(v => v.status === 'Active').reduce((a, v) => a + v.ram, 0);
  const totalStorage = myVMs.filter(v => v.status === 'Active').reduce((a, v) => a + v.storage, 0);
  const monthly = myVMs.filter(v => v.status === 'Active').reduce((a, v) => a + v.priceMonth, 0);
  const openTickets = myTickets.filter(t => t.status === 'Open' || t.status === 'In Progress');
  const pendingInv = myInvs.filter(i => i.status !== 'Payment Received');
  const pendingReq = myRequests.filter(r => r.status === 'Pending' || r.status === 'In Progress');

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Welcome back, {me.name.split(' ')[0]}</h1>
          <p className="page-subtitle">{me.company} · here's your service status today.</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setView('request')} disabled={kycLocked} title={kycLocked ? `Locked — KYC ${me.kyc}` : ''}>
            {kycLocked && <Icon name="lock" size={11}/>}
            <Icon name="plus" size={13}/>Request new VM
          </button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label"><Icon name="server" size={13}/> Active VMs</div><div className="value tnum">{activeVMs}</div><div className="trend">{myVMs.length} total</div></div>
        <div className="metric"><div className="label"><Icon name="cpu" size={13}/> Allocated vCPU</div><div className="value tnum">{totalVcpu}</div><div className="trend">{totalRam} GB RAM · {totalStorage} GB storage</div></div>
        <div className="metric"><div className="label"><Icon name="invoice" size={13}/> Monthly spend</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(monthly)}</div><div className="trend">{pendingInv.length} pending invoice{pendingInv.length !== 1 ? 's' : ''}</div></div>
        <div className="metric"><div className="label"><Icon name="mail" size={13}/> Open tickets</div><div className="value tnum">{openTickets.length}</div><div className="trend">{pendingReq.length} pending request{pendingReq.length !== 1 ? 's' : ''}</div></div>
      </div>

      <div className="grid-asym mb-4">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">My VMs</h3>
            <button className="btn sm" onClick={() => setView('vms')}>View all<Icon name="chevron-right" size={12}/></button>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>VM</th><th>Status</th><th>Spec</th><th>Public IP</th><th>Expires</th></tr></thead>
              <tbody>
                {myVMs.slice(0, 5).map(v => (
                  <tr key={v.id} onClick={() => setDetailVm(v)}>
                    <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                    <td><StatusPill status={v.status}/></td>
                    <td className="mono text-xs">{v.vcpu}c · {v.ram}GB · {v.storage}GB</td>
                    <td className="mono text-xs">{v.publicIp}</td>
                    <td><ExpiryCell date={v.expiry}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Open tickets</h3>{openTickets.length > 0 && <button className="btn sm" onClick={() => setView('tickets')}>All</button>}</div>
            <div className="card-body" style={{ padding: 0 }}>
              {openTickets.length === 0 && <div className="empty"><div className="sub">No open tickets.</div></div>}
              {openTickets.slice(0, 3).map(t => (
                <div key={t.id} onClick={() => setOpenTicket(t)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
                  <div className="flex center between mb-1">
                    <span className="mono text-xs text-mute">{t.id}</span>
                    <StatusPill status={t.status}/>
                  </div>
                  <div className="fw-6 text-sm">{t.subject}</div>
                  <div className="text-xs text-mute mt-1">Updated {t.updated}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Quick actions</h3></div>
            <div className="card-body">
              <div className="flex col gap-2">
                <button className="btn" onClick={() => setView('request')} disabled={kycLocked}>
                  {kycLocked && <Icon name="lock" size={11}/>}<Icon name="plus" size={12}/>Request new VM
                </button>
                <button className="btn" onClick={() => setView('tickets')}><Icon name="mail" size={12}/>Open support ticket</button>
                <button className="btn" onClick={() => setView('invoices')} disabled={kycLocked}>
                  {kycLocked && <Icon name="lock" size={11}/>}<Icon name="invoice" size={12}/>Pay invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── My VMs list ───────────────────────────────────────────────────────────
const CustomerVMListView = ({ myVMs, setDetailVm, setRenewVm }) => (
  <div className="content">
    <div className="page-head">
      <div>
        <h1 className="page-title">My VMs</h1>
        <p className="page-subtitle">{myVMs.length} virtual machines · click any row to see details and control</p>
      </div>
    </div>
    <div className="grid-3 mb-4">
      <div className="metric"><div className="label">Active</div><div className="value tnum">{myVMs.filter(v => v.status === 'Active').length}</div></div>
      <div className="metric"><div className="label">Total vCPU</div><div className="value tnum">{myVMs.reduce((a, v) => a + (v.status === 'Active' ? v.vcpu : 0), 0)}</div></div>
      <div className="metric"><div className="label">Total RAM</div><div className="value tnum">{myVMs.reduce((a, v) => a + (v.status === 'Active' ? v.ram : 0), 0)} <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>GB</span></div></div>
    </div>
    <div className="card">
      <div className="card-body flush">
        <table className="tbl">
          <thead><tr><th>VM</th><th>Status</th><th>Power</th><th>Spec</th><th>Public IP</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {myVMs.map(v => (
              <tr key={v.id} onClick={() => setDetailVm(v)}>
                <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                <td><StatusPill status={v.status}/></td>
                <td><span className="pill"><Icon name={v.powerState === 'Running' ? 'play' : 'pause'} size={10}/>{v.powerState}</span></td>
                <td className="mono text-xs">{v.vcpu}c · {v.ram}GB · {v.storage}GB</td>
                <td className="mono">{v.publicIp}</td>
                <td><ExpiryCell date={v.expiry}/></td>
                <td className="right" onClick={e => e.stopPropagation()}>
                  <button className="btn sm" onClick={() => setRenewVm(v)}><Icon name="refresh" size={11}/>Renew</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ── VM Detail page (full screen, replaces modal) ──────────────────────────
const CustomerVMDetail = ({ vm: initialVm, onClose, onRenew }) => {
  const { state, startVM, stopVM, restartVM, snapshotVM, updateVMTags, updateVMNotes, toast } = useStore();
  const vm = state.vms.find(v => v.id === initialVm.id) || initialVm;
  const [tab, setTab] = React.useState('overview');
  const [revealCreds, setRevealCreds] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');
  const [notesDraft, setNotesDraft] = React.useState(vm.notes || '');
  const [snapName, setSnapName] = React.useState('');
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [changePlanOpen, setChangePlanOpen] = React.useState(false);

  const tags = vm.tags || [];
  const isRunning = vm.powerState === 'Running';

  // Generate consistent usage data based on VM id
  const seed = vm.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const seedRand = (i) => ((Math.sin(seed + i) + 1) / 2);
  const cpu = Array.from({ length: 24 }, (_, i) => Math.round(30 + seedRand(i) * 50));
  const ram = Array.from({ length: 24 }, (_, i) => Math.round(50 + seedRand(i * 2) * 35));
  const net = Array.from({ length: 24 }, (_, i) => Math.round(40 + seedRand(i * 3) * 140));
  const disk = Math.round(vm.storage * 0.42);

  // Mock credentials per VM
  const creds = [
    { type: 'root', user: 'root', pass: 'X9k$mP2vL!Q7nR8w' },
    { type: 'app user', user: `${vm.name.split('-')[0]}-admin`, pass: 'B3$jK9pX@2vN4mZq' },
  ];

  const snapshots = [
    { id: `snap-${vm.id.slice(3)}-d1`, date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), size: (3.8 + seedRand(1) * 0.6).toFixed(1), type: 'Daily' },
    { id: `snap-${vm.id.slice(3)}-d2`, date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), size: (3.8 + seedRand(2) * 0.6).toFixed(1), type: 'Daily' },
    { id: `snap-${vm.id.slice(3)}-d3`, date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), size: (3.8 + seedRand(3) * 0.6).toFixed(1), type: 'Daily' },
    { id: `snap-${vm.id.slice(3)}-w1`, date: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), size: (15.2 + seedRand(4) * 2).toFixed(1), type: 'Weekly' },
  ];

  const addTag = () => {
    if (!tagInput.trim()) return;
    const next = [...tags, tagInput.trim()];
    updateVMTags(vm.id, next);
    setTagInput('');
  };
  const removeTag = (t) => updateVMTags(vm.id, tags.filter(x => x !== t));

  const openConsole = () => {
    const params = new URLSearchParams({
      name: vm.name, id: vm.id, ip: vm.publicIp || '203.81.64.10',
      os: vm.os, vcpu: String(vm.vcpu), ram: String(vm.ram), storage: String(vm.storage),
      running: isRunning ? '1' : '0',
    });
    window.open(`vnc-console.html?${params.toString()}`, '_blank', 'noopener,width=1180,height=760');
    toast(`Opening VNC console for ${vm.name}…`, 'info');
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to VMs</button>
            <span className="mono text-xs text-mute">{vm.id}</span>
          </div>
          <h1 className="page-title">{vm.name}</h1>
          <div className="flex gap-2 mt-2">
            <StatusPill status={vm.status}/>
            <StatusPill status={vm.type}/>
            <span className="pill"><Icon name={isRunning ? 'play' : 'pause'} size={10}/>{vm.powerState}</span>
            <SecCheck on={vm.security}/>
            {tags.map(t => <span key={t} className="pill subtle">#{t}</span>)}
          </div>
        </div>
        <div className="page-actions">
          {isRunning
            ? <button className="btn" onClick={() => stopVM(vm.id)}><Icon name="pause" size={12}/>Stop</button>
            : <button className="btn primary" onClick={() => startVM(vm.id)}><Icon name="play" size={12}/>Start</button>
          }
          <button className="btn" onClick={() => restartVM(vm.id)} disabled={!isRunning}><Icon name="refresh" size={12}/>Restart</button>
          <button className="btn" onClick={openConsole} disabled={!isRunning} title={isRunning ? 'Open VNC console in new tab' : 'Start the VM to open console'}><Icon name="terminal" size={12}/>Console<Icon name="external" size={10}/></button>
          <button className="btn" onClick={() => setUpgradeOpen(true)}><Icon name="arrow-up" size={12}/>Upgrade</button>
          <button className="btn" onClick={() => setChangePlanOpen(true)}><Icon name="sliders" size={12}/>Change plan</button>
          <button className="btn accent" onClick={onRenew}><Icon name="refresh" size={12}/>Renew</button>
        </div>
      </div>

      {upgradeOpen && <CustUpgradeModal vm={vm} onClose={() => setUpgradeOpen(false)}/>}
      {changePlanOpen && <CustChangePlanModal vm={vm} onClose={() => setChangePlanOpen(false)}/>}

      {/* Top usage cards */}
      <div className="grid-4 mb-4">
        <UsageCard label="CPU" value={`${cpu[23]}%`} data={cpu} unit="%" color="var(--accent)"/>
        <UsageCard label="RAM" value={`${ram[23]}%`} data={ram} unit="%" color="var(--info)" sub={`${Math.round(vm.ram * ram[23] / 100)} / ${vm.ram} GB`}/>
        <UsageCard label="Storage" value={`${Math.round(disk / vm.storage * 100)}%`} data={[disk, disk, disk, disk]} unit="%" color="oklch(0.55 0.18 285)" sub={`${disk} / ${vm.storage} GB`}/>
        <UsageCard label="Network out" value={`${net[23]} Mbps`} data={net} unit=" Mbps" color="var(--ok)"/>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="tabs">
          {['overview', 'specs', 'network', 'credentials', 'snapshots', 'usage', 'tags-notes'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'tags-notes' ? 'Tags & notes' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'snapshots' && <span className="count">{snapshots.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 14 }}>
              <InfoCard icon="cpu" title="Specification" rows={[
                ['vCPU', `${vm.vcpu} cores`],
                ['RAM', `${vm.ram} GB`],
                ['Storage', `${vm.storage} GB SSD`],
                ['Bandwidth', vm.bandwidth],
                ['OS', vm.os],
                ['Datacenter', vm.datacenter],
              ]}/>
              <InfoCard icon="invoice" title="Subscription" rows={[
                ['Type', vm.type],
                ['Period', vm.subscription],
                ['Started', vm.start],
                ['Expires', vm.expiry],
                ['Monthly', `MMK ${formatMMK(vm.priceMonth)}`],
                ['Auto-renew', 'On'],
              ]}/>
            </div>
          </div>
        )}

        {tab === 'specs' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 14 }}>
              <InfoCard icon="server" title="Instance" mono rows={[
                ['VM ID', vm.id],
                ['Hostname', vm.name],
                ['Power state', vm.powerState],
                ['Datacenter', vm.datacenter],
                ['VLAN', vm.vlan],
              ]}/>
              <InfoCard icon="cpu" title="Hardware" rows={[
                ['vCPU cores', `${vm.vcpu}`],
                ['RAM', `${vm.ram} GB`],
                ['Storage', `${vm.storage} GB SSD`],
                ['Bandwidth', vm.bandwidth],
                ['Operating system', vm.os],
              ]}/>
            </div>
            <div style={{ padding: 12, background: 'var(--info-soft)', borderRadius: 8, fontSize: 12, display: 'flex', gap: 8, marginTop: 14, color: 'var(--info)' }}>
              <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: 1 }}/>
              <div>Need a different spec? Use <strong>Upgrade</strong> or <strong>Change plan</strong> above — your account manager will confirm with a quote.</div>
            </div>
          </div>
        )}

        {tab === 'network' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 24 }}>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Public access</div>
                <dl className="dl">
                  <dt>Public IPv4</dt><dd className="mono fw-6">{vm.publicIp}</dd>
                  <dt>VLAN</dt><dd className="mono">{vm.vlan}</dd>
                  <dt>Public access</dt><dd>{vm.publicAccess ? <span className="pill ok"><span className="dot"/>Enabled</span> : <span className="pill"><span className="dot"/>Disabled</span>}</dd>
                  <dt>Firewall policy</dt><dd className="mono">{vm.firewallPolicy}</dd>
                </dl>
              </div>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Allowed ports</div>
                <div className="card" style={{ borderColor: 'var(--line)' }}>
                  <div className="card-body flush">
                    <table className="tbl">
                      <thead><tr><th>Port</th><th>Protocol</th><th>Source</th></tr></thead>
                      <tbody>
                        <tr><td className="mono fw-6">443</td><td className="mono">TCP</td><td className="text-sm">any (HTTPS)</td></tr>
                        <tr><td className="mono fw-6">80</td><td className="mono">TCP</td><td className="text-sm">any (HTTP)</td></tr>
                        <tr><td className="mono fw-6">22</td><td className="mono">TCP</td><td className="text-sm">trusted-admin</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-xs text-mute mt-2">Port forwarding: <span className="mono">{vm.portForward}</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'credentials' && (
          <div className="card-body">
            <div style={{ padding: 12, background: 'var(--warn-soft)', borderRadius: 6, fontSize: 12, color: 'oklch(0.4 0.12 75)', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
              <Icon name="lock" size={14}/>
              <div>Credentials are encrypted at rest. Reveal logs an audit event.</div>
            </div>
            <table className="tbl">
              <thead><tr><th>Type</th><th>Username</th><th>Password</th><th>Last accessed</th><th></th></tr></thead>
              <tbody>
                {creds.map(c => (
                  <tr key={c.type}>
                    <td>{c.type}</td>
                    <td className="mono">{c.user}</td>
                    <td className="mono">{revealCreds ? c.pass : '••••••••••••••••'}</td>
                    <td className="text-sm text-mute">2 days ago</td>
                    <td className="right">
                      <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(c.pass); toast('Password copied', 'ok'); }}><Icon name="check" size={11}/>Copy</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>SSH key</td>
                  <td className="mono">id_ed25519</td>
                  <td className="mono">SHA256:{revealCreds ? 'X8k29...wPq7n' : '••••••••••'}</td>
                  <td className="text-sm text-mute">1 week ago</td>
                  <td className="right"><button className="btn sm" onClick={() => toast('SSH key downloaded', 'info')}><Icon name="download" size={11}/>Download</button></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-3">
              <button className="btn" onClick={() => setRevealCreds(!revealCreds)}><Icon name="eye" size={12}/>{revealCreds ? 'Hide' : 'Reveal'} all</button>
              <button className="btn" onClick={() => toast('Password rotation requested — Sales will contact you', 'info')}><Icon name="refresh" size={12}/>Request rotation</button>
            </div>
          </div>
        )}

        {tab === 'snapshots' && (
          <div className="card-body">
            <div className="flex gap-2 mb-3">
              <input value={snapName} onChange={e => setSnapName(e.target.value)} placeholder="Snapshot name (optional)" style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5 }}/>
              <button className="btn primary" onClick={() => { snapshotVM(vm.id, snapName); setSnapName(''); }}><Icon name="plus" size={12}/>Create snapshot</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Snapshot ID</th><th>Created</th><th className="right">Size</th><th>Type</th><th></th></tr></thead>
              <tbody>
                {snapshots.map(s => (
                  <tr key={s.id}>
                    <td className="mono text-xs">{s.id}</td>
                    <td className="tnum text-sm">{s.date}</td>
                    <td className="right tnum text-sm">{s.size} GB</td>
                    <td><span className="pill subtle">{s.type}</span></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => toast(`Restoring from ${s.id}…`, 'info')}>Restore</button>
                      <button className="btn sm danger" style={{ marginLeft: 4 }} onClick={() => toast('Snapshot delete request submitted', 'info')}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'usage' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <UsageDetailCard label="CPU" data={cpu} color="var(--accent)" unit="%" avg={Math.round(cpu.reduce((a, b) => a + b, 0) / cpu.length)} peak={Math.max(...cpu)}/>
              <UsageDetailCard label="RAM" data={ram} color="var(--info)" unit="%" avg={Math.round(ram.reduce((a, b) => a + b, 0) / ram.length)} peak={Math.max(...ram)}/>
              <UsageDetailCard label="Network out" data={net} color="var(--ok)" unit=" Mbps" avg={Math.round(net.reduce((a, b) => a + b, 0) / net.length)} peak={Math.max(...net)}/>
              <div className="card" style={{ borderColor: 'var(--line)' }}>
                <div className="card-body">
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Storage</div>
                  <div className="flex center between mb-2">
                    <span className="tnum fw-7" style={{ fontSize: 24 }}>{disk} GB</span>
                    <span className="text-sm text-mute tnum">of {vm.storage} GB</span>
                  </div>
                  <div className="bar"><div className="fill" style={{ width: `${(disk / vm.storage) * 100}%`, background: 'oklch(0.55 0.18 285)' }}/></div>
                  <div className="flex between text-xs mt-2"><span className="text-mute">Used</span><span className="text-mute tnum">{Math.round(disk / vm.storage * 100)}%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'tags-notes' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 24 }}>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tags</div>
                <div className="flex wrap gap-2 mb-2">
                  {tags.length === 0 && <span className="text-xs text-mute">No tags yet.</span>}
                  {tags.map(t => (
                    <span key={t} className="pill accent" style={{ paddingRight: 4 }}>
                      <span>#{t}</span>
                      <button className="icon-btn" style={{ width: 18, height: 18, marginLeft: 2 }} onClick={() => removeTag(t)}><Icon name="x" size={10}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add a tag (e.g. production, db, backup)" style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5 }}/>
                  <button className="btn" onClick={addTag}><Icon name="plus" size={12}/>Add</button>
                </div>
                <div className="text-xs text-mute mt-2">Tags help you organize VMs. Try: production, staging, db, web, backup-critical.</div>
              </div>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Notes</div>
                <textarea
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  placeholder="Add notes for this VM…"
                  rows="6"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5, resize: 'vertical' }}
                />
                <div className="flex gap-2 mt-2">
                  <button className="btn accent" onClick={() => { updateVMNotes(vm.id, notesDraft); toast('Notes saved', 'ok'); }}><Icon name="check" size={12}/>Save notes</button>
                  <button className="btn ghost" onClick={() => setNotesDraft(vm.notes || '')}>Reset</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Small usage card (sparkline) ──────────────────────────────────────────
const InfoCard = ({ icon, title, rows, mono }) => (
  <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)' }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center' }}>
        <Icon name={icon} size={13}/>
      </div>
      <span className="fw-7 text-sm">{title}</span>
    </div>
    <div style={{ padding: '6px 16px' }}>
      {rows.map(([k, v], i) => {
        const empty = v === undefined || v === null || v === '' || v === '—';
        return (
          <div key={i} className="flex center between" style={{ padding: '9px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span className="text-sm text-mute">{k}</span>
            <span className={`text-sm fw-6 ${mono && !empty ? 'mono' : ''}`} style={{ textAlign: 'right', color: empty ? 'var(--ink-4)' : undefined }}>
              {empty ? 'Not provisioned yet' : v}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const UsageCard = ({ label, value, data, unit, color, sub }) => (
  <div className="metric">
    <div className="label">{label}</div>
    <div className="flex center between">
      <div className="value tnum" style={{ fontSize: 20 }}>{value}</div>
    </div>
    <div className="mt-2">
      <Bars data={data} color={color} height={26}/>
    </div>
    {sub && <div className="trend">{sub}</div>}
  </div>
);

const UsageDetailCard = ({ label, data, color, unit, avg, peak }) => (
  <div className="card" style={{ borderColor: 'var(--line)' }}>
    <div className="card-body">
      <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label} · last 24h</div>
      <Bars data={data} color={color} height={80}/>
      <div className="grid-2 mt-3" style={{ gap: 12 }}>
        <div><div className="text-xs text-mute">Average</div><div className="tnum fw-6">{avg}{unit}</div></div>
        <div><div className="text-xs text-mute">Peak</div><div className="tnum fw-6">{peak}{unit}</div></div>
      </div>
    </div>
  </div>
);

// ── My requests view ─────────────────────────────────────────────────────
const CustomerRequestsView = ({ myRequests, setDetailRequest }) => (
  <div className="content">
    <div className="page-head">
      <div>
        <h1 className="page-title">My requests</h1>
        <p className="page-subtitle">Requests you've submitted to our Sales team · {myRequests.length} total · click any row to see details</p>
      </div>
    </div>
    <div className="card">
      <div className="card-body flush">
        <table className="tbl">
          <thead><tr><th>Request</th><th>Type</th><th>Submitted</th><th>Assigned to</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {myRequests.length === 0 && <tr><td colSpan="6"><div className="empty"><div className="title">No requests yet</div><div className="sub">Click "Request VM" in the sidebar to submit your first.</div></div></td></tr>}
            {myRequests.map(t => (
              <tr key={t.id} onClick={() => setDetailRequest(t)}>
                <td><div className="fw-6">{t.title}</div><div className="text-xs text-mute mono">{t.id}</div></td>
                <td><span className="pill subtle">{t.type}</span></td>
                <td className="tnum text-sm">{t.created}</td>
                <td>{t.assignee !== '—' ? <div className="flex center gap-2"><Avatar name={t.assignee} size={22}/><span className="text-sm">{t.assignee}</span></div> : <span className="text-mute text-sm">Unassigned</span>}</td>
                <td><StatusPill status={t.status}/></td>
                <td className="right"><Icon name="chevron-right" size={12} className="text-mute"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ── Invoices view ─────────────────────────────────────────────────────────
const CustomerInvoicesView = ({ myInvs, setDetailInvoice }) => {
  const { toast } = useStore();
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Invoices & receipts</h1>
          <p className="page-subtitle">{myInvs.length} invoices · click any row to view full details</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Invoice</th><th>VMs</th><th>Issued</th><th>Due</th><th className="right">Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {myInvs.map(i => (
                <tr key={i.id} onClick={() => setDetailInvoice(i)}>
                  <td className="mono">{i.id}</td>
                  <td><div className="flex gap-1 wrap">{i.vms.map(v => <span key={v} className="id-tag">{v}</span>)}</div></td>
                  <td className="tnum text-sm">{i.issued}</td>
                  <td className="tnum text-sm">{i.due}</td>
                  <td className="right tnum fw-6">MMK {formatMMK(i.amount)}</td>
                  <td><StatusPill status={i.status}/></td>
                  <td className="right" onClick={e => e.stopPropagation()}>
                    <button className="btn sm" onClick={() => toast(`Downloaded ${i.id}.pdf`, 'info')}><Icon name="download" size={11}/>PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

window.CustomerPortal = CustomerPortal;
window.CustomerVMDetail = CustomerVMDetail;
window.CustomerDashboard = CustomerDashboard;
