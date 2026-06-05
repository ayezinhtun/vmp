// Engineer role views (7 features):
// Web SSH console, Proxmox nodes, Network topology, Snapshots manager,
// Maintenance windows, Patch queue, Firewall rules editor

// 1. WEB SSH CONSOLE — mocked terminal interface
const WebConsoleView = () => {
  const { state } = useStore();
  const [vmId, setVmId] = React.useState(state.vms[0]?.id);
  const vm = state.vms.find(v => v.id === vmId);
  const [history, setHistory] = React.useState([
    { kind: 'sys', text: `Connected to ${vm?.name}.${vm?.datacenter.toLowerCase().replace(' ', '-')}.vpsmm.local via SSH (TLS 1.3)` },
    { kind: 'sys', text: `Last login: 2026-05-26 18:42:11 from 203.81.64.10` },
    { kind: 'prompt' },
  ]);
  const [input, setInput] = React.useState('');
  const endRef = React.useRef();
  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const runCmd = (cmd) => {
    const out = [];
    if (cmd === 'ls') out.push({ kind: 'out', text: 'app/  data/  logs/  scripts/  README.md' });
    else if (cmd === 'whoami') out.push({ kind: 'out', text: 'root' });
    else if (cmd === 'uname -a') out.push({ kind: 'out', text: `Linux ${vm.name} 5.15.0-92-generic #102-Ubuntu SMP x86_64 GNU/Linux` });
    else if (cmd === 'uptime') out.push({ kind: 'out', text: ` 15:42:18 up 14 days, 8 min,  2 users,  load average: 0.41, 0.38, 0.42` });
    else if (cmd === 'df -h') out.push({ kind: 'out', text: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       500G  142G  340G  30% /\ntmpfs            16G   12M   16G   1% /run' });
    else if (cmd === 'free -h') out.push({ kind: 'out', text: '              total        used        free      shared  buff/cache   available\nMem:           32Gi        18Gi       4.2Gi       512Mi       9.6Gi        13Gi' });
    else if (cmd === 'clear') return setHistory([{ kind: 'prompt' }]);
    else if (cmd === 'exit') return setHistory(h => [...h.slice(0, -1), { kind: 'cmd', text: cmd }, { kind: 'sys', text: 'Connection closed.' }]);
    else if (cmd.startsWith('cd ')) out.push({ kind: 'out', text: '' });
    else if (cmd === '') {}
    else out.push({ kind: 'out', text: `bash: ${cmd.split(' ')[0]}: command not found (demo console — try: ls, whoami, uname -a, uptime, df -h, free -h, clear)` });
    setHistory(h => [...h.slice(0, -1), { kind: 'cmd', text: cmd }, ...out, { kind: 'prompt' }]);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { runCmd(input); setInput(''); }
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Web SSH console</h1>
          <p className="page-subtitle">Connect to any VM through the browser. All sessions are recorded for audit.</p>
        </div>
        <div className="page-actions">
          <select value={vmId} onChange={e => setVmId(e.target.value)} className="btn" style={{ padding: '6px 10px' }}>
            {state.vms.filter(v => v.status === 'Active').map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
          </select>
          <button className="btn"><Icon name="refresh" size={13}/>Reconnect</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '10px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="flex gap-1">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'oklch(0.7 0.15 25)' }}/>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'oklch(0.8 0.15 75)' }}/>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'oklch(0.7 0.15 155)' }}/>
          </div>
          <span className="mono text-sm fw-6">root@{vm?.name}:~</span>
          <div style={{ flex: 1 }}/>
          <span className="pill ok"><span className="dot"/>Connected</span>
          <span className="text-xs text-mute mono">{vm?.publicIp}:22</span>
        </div>
        <div style={{
          background: '#0d0f14', color: '#dde2ea',
          fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.6,
          padding: 16, minHeight: 480, maxHeight: 540, overflowY: 'auto',
        }}>
          {history.map((h, i) => {
            if (h.kind === 'sys') return <div key={i} style={{ color: '#8b94a7', fontStyle: 'italic' }}>{h.text}</div>;
            if (h.kind === 'cmd') return <div key={i}><span style={{ color: '#7eb888' }}>root@{vm?.name}:~$ </span><span>{h.text}</span></div>;
            if (h.kind === 'out') return <div key={i} style={{ whiteSpace: 'pre-wrap' }}>{h.text}</div>;
            return (
              <div key={i} ref={endRef}>
                <span style={{ color: '#7eb888' }}>root@{vm?.name}:~$ </span>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} autoFocus style={{
                  background: 'transparent', border: 'none', outline: 'none', color: '#dde2ea',
                  fontFamily: 'var(--mono)', fontSize: 12.5, width: '60%',
                }}/>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '8px 14px', background: 'var(--surface-2)', borderTop: '1px solid var(--line)', display: 'flex', gap: 6, fontSize: 11 }}>
          <button className="btn sm ghost" onClick={() => { setInput('ls'); }}>ls</button>
          <button className="btn sm ghost" onClick={() => { setInput('df -h'); }}>df -h</button>
          <button className="btn sm ghost" onClick={() => { setInput('uptime'); }}>uptime</button>
          <button className="btn sm ghost" onClick={() => { setInput('free -h'); }}>free -h</button>
          <button className="btn sm ghost" onClick={() => { setInput('clear'); }}>clear</button>
        </div>
      </div>
    </div>
  );
};

// 2. PROXMOX NODES — cluster resource manager
const NodesView = () => {
  const { state } = useStore();
  const nodes = [
    { name: 'pve-node-01', cpu: 32, cpuCores: 64, ram: 48, ramTotal: 256, storage: 28, storageTotal: 2000, status: 'Healthy' },
    { name: 'pve-node-02', cpu: 58, cpuCores: 64, ram: 72, ramTotal: 256, storage: 52, storageTotal: 2000, status: 'Healthy' },
    { name: 'pve-node-03', cpu: 81, cpuCores: 64, ram: 88, ramTotal: 256, storage: 68, storageTotal: 2000, status: 'High load' },
    { name: 'pve-node-04', cpu: 45, cpuCores: 64, ram: 62, ramTotal: 256, storage: 41, storageTotal: 2000, status: 'Healthy' },
    { name: 'pve-node-05', cpu: 38, cpuCores: 64, ram: 51, ramTotal: 256, storage: 35, storageTotal: 2000, status: 'Healthy' },
  ];

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Proxmox nodes</h1>
          <p className="page-subtitle">5 nodes · {state.vms.filter(v => v.status === 'Active').length} VMs distributed · cluster healthy</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Opening Proxmox cluster in new tab', 'info')}><Icon name="external" size={13}/>Open Proxmox</button>
        </div>
      </div>

      <div className="grid-3 mb-4">
        {nodes.map(n => {
          const vms = state.vms.filter(v => v.node === n.name);
          return (
            <div className="card" key={n.name}>
              <div className="card-head">
                <div>
                  <div className="flex center gap-2"><Icon name="server" size={14}/><span className="fw-6 mono">{n.name}</span></div>
                  <div className="text-xs text-mute mt-1">{vms.length} VMs hosted</div>
                </div>
                <span className={`pill ${n.status === 'Healthy' ? 'ok' : 'warn'}`}><span className="dot"/>{n.status}</span>
              </div>
              <div className="card-body">
                <div className="flex col gap-3">
                  <div>
                    <div className="flex between text-xs mb-1"><span className="text-mute">CPU</span><span className="tnum fw-6">{n.cpu}% of {n.cpuCores}c</span></div>
                    <div className="bar"><div className={`fill ${n.cpu > 80 ? 'warn' : ''}`} style={{ width: `${n.cpu}%` }}/></div>
                  </div>
                  <div>
                    <div className="flex between text-xs mb-1"><span className="text-mute">RAM</span><span className="tnum fw-6">{Math.round(n.ramTotal * n.ram / 100)} / {n.ramTotal} GB</span></div>
                    <div className="bar"><div className={`fill ${n.ram > 80 ? 'warn' : ''}`} style={{ width: `${n.ram}%` }}/></div>
                  </div>
                  <div>
                    <div className="flex between text-xs mb-1"><span className="text-mute">Storage</span><span className="tnum fw-6">{Math.round(n.storageTotal * n.storage / 100)} / {n.storageTotal} GB</span></div>
                    <div className="bar"><div className="fill" style={{ width: `${n.storage}%` }}/></div>
                  </div>
                </div>
                <div className="divider"/>
                <div className="flex gap-2">
                  <button className="btn sm" onClick={() => useStore().toast(`Drain mode enabled on ${n.name}`, 'warn')}>Drain</button>
                  <button className="btn sm" onClick={() => useStore().toast(`Migration queued for ${vms.length} VMs from ${n.name}`, 'info')}>Migrate VMs</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">VM distribution</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Node</th><th>VM</th><th>Customer</th><th className="right">vCPU</th><th className="right">RAM</th><th>Status</th></tr></thead>
            <tbody>
              {state.vms.filter(v => v.node && v.node !== '—').sort((a, b) => a.node.localeCompare(b.node)).map(v => {
                const c = state.customers.find(c => c.id === v.customer);
                return (
                  <tr key={v.id}>
                    <td className="mono text-xs">{v.node}</td>
                    <td><div className="fw-6">{v.name}</div></td>
                    <td className="text-sm">{c?.company}</td>
                    <td className="right tnum">{v.vcpu}</td>
                    <td className="right tnum">{v.ram} GB</td>
                    <td><StatusPill status={v.status}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. NETWORK TOPOLOGY — SVG visualization
const TopologyView = () => {
  const { state, toast } = useStore();
  const vms = state.vms.filter(v => v.status === 'Active');
  // Group by VLAN
  const vlans = {};
  vms.forEach(v => { (vlans[v.vlan] = vlans[v.vlan] || []).push(v); });

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Network topology</h1>
          <p className="page-subtitle">Logical view of VLANs, VMs, and interconnects</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Topology SVG downloaded', 'info')}><Icon name="download" size={13}/>Export SVG</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ background: 'var(--surface-2)' }}>
          <svg viewBox="0 0 1000 540" style={{ width: '100%', height: 540 }}>
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--ink-3)"/>
              </marker>
            </defs>
            {/* Internet cloud */}
            <g transform="translate(450, 30)">
              <rect x="0" y="0" width="100" height="48" rx="24" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5"/>
              <text x="50" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--ink)">Internet</text>
              <text x="50" y="38" textAnchor="middle" fontSize="10" fill="var(--ink-3)">203.81.64.0/24</text>
            </g>

            {/* Firewall */}
            <line x1="500" y1="78" x2="500" y2="115" stroke="var(--ink-3)" strokeWidth="1.5" markerEnd="url(#arr)"/>
            <g transform="translate(420, 115)">
              <rect x="0" y="0" width="160" height="44" rx="6" fill="oklch(0.95 0.05 250)" stroke="var(--accent)" strokeWidth="1.5"/>
              <text x="80" y="20" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--accent-strong)">FortiGate Firewall</text>
              <text x="80" y="34" textAnchor="middle" fontSize="10" fill="var(--accent-strong)">fg.vpsmm.co · 3 policies</text>
            </g>

            {/* Switch */}
            <line x1="500" y1="159" x2="500" y2="195" stroke="var(--ink-3)" strokeWidth="1.5" markerEnd="url(#arr)"/>
            <g transform="translate(425, 195)">
              <rect x="0" y="0" width="150" height="40" rx="6" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5"/>
              <text x="75" y="18" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--ink)">Core Switch</text>
              <text x="75" y="32" textAnchor="middle" fontSize="10" fill="var(--ink-3)">VLAN trunk · 1 Gbps</text>
            </g>

            {/* VLAN groups */}
            {Object.entries(vlans).slice(0, 5).map(([vlan, vmList], i) => {
              const x = 60 + i * 180;
              const y = 290;
              return (
                <g key={vlan}>
                  <line x1="500" y1="235" x2={x + 70} y2={y - 10} stroke="var(--line-strong)" strokeWidth="1"/>
                  <rect x={x} y={y} width="140" height={40 + vmList.length * 26} rx="6" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="4 3"/>
                  <text x={x + 70} y={y + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">{vlan}</text>
                  {vmList.slice(0, 5).map((v, j) => (
                    <g key={v.id} transform={`translate(${x + 10}, ${y + 30 + j * 26})`}>
                      <rect x="0" y="0" width="120" height="22" rx="4" fill="var(--accent-soft)"/>
                      <text x="8" y="14" fontSize="10" fontWeight="600" fill="var(--accent-strong)" fontFamily="var(--mono)">{v.name.slice(0, 18)}</text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid-2 mt-4">
        <div className="card">
          <div className="card-head"><h3 className="card-title">VLAN summary</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>VLAN</th><th className="right">VMs</th><th>Customers</th></tr></thead>
              <tbody>
                {Object.entries(vlans).map(([v, list]) => (
                  <tr key={v}>
                    <td className="mono fw-6">{v}</td>
                    <td className="right tnum">{list.length}</td>
                    <td className="text-sm">{[...new Set(list.map(x => state.customers.find(c => c.id === x.customer)?.company))].filter(Boolean).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Interconnections</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>VM</th><th>Connected to</th><th>VLAN</th></tr></thead>
              <tbody>
                {state.vms.filter(v => v.interconnect.length > 0).map(v => (
                  <tr key={v.id}>
                    <td><div className="fw-6 text-sm">{v.name}</div></td>
                    <td><div className="flex gap-1">{v.interconnect.map(id => <span key={id} className="id-tag">{id}</span>)}</div></td>
                    <td className="mono text-xs">{v.vlan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. SNAPSHOT MANAGER (cross-VM)
const SnapshotsView = () => {
  const { state, toast } = useStore();
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Snapshots</h1>
          <p className="page-subtitle">Manage VM snapshots across the cluster</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => toast('Snapshot job queued', 'ok')}><Icon name="plus" size={13}/>New snapshot</button>
        </div>
      </div>
      <BackupCenterViewMini/>
    </div>
  );
};
const BackupCenterViewMini = () => {
  const { state, toast } = useStore();
  const data = state.vms.filter(v => v.backup && v.backup !== 'None').flatMap(v =>
    [1, 2, 3].map(i => ({ id: `snap-${v.id.slice(3)}-${i}`, vm: v, date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), size: (3 + Math.random() * 3).toFixed(1) }))
  );
  return (
    <div className="card">
      <div className="card-body flush">
        <table className="tbl">
          <thead><tr><th>Snapshot ID</th><th>VM</th><th>Created</th><th className="right">Size</th><th></th></tr></thead>
          <tbody>
            {data.map(s => (
              <tr key={s.id}>
                <td className="mono text-xs">{s.id}</td>
                <td><div className="fw-6">{s.vm.name}</div><div className="text-xs text-mute mono">{s.vm.id}</div></td>
                <td className="tnum text-sm">{s.date}</td>
                <td className="right tnum text-sm">{s.size} GB</td>
                <td className="right">
                  <button className="btn sm" onClick={() => toast(`Restoring ${s.id}…`, 'info')}>Restore</button>
                  <button className="btn sm danger" style={{ marginLeft: 4 }} onClick={() => toast('Snapshot deleted', 'bad')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. MAINTENANCE WINDOWS
const MaintenanceView = ({ openModal }) => {
  const { toast } = useStore();
  const [windows, setWindows] = React.useState([
    { id: 'MW-001', title: 'Kernel upgrade — pve-node-03', start: '2026-06-02 02:00', duration: 120, scope: 'pve-node-03', impact: 'VMs live-migrated', status: 'Scheduled', notified: true },
    { id: 'MW-002', title: 'FortiGate firmware patch', start: '2026-06-15 23:00', duration: 60, scope: 'Network', impact: 'Brief connectivity blip', status: 'Scheduled', notified: false },
    { id: 'MW-003', title: 'PostgreSQL major upgrade', start: '2026-05-15 02:00', duration: 180, scope: 'Database', impact: '5 min API downtime', status: 'Completed', notified: true },
  ]);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Maintenance windows</h1>
          <p className="page-subtitle">{windows.filter(w => w.status === 'Scheduled').length} upcoming · auto-notify affected customers</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => openModal('newmaintenance', { onAdd: (m) => { const id = `MW-${String(windows.length + 4).padStart(3, '0')}`; setWindows([{ id, ...m, status: 'Scheduled', notified: false }, ...windows]); toast('Maintenance window scheduled', 'ok'); } })}><Icon name="plus" size={13}/>Schedule window</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Title</th><th>Start</th><th className="right">Duration</th><th>Scope</th><th>Impact</th><th>Status</th><th>Notified</th><th></th></tr></thead>
            <tbody>
              {windows.map(w => (
                <tr key={w.id}>
                  <td><div className="fw-6">{w.title}</div><div className="text-xs text-mute mono">{w.id}</div></td>
                  <td className="tnum text-sm">{w.start}</td>
                  <td className="right tnum">{w.duration} min</td>
                  <td className="mono text-xs">{w.scope}</td>
                  <td className="text-sm text-mute">{w.impact}</td>
                  <td><span className={`pill ${w.status === 'Completed' ? 'ok' : 'accent'}`}><span className="dot"/>{w.status}</span></td>
                  <td>{w.notified ? <span className="pill ok"><Icon name="check" size={10}/>Yes</span> : <button className="btn sm" onClick={() => { setWindows(ws => ws.map(x => x.id === w.id ? { ...x, notified: true } : x)); toast('Customer notifications sent', 'ok'); }}>Notify</button>}</td>
                  <td className="right"><button className="btn sm" onClick={() => toast('Maintenance editor opened', 'info')}><Icon name="edit" size={11}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 6. PATCH QUEUE — OS updates
const PatchesView = () => {
  const { state, toast } = useStore();
  const [selected, setSelected] = React.useState(new Set());
  const patches = state.vms.filter(v => v.status === 'Active').map(v => ({
    vm: v,
    available: Math.floor(Math.random() * 6),
    security: Math.floor(Math.random() * 3),
    lastApplied: v.id === 'VM-2087' ? '2026-05-12' : v.id === 'VM-2091' ? '2026-04-28' : '2026-05-08',
    kernel: '5.15.0-92-generic',
  })).filter(p => p.available > 0);

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Patch queue</h1>
          <p className="page-subtitle">{patches.length} VMs with available updates · {patches.reduce((a, p) => a + p.security, 0)} security patches across the fleet</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Scanning all VMs for updates…', 'info')}><Icon name="refresh" size={13}/>Scan for updates</button>
          <button className="btn accent" disabled={!selected.size} onClick={() => { toast(`Patching ${selected.size} VMs queued for next maintenance window`, 'info'); setSelected(new Set()); }}>
            <Icon name="check" size={13}/>Schedule patching
          </button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">VMs needing updates</div><div className="value tnum">{patches.length}</div></div>
        <div className="metric"><div className="label">Security patches</div><div className="value tnum" style={{ color: 'var(--bad)' }}>{patches.reduce((a, p) => a + p.security, 0)}</div></div>
        <div className="metric"><div className="label">Total updates</div><div className="value tnum">{patches.reduce((a, p) => a + p.available, 0)}</div></div>
        <div className="metric"><div className="label">Auto-patch enabled</div><div className="value tnum">3</div><div className="trend">of {state.vms.length} VMs</div></div>
      </div>

      <div className="card">
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr>
              <th style={{ width: 30 }}><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(patches.map(p => p.vm.id)) : new Set())}/></th>
              <th>VM</th><th>OS / Kernel</th><th className="right">Updates</th><th className="right">Security</th><th>Last applied</th><th></th>
            </tr></thead>
            <tbody>
              {patches.map(p => (
                <tr key={p.vm.id}>
                  <td><input type="checkbox" checked={selected.has(p.vm.id)} onChange={() => toggle(p.vm.id)}/></td>
                  <td><div className="fw-6">{p.vm.name}</div><div className="text-xs text-mute mono">{p.vm.id}</div></td>
                  <td><div className="text-sm">{p.vm.os}</div><div className="text-xs text-mute mono">{p.kernel}</div></td>
                  <td className="right tnum fw-6">{p.available}</td>
                  <td className="right tnum fw-6" style={{ color: p.security > 0 ? 'var(--bad)' : 'var(--ink-3)' }}>{p.security}</td>
                  <td className="tnum text-sm">{p.lastApplied}</td>
                  <td className="right"><button className="btn sm" onClick={() => toast(`Patching ${p.vm.name}…`, 'info')}>Patch now</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 7. FIREWALL RULES EDITOR
const FirewallView = () => {
  const { toast } = useStore();
  const [policy, setPolicy] = React.useState('fw-mlc-erp');
  const [rules, setRules] = React.useState([
    { id: 'r1', action: 'Allow', src: 'any', dst: '203.81.64.122', port: '443', proto: 'TCP', note: 'HTTPS public' },
    { id: 'r2', action: 'Allow', src: 'any', dst: '203.81.64.122', port: '80', proto: 'TCP', note: 'HTTP redirect' },
    { id: 'r3', action: 'Allow', src: '10.10.0.0/16', dst: '203.81.64.122', port: '22', proto: 'TCP', note: 'Internal SSH' },
    { id: 'r4', action: 'Allow', src: 'trusted-admin', dst: '203.81.64.122', port: '22', proto: 'TCP', note: 'Admin SSH (jumpbox)' },
    { id: 'r5', action: 'Deny', src: 'any', dst: '203.81.64.122', port: '*', proto: '*', note: 'Default deny' },
  ]);
  const [dragId, setDragId] = React.useState(null);

  const updateRule = (id, patch) => setRules(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  const deleteRule = (id) => setRules(rs => rs.filter(r => r.id !== id));
  const addRule = () => setRules([...rules, { id: 'r' + (rules.length + 1), action: 'Allow', src: 'any', dst: '', port: '', proto: 'TCP', note: '' }]);

  const onDragStart = (id) => setDragId(id);
  const onDrop = (id) => {
    if (!dragId || dragId === id) return;
    const next = [...rules];
    const from = next.findIndex(r => r.id === dragId);
    const to = next.findIndex(r => r.id === id);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRules(next);
    setDragId(null);
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Firewall rules</h1>
          <p className="page-subtitle">Edit FortiGate policies for each VM · drag to reorder · rules apply top-down</p>
        </div>
        <div className="page-actions">
          <select value={policy} onChange={e => setPolicy(e.target.value)} className="btn" style={{ padding: '6px 10px' }}>
            <option>fw-mlc-erp</option>
            <option>fw-yfg-app</option>
            <option>fw-yfg-db</option>
            <option>fw-sittwe-web</option>
            <option>fw-npd-staging</option>
            <option>fw-pyay-api</option>
          </select>
          <button className="btn accent" onClick={() => toast(`Applied ${rules.length} rules to ${policy}`, 'ok')}><Icon name="check" size={13}/>Apply to firewall</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">{policy}</h3>
          <button className="btn sm" onClick={addRule}><Icon name="plus" size={11}/>Add rule</button>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th style={{ width: 30 }}></th><th>#</th><th>Action</th><th>Source</th><th>Destination</th><th>Port</th><th>Protocol</th><th>Note</th><th></th></tr></thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={r.id} draggable onDragStart={() => onDragStart(r.id)} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(r.id)}
                  style={{ opacity: dragId === r.id ? 0.4 : 1, cursor: 'grab' }}>
                  <td className="text-mute"><Icon name="menu" size={14}/></td>
                  <td className="tnum fw-6">{i + 1}</td>
                  <td>
                    <select value={r.action} onChange={e => updateRule(r.id, { action: e.target.value })} style={{ padding: '3px 6px', fontSize: 11, fontWeight: 600, borderRadius: 999, border: 'none', background: r.action === 'Allow' ? 'var(--ok-soft)' : 'var(--bad-soft)', color: r.action === 'Allow' ? 'var(--ok)' : 'var(--bad)' }}>
                      <option>Allow</option><option>Deny</option>
                    </select>
                  </td>
                  <td><input value={r.src} onChange={e => updateRule(r.id, { src: e.target.value })} className="mono" style={{ width: '100%', border: '1px solid transparent', borderRadius: 4, padding: '3px 6px', fontSize: 12, background: 'transparent' }} onFocus={e => e.target.style.background = 'var(--surface-2)'} onBlur={e => e.target.style.background = 'transparent'}/></td>
                  <td><input value={r.dst} onChange={e => updateRule(r.id, { dst: e.target.value })} className="mono" style={{ width: '100%', border: '1px solid transparent', borderRadius: 4, padding: '3px 6px', fontSize: 12, background: 'transparent' }} onFocus={e => e.target.style.background = 'var(--surface-2)'} onBlur={e => e.target.style.background = 'transparent'}/></td>
                  <td><input value={r.port} onChange={e => updateRule(r.id, { port: e.target.value })} className="mono" style={{ width: 60, border: '1px solid transparent', borderRadius: 4, padding: '3px 6px', fontSize: 12, background: 'transparent' }} onFocus={e => e.target.style.background = 'var(--surface-2)'} onBlur={e => e.target.style.background = 'transparent'}/></td>
                  <td><select value={r.proto} onChange={e => updateRule(r.id, { proto: e.target.value })} className="mono" style={{ padding: '3px 6px', fontSize: 11, border: '1px solid var(--line)', borderRadius: 4, background: 'transparent' }}><option>TCP</option><option>UDP</option><option>ICMP</option><option>*</option></select></td>
                  <td><input value={r.note} onChange={e => updateRule(r.id, { note: e.target.value })} style={{ width: '100%', border: '1px solid transparent', borderRadius: 4, padding: '3px 6px', fontSize: 12, background: 'transparent' }} onFocus={e => e.target.style.background = 'var(--surface-2)'} onBlur={e => e.target.style.background = 'transparent'}/></td>
                  <td className="right"><button className="icon-btn" onClick={() => deleteRule(r.id)}><Icon name="trash" size={13}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { WebConsoleView, NodesView, TopologyView, SnapshotsView, MaintenanceView, PatchesView, FirewallView });
