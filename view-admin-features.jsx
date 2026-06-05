// Admin role views (5 features): System health, Audit, Announcements, API keys, Backups

// 1. SYSTEM HEALTH — services + Proxmox nodes
const SystemHealthView = () => {
  const { toast } = useStore();
  const services = [
    { name: 'API Gateway', status: 'Up', uptime: '42d 14h', latency: 18, sev: 'ok' },
    { name: 'Auth Service', status: 'Up', uptime: '42d 14h', latency: 12, sev: 'ok' },
    { name: 'VM Service', status: 'Up', uptime: '42d 14h', latency: 24, sev: 'ok' },
    { name: 'Task Service', status: 'Up', uptime: '42d 14h', latency: 8, sev: 'ok' },
    { name: 'Finance Service', status: 'Up', uptime: '42d 14h', latency: 14, sev: 'ok' },
    { name: 'Notify Service', status: 'Up', uptime: '42d 14h', latency: 30, sev: 'ok' },
    { name: 'PostgreSQL', status: 'Up', uptime: '42d 14h', latency: 3, sev: 'ok' },
    { name: 'Redis', status: 'Up', uptime: '6d 02h', latency: 1, sev: 'ok' },
    { name: 'BullMQ Worker', status: 'Up', uptime: '42d 14h', latency: 0, sev: 'ok' },
    { name: 'Email Queue', status: 'Degraded', uptime: '2h 14m', latency: 240, sev: 'warn' },
    { name: 'Backup S3', status: 'Up', uptime: '42d 14h', latency: 90, sev: 'ok' },
    { name: 'Proxmox API', status: 'Up', uptime: '42d 14h', latency: 45, sev: 'ok' },
  ];
  const nodes = [
    { name: 'pve-node-01', cpu: 32, ram: 48, vms: 4, status: 'Healthy' },
    { name: 'pve-node-02', cpu: 58, ram: 72, vms: 8, status: 'Healthy' },
    { name: 'pve-node-03', cpu: 81, ram: 88, vms: 12, status: 'High load' },
    { name: 'pve-node-04', cpu: 45, ram: 62, vms: 6, status: 'Healthy' },
    { name: 'pve-node-05', cpu: 38, ram: 51, vms: 5, status: 'Healthy' },
  ];

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">System health</h1>
          <p className="page-subtitle">All services · {services.filter(s => s.sev === 'ok').length}/{services.length} healthy · last check 12s ago</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Refreshed system health (12 services checked)', 'ok')}><Icon name="refresh" size={13}/>Refresh now</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Uptime (90d)</div><div className="value tnum">99.94%</div><div className="trend"><span className="up">SLA met</span></div></div>
        <div className="metric"><div className="label">P95 latency</div><div className="value tnum">142ms</div><div className="trend">Avg 38ms · last 24h</div></div>
        <div className="metric"><div className="label">Active incidents</div><div className="value tnum" style={{ color: 'oklch(0.55 0.16 75)' }}>1</div><div className="trend">Email queue degraded</div></div>
        <div className="metric"><div className="label">Open errors (24h)</div><div className="value tnum">7</div><div className="trend">Down from 14 yesterday</div></div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Services</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Service</th><th>Status</th><th>Uptime</th><th className="right">Latency</th></tr></thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.name}>
                    <td className="fw-6">{s.name}</td>
                    <td><span className={`pill ${s.sev}`}><span className="dot"/>{s.status}</span></td>
                    <td className="text-sm text-mute tnum">{s.uptime}</td>
                    <td className="right tnum text-sm">{s.latency}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Proxmox nodes (cluster)</h3></div>
          <div className="card-body">
            <div className="flex col gap-3">
              {nodes.map(n => (
                <div key={n.name} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                  <div className="flex center between mb-2">
                    <div className="flex center gap-2">
                      <Icon name="server" size={14}/>
                      <span className="fw-6 mono">{n.name}</span>
                    </div>
                    <span className={`pill ${n.status === 'Healthy' ? 'ok' : 'warn'}`}><span className="dot"/>{n.status}</span>
                  </div>
                  <div className="grid-3" style={{ gap: 10 }}>
                    <div>
                      <div className="text-xs text-mute mb-1">CPU · {n.cpu}%</div>
                      <div className="bar"><div className={`fill ${n.cpu > 80 ? 'warn' : ''}`} style={{ width: `${n.cpu}%` }}/></div>
                    </div>
                    <div>
                      <div className="text-xs text-mute mb-1">RAM · {n.ram}%</div>
                      <div className="bar"><div className={`fill ${n.ram > 80 ? 'warn' : ''}`} style={{ width: `${n.ram}%` }}/></div>
                    </div>
                    <div>
                      <div className="text-xs text-mute mb-1">VMs · {n.vms}</div>
                      <div className="text-sm fw-6 tnum">{n.vms} running</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Recent incidents</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Time</th><th>Service</th><th>Type</th><th>Description</th><th>Resolution</th></tr></thead>
            <tbody>
              <tr><td className="tnum text-sm">2026-05-27 14:32</td><td>Email Queue</td><td><span className="pill warn"><span className="dot"/>Degraded</span></td><td>SendGrid rate limit hit · queue depth 142</td><td className="text-sm text-mute">Investigating</td></tr>
              <tr><td className="tnum text-sm">2026-05-24 09:14</td><td>Redis</td><td><span className="pill bad"><span className="dot"/>Down</span></td><td>OOM kill triggered by retention sweep</td><td className="text-sm text-mute">Resolved (6h)</td></tr>
              <tr><td className="tnum text-sm">2026-05-20 22:01</td><td>Proxmox API</td><td><span className="pill warn"><span className="dot"/>Slow</span></td><td>Single node maintenance window</td><td className="text-sm text-mute">Planned</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 2. AUDIT LOG — detailed event log with filters
const AuditLogView = () => {
  const { state, toast } = useStore();
  const [actor, setActor] = React.useState('All');
  const [action, setAction] = React.useState('All');
  const [search, setSearch] = React.useState('');

  // Generate a richer audit dataset
  const auditData = React.useMemo(() => {
    const ev = [
      ...state.activity,
      { ts: '2026-05-27 08:12', actor: 'Min Khant', kind: 'auth', text: 'Admin login from 203.81.64.10' },
      { ts: '2026-05-27 07:55', actor: 'Daw Aye', kind: 'auth', text: 'Login from new device (Chrome/Mac)' },
      { ts: '2026-05-26 18:42', actor: 'Ko Thein', kind: 'creds', text: 'Revealed credentials for VM-2087 (root)' },
      { ts: '2026-05-26 11:30', actor: 'Min Khant', kind: 'role', text: 'Changed role of U-03 from Engineer → Sales' },
      { ts: '2026-05-25 22:14', actor: 'system', kind: 'auth', text: 'Failed login attempt #3 for kothein@vpsmm.co — IP blocked 1h' },
      { ts: '2026-05-25 14:00', actor: 'Min Khant', kind: 'settings', text: 'Updated SMTP host: smtp-old → smtp.sendgrid.net' },
      { ts: '2026-05-24 16:18', actor: 'Su Su', kind: 'export', text: 'Exported customers.csv (10 records)' },
    ];
    return ev;
  }, [state.activity]);

  const actors = ['All', ...new Set(auditData.map(a => a.actor))];
  const actions = ['All', 'vm', 'finance', 'customer', 'task', 'alert', 'auth', 'creds', 'role', 'settings', 'export'];

  const filtered = auditData.filter(a => {
    if (actor !== 'All' && a.actor !== actor) return false;
    if (action !== 'All' && a.kind !== action) return false;
    if (search && !a.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Audit log</h1>
          <p className="page-subtitle">Every action across the system, including auth events and credential access. Retained 90 days.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Audit log exported (CSV)', 'info')}><Icon name="download" size={13}/>Export (CSV)</button>
        </div>
      </div>
      <div className="card">
        <div className="filter-bar">
          <select value={actor} onChange={e => setActor(e.target.value)} style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12 }}>
            {actors.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={action} onChange={e => setAction(e.target.value)} style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12 }}>
            {actions.map(a => <option key={a}>{a}</option>)}
          </select>
          <div style={{ flex: 1 }}/>
          <div className="search" style={{ width: 240 }}>
            <Icon name="search" size={13} className="search-icon"/>
            <input placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Timestamp</th><th>Actor</th><th>Type</th><th>Event</th></tr></thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i}>
                  <td className="tnum text-sm" style={{ whiteSpace: 'nowrap' }}>{a.ts}</td>
                  <td>
                    <div className="flex center gap-2">
                      {a.actor !== 'system' && a.actor !== 'cron' && <Avatar name={a.actor} size={22}/>}
                      <span className="fw-6 text-sm">{a.actor}</span>
                    </div>
                  </td>
                  <td><span className="pill subtle" style={{ textTransform: 'capitalize' }}>{a.kind}</span></td>
                  <td className="text-sm">{a.text}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="4"><div className="empty"><div className="sub">No matching events.</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. ANNOUNCEMENTS — broadcast messages to roles
const AnnouncementsView = () => {
  const { toast } = useStore();
  const [list, setList] = React.useState([
    { id: 'A-001', title: 'Scheduled maintenance window — Sun 2 Jun', body: 'pve-node-03 will be down for kernel upgrade between 02:00–04:00 ICT. Affected VMs will be live-migrated.', audience: 'All customers', sent: '2026-05-25', status: 'Sent', open: 92 },
    { id: 'A-002', title: 'KBZ Pay integration update', body: 'New direct deposit reference codes required. Update your payment workflow.', audience: 'Sales + Finance', sent: '2026-05-20', status: 'Sent', open: 100 },
    { id: 'A-003', title: 'Q3 pricing review draft', body: 'Per-VM monthly rate adjustment proposal attached. Please review by Friday.', audience: 'Admin only', sent: '—', status: 'Draft', open: 0 },
  ]);
  const [composing, setComposing] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', body: '', audience: 'All staff' });

  const submit = (status) => {
    const newId = `A-${String(list.length + 1).padStart(3, '0')}`;
    setList([{ id: newId, ...form, sent: status === 'Sent' ? new Date().toISOString().slice(0,10) : '—', status, open: 0 }, ...list]);
    toast(status === 'Sent' ? 'Announcement sent' : 'Draft saved', 'ok');
    setComposing(false);
    setForm({ title: '', body: '', audience: 'All staff' });
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Broadcast messages to staff or customers. {list.filter(l => l.status === 'Sent').length} sent · {list.filter(l => l.status === 'Draft').length} draft</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setComposing(true)}><Icon name="plus" size={13}/>New announcement</button>
        </div>
      </div>

      {composing && (
        <div className="card mb-4">
          <div className="card-head">
            <h3 className="card-title">New announcement</h3>
            <button className="icon-btn" onClick={() => setComposing(false)}><Icon name="x" size={14}/></button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="field"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
              <div className="field"><label>Audience</label>
                <select value={form.audience} onChange={e => setForm({...form, audience: e.target.value})}>
                  <option>All staff</option><option>All customers</option><option>Admin only</option>
                  <option>Sales</option><option>Engineer</option><option>Finance</option><option>Sales + Finance</option>
                </select>
              </div>
              <div className="field"><label>Body</label><textarea rows="5" value={form.body} onChange={e => setForm({...form, body: e.target.value})}/></div>
              <div className="flex gap-2 mt-1">
                <button className="btn" onClick={() => submit('Draft')}>Save draft</button>
                <button className="btn accent" disabled={!form.title || !form.body} onClick={() => submit('Sent')}><Icon name="mail" size={12}/>Send now</button>
                <div style={{ flex: 1 }}/>
                <button className="btn ghost" onClick={() => setComposing(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Title</th><th>Audience</th><th>Status</th><th>Sent</th><th className="right">Open rate</th></tr></thead>
            <tbody>
              {list.map(a => (
                <tr key={a.id}>
                  <td><div className="fw-6">{a.title}</div><div className="text-xs text-mute" style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.body}</div></td>
                  <td><span className="pill subtle">{a.audience}</span></td>
                  <td><StatusPill status={a.status === 'Sent' ? 'Payment Received' : 'Pending'}/></td>
                  <td className="tnum text-sm">{a.sent}</td>
                  <td className="right tnum">{a.status === 'Sent' ? `${a.open}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 4. API KEYS & WEBHOOKS
const ApiKeysView = ({ openModal }) => {
  const { toast } = useStore();
  const [keys, setKeys] = React.useState([
    { id: 'k-001', name: 'Internal — Provisioning bot', key: 'vpsmm_live_a8x9...c3k4', created: '2026-01-12', lastUsed: '2 min ago', scopes: ['vm:write', 'task:write'] },
    { id: 'k-002', name: 'Proxmox sync worker', key: 'vpsmm_live_p7q2...m1n8', created: '2026-02-04', lastUsed: '14s ago', scopes: ['vm:read', 'vm:write'] },
    { id: 'k-003', name: 'Finance — billing export', key: 'vpsmm_live_f4r6...t9w2', created: '2026-03-22', lastUsed: '1d ago', scopes: ['invoice:read'] },
    { id: 'k-004', name: 'Old portal (deprecated)', key: 'vpsmm_live_o2k1...d8s5', created: '2025-08-15', lastUsed: '3 months ago', scopes: ['*:read'] },
  ]);
  const [hooks, setHooks] = React.useState([
    { id: 'wh-001', url: 'https://hooks.slack.com/services/T0.../B0.../xy', events: ['vm.suspended', 'invoice.overdue'], status: 'Active', last200: '14 min ago' },
    { id: 'wh-002', url: 'https://msteams.vpsmm.co/webhook/incoming', events: ['kyc.submitted', 'task.created'], status: 'Active', last200: '32 min ago' },
    { id: 'wh-003', url: 'https://internal.vpsmm.co/audit/sink', events: ['*'], status: 'Failing', last200: '2 days ago' },
  ]);
  const [show, setShow] = React.useState(null);

  const revoke = (id) => {
    setKeys(keys.filter(k => k.id !== id));
    toast('API key revoked', 'bad');
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">API keys & webhooks</h1>
          <p className="page-subtitle">{keys.length} active keys · {hooks.length} webhook destinations</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => openModal('newapikey', { onAdd: (k) => { const id = `k-${String(keys.length + 1).padStart(3, '0')}`; setKeys([{ id, name: k.name, scopes: k.scopes, key: `vpsmm_live_${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`, created: new Date().toISOString().slice(0, 10), lastUsed: 'never' }, ...keys]); } })}><Icon name="plus" size={13}/>New API key</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">API keys</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Key</th><th>Scopes</th><th>Created</th><th>Last used</th><th></th></tr></thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id}>
                  <td className="fw-6">{k.name}</td>
                  <td className="mono text-xs" style={{ cursor: 'pointer' }} onClick={() => setShow(show === k.id ? null : k.id)}>
                    {show === k.id ? 'vpsmm_live_a8x9b2c4d3kf5jh6...' : k.key}
                  </td>
                  <td><div className="flex gap-1 wrap">{k.scopes.map(s => <span key={s} className="id-tag">{s}</span>)}</div></td>
                  <td className="tnum text-sm">{k.created}</td>
                  <td className="text-sm text-mute">{k.lastUsed}</td>
                  <td className="right"><button className="btn sm danger" onClick={() => revoke(k.id)}>Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Webhooks</h3>
          <button className="btn sm" onClick={() => { setHooks([...hooks, { id: 'wh-' + String(hooks.length + 1).padStart(3, '0'), url: 'https://hooks.new-endpoint.local/incoming', events: ['vm.created'], status: 'Active', last200: 'never' }]); toast('Webhook endpoint added', 'ok'); }}><Icon name="plus" size={11}/>Add endpoint</button>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Endpoint URL</th><th>Events</th><th>Status</th><th>Last 200</th><th></th></tr></thead>
            <tbody>
              {hooks.map(h => (
                <tr key={h.id}>
                  <td className="mono text-xs" style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.url}</td>
                  <td><div className="flex gap-1 wrap">{h.events.map(e => <span key={e} className="id-tag">{e}</span>)}</div></td>
                  <td><span className={`pill ${h.status === 'Active' ? 'ok' : 'bad'}`}><span className="dot"/>{h.status}</span></td>
                  <td className="text-sm text-mute">{h.last200}</td>
                  <td className="right">
                    <button className="btn sm" onClick={() => toast(`Test event sent to ${h.id}`, 'info')}>Test</button>
                    <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => toast('Webhook editor opened', 'info')}>Edit</button>
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

// 5. BACKUP & RESTORE CENTER
const BackupCenterView = () => {
  const { state, toast } = useStore();
  const [tab, setTab] = React.useState('snapshots');
  const allSnapshots = state.vms.filter(v => v.backup && v.backup !== 'None').flatMap(v =>
    [1, 2, 3, 4].map(i => ({
      id: `snap-${v.id.slice(3)}-${i}`,
      vm: v,
      created: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      size: (3 + Math.random() * 2).toFixed(1),
      type: i === 1 ? 'Daily' : i === 2 ? 'Daily' : i === 3 ? 'Daily' : 'Weekly',
    }))
  ).slice(0, 24);
  const totalSize = allSnapshots.reduce((a, s) => a + +s.size, 0);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Backup & restore</h1>
          <p className="page-subtitle">{allSnapshots.length} snapshots across {new Set(allSnapshots.map(s => s.vm.id)).size} VMs · {totalSize.toFixed(1)} GB total</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Backup job queued for all VMs', 'info')}><Icon name="refresh" size={13}/>Run backup now</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Backups today</div><div className="value tnum">{state.vms.filter(v => v.backup && v.backup !== 'None').length}</div><div className="trend">All successful</div></div>
        <div className="metric"><div className="label">Storage used</div><div className="value tnum">2.4 TB</div><div className="trend">of 10 TB</div></div>
        <div className="metric"><div className="label">Avg size</div><div className="value tnum">4.2 GB</div><div className="trend">per snapshot</div></div>
        <div className="metric"><div className="label">RPO target</div><div className="value tnum">24h</div><div className="trend">Met across all VMs</div></div>
      </div>

      <div className="card">
        <div className="tabs">
          <button className={`tab ${tab === 'snapshots' ? 'active' : ''}`} onClick={() => setTab('snapshots')}>Snapshots<span className="count">{allSnapshots.length}</span></button>
          <button className={`tab ${tab === 'schedules' ? 'active' : ''}`} onClick={() => setTab('schedules')}>Schedules</button>
          <button className={`tab ${tab === 'restore' ? 'active' : ''}`} onClick={() => setTab('restore')}>Restore history</button>
        </div>
        {tab === 'snapshots' && (
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Snapshot ID</th><th>VM</th><th>Created</th><th className="right">Size</th><th>Type</th><th></th></tr></thead>
              <tbody>
                {allSnapshots.map(s => (
                  <tr key={s.id}>
                    <td className="mono text-xs">{s.id}</td>
                    <td><div className="fw-6">{s.vm.name}</div><div className="text-xs text-mute mono">{s.vm.id}</div></td>
                    <td className="tnum text-sm">{s.created}</td>
                    <td className="right tnum text-sm">{s.size} GB</td>
                    <td><span className="pill subtle">{s.type}</span></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => toast(`Restoring ${s.id}…`, 'info')}>Restore</button>
                      <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => toast('Snapshot deleted', 'bad')}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'schedules' && (
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>VM</th><th>Schedule</th><th>Retention</th><th>Next run</th><th></th></tr></thead>
              <tbody>
                {state.vms.filter(v => v.backup && v.backup !== 'None').map(v => (
                  <tr key={v.id}>
                    <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                    <td className="text-sm">{v.backup}</td>
                    <td className="text-sm text-mute">7-30 days</td>
                    <td className="tnum text-sm">Tomorrow 02:00</td>
                    <td className="right"><button className="btn sm" onClick={() => toast('Schedule editor opened', 'info')}><Icon name="edit" size={11}/>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'restore' && (
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Snapshot</th><th>VM</th><th>Restored by</th><th>Result</th></tr></thead>
              <tbody>
                <tr><td className="tnum text-sm">2026-05-24 09:20</td><td className="mono text-xs">snap-2087-3</td><td className="fw-6">mlc-erp-prod-01</td><td className="text-sm">Ko Thein</td><td><span className="pill ok"><span className="dot"/>Success</span></td></tr>
                <tr><td className="tnum text-sm">2026-04-30 14:08</td><td className="mono text-xs">snap-2091-1</td><td className="fw-6">yfg-app-01</td><td className="text-sm">Ko Thein</td><td><span className="pill ok"><span className="dot"/>Success</span></td></tr>
                <tr><td className="tnum text-sm">2026-04-18 08:42</td><td className="mono text-xs">snap-2095-2</td><td className="fw-6">npd-staging</td><td className="text-sm">Aye Chan</td><td><span className="pill ok"><span className="dot"/>Success</span></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { SystemHealthView, AuditLogView, AnnouncementsView, ApiKeysView, BackupCenterView });
