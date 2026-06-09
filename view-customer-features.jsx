// Customer portal — Request VM, Account, Tickets list + detail

// ── Request VM — IaaS cloud-configurator style ────────────────────────────
const CustomerRequestVMView = ({ me, setView }) => {
  const { addTask, toast } = useStore();
  const [step, setStep] = React.useState(1);
  const [f, setF] = React.useState({
    purpose: '',
    hostname: '',
    os: 'ubuntu', osVersion: '22.04 LTS',
    sizing: 'preset',
    preset: 'business',
    vcpu: 4, ram: 16,
    volumes: [{ size: 200 }],
    bandwidth: '1 Gbps',
    backupEnabled: false,
    backupFrequency: 'Daily',
    backupRetention: 7,
    monitoring: false,
    zone: 'yangon-dc1',
    nics: [{ id: 1, label: 'NIC 1', type: 'Public', vlan: 'auto' }],
    firewallPorts: ['22', '80', '443'],
    portForwarding: [],
    vmProtection: 'none',
    ddosProtection: 'none',
    sslCertificate: 'none',
    loadBalancer: 'none',
    additionalNotes: '',
  });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const presets = [
    { id: 'starter', label: 'Starter', vcpu: 2, ram: 4, storage: 50, desc: 'Small services, dev work' },
    { id: 'standard', label: 'Standard', vcpu: 4, ram: 8, storage: 100, desc: 'Web apps, staging' },
    { id: 'business', label: 'Business', vcpu: 4, ram: 16, storage: 200, desc: 'Production workloads', popular: true },
    { id: 'performance', label: 'Performance', vcpu: 8, ram: 32, storage: 500, desc: 'Heavy traffic, databases' },
    { id: 'enterprise', label: 'Enterprise', vcpu: 16, ram: 64, storage: 1000, desc: 'Mission-critical' },
  ];

  const osCatalog = [
    { id: 'ubuntu', name: 'Ubuntu', accent: 'oklch(0.6 0.17 30)', versions: ['24.04 LTS', '22.04 LTS', '20.04 LTS'], logo: 'U' },
    { id: 'debian', name: 'Debian', accent: 'oklch(0.55 0.18 0)', versions: ['12 (Bookworm)', '11 (Bullseye)'], logo: 'D' },
    { id: 'rocky', name: 'Rocky Linux', accent: 'oklch(0.58 0.16 155)', versions: ['9.3', '9.2', '8.9'], logo: 'R' },
    { id: 'alpine', name: 'Alpine', accent: 'oklch(0.55 0.15 230)', versions: ['3.19', '3.18'], logo: 'A' },
    { id: 'centos', name: 'CentOS Stream', accent: 'oklch(0.55 0.17 285)', versions: ['9', '8'], logo: 'C' },
    { id: 'windows', name: 'Windows Server', accent: 'oklch(0.5 0.14 245)', versions: ['2022', '2019'], logo: 'W' },
  ];

  const zones = [
    { id: 'yangon-dc1', name: 'Yangon Zone A', flag: '🇲🇲', sub: 'Primary · low latency', latency: '2ms' },
    { id: 'yangon-dc2', name: 'Yangon Zone B', flag: '🇲🇲', sub: 'Secondary · DR pair', latency: '4ms' },
    { id: 'mandalay-dc1', name: 'Mandalay Zone A', flag: '🇲🇲', sub: 'North coverage', latency: '12ms' },
  ];

  const bandwidthOpts = ['100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps'];

  const commonPorts = [
    { port: '22', label: 'SSH', desc: 'Secure Shell' },
    { port: '80', label: 'HTTP', desc: 'Web traffic' },
    { port: '443', label: 'HTTPS', desc: 'Secure web' },
    { port: '3389', label: 'RDP', desc: 'Remote Desktop' },
    { port: '21', label: 'FTP', desc: 'File Transfer' },
    { port: '25', label: 'SMTP', desc: 'Email' },
    { port: '587', label: 'SMTP-TLS', desc: 'Email (TLS)' },
    { port: '3306', label: 'MySQL', desc: 'MySQL database' },
    { port: '5432', label: 'PostgreSQL', desc: 'PostgreSQL' },
    { port: '27017', label: 'MongoDB', desc: 'MongoDB' },
    { port: '6379', label: 'Redis', desc: 'Redis cache' },
    { port: '8080', label: 'HTTP-Alt', desc: 'Alternate HTTP' },
  ];

  const spec = f.sizing === 'preset'
    ? (presets.find(p => p.id === f.preset) || presets[2])
    : { vcpu: f.vcpu, ram: f.ram, storage: f.volumes[0]?.size || 200 };

  const cpuSteps = [1, 2, 4, 8, 16, 32];
  const ramSteps = [1, 2, 4, 8, 16, 32, 64, 128];
  const storageSteps = [25, 50, 100, 200, 500, 1000, 2000];

  const selectedOS = osCatalog.find(o => o.id === f.os) || osCatalog[0];
  const selectedZone = zones.find(z => z.id === f.zone) || zones[0];
  const hostValid = /^[a-z0-9][a-z0-9-]{1,30}$/i.test(f.hostname);

  const canContinue = () => {
    if (step === 1) return !!f.purpose;
    if (step === 2) return hostValid;
    return true;
  };

  // Volume helpers
  const setVolumeCount = (count) => {
    const cur = f.volumes;
    const next = count > cur.length
      ? [...cur, ...Array.from({ length: count - cur.length }, () => ({ size: 100 }))]
      : cur.slice(0, count);
    set('volumes', next);
  };
  const setVolumeSize = (idx, size) => {
    const next = [...f.volumes];
    next[idx] = { ...next[idx], size };
    set('volumes', next);
  };

  // Firewall helpers
  const togglePort = (port) => {
    const ports = f.firewallPorts;
    set('firewallPorts', ports.includes(port) ? ports.filter(p => p !== port) : [...ports, port]);
  };
  const [customPort, setCustomPort] = React.useState('');
  const addCustomPort = () => {
    const p = customPort.trim();
    if (!p || f.firewallPorts.includes(p)) return;
    set('firewallPorts', [...f.firewallPorts, p]);
    setCustomPort('');
  };

  // Port forwarding helpers
  const [pfDraft, setPfDraft] = React.useState({ srcPort: '', dstPort: '', protocol: 'TCP' });
  const addPfRule = () => {
    if (!pfDraft.srcPort || !pfDraft.dstPort) return;
    set('portForwarding', [...f.portForwarding, { ...pfDraft, id: Date.now() }]);
    setPfDraft({ srcPort: '', dstPort: '', protocol: 'TCP' });
  };
  const removePfRule = (id) => set('portForwarding', f.portForwarding.filter(r => r.id !== id));

  // NIC helpers
  const addNic = () => {
    if (f.nics.length >= 3) return;
    set('nics', [...f.nics, { id: Date.now(), label: `NIC ${f.nics.length + 1}`, type: 'Private', vlan: 'vlan-100' }]);
  };
  const removeNic = (id) => { if (f.nics.length > 1) set('nics', f.nics.filter(n => n.id !== id)); };
  const updateNic = (id, key, val) => set('nics', f.nics.map(n => n.id === id ? { ...n, [key]: val } : n));

  const submit = () => {
    const volumeDesc = f.volumes.map((v, i) => `Disk ${i+1}: ${v.size} GB SSD`).join(', ');
    addTask({
      title: `VM request — ${f.hostname} (${spec.vcpu}c / ${spec.ram}GB / ${f.volumes.map(v=>v.size).join('+')}GB)`,
      customer: me.id, vm: '', type: 'New', priority: 'Normal', status: 'Pending', team: 'Sales',
      subscription: '—',
      assignee: me.salesperson || '—',
      notes: `Customer-initiated VM request via portal.
Hostname: ${f.hostname}
Purpose: ${f.purpose || '—'}
Spec: ${spec.vcpu} vCPU · ${spec.ram} GB RAM · ${volumeDesc}${f.sizing === 'preset' ? ` (${presets.find(p=>p.id===f.preset)?.label} preset)` : ' (custom)'}
Bandwidth: ${f.bandwidth}
Backup: ${f.backupEnabled ? `${f.backupFrequency}, ${f.backupRetention}-day retention` : 'No'}
Monitoring: ${f.monitoring ? 'Enabled' : 'No'}
OS: ${selectedOS?.name} ${f.osVersion}
Zone: ${selectedZone?.name}
NICs: ${f.nics.map(n => `${n.label} (${n.type}, VLAN: ${n.vlan})`).join('; ')}
Firewall ports: ${f.firewallPorts.join(', ') || 'none'}
Port forwarding: ${f.portForwarding.length ? f.portForwarding.map(r => `${r.srcPort}→${r.dstPort}/${r.protocol}`).join(', ') : 'none'}
VM Protection: ${f.vmProtection}
DDoS Protection: ${f.ddosProtection}
SSL Certificate: ${f.sslCertificate}
Load Balancer: ${f.loadBalancer}
Customer notes: ${f.additionalNotes || '—'}`,
    });
    toast(`Deployment request sent — ${me.salesperson || 'Sales'} will confirm shortly`, 'ok');
    setView('requests');
  };

  const stepLabels = ['Purpose', 'Hostname & OS', 'Specification', 'Zone & Network', 'Firewall', 'Add-ons', 'Review'];
  const totalSteps = stepLabels.length;

  return (
    <div className="content" style={{ maxWidth: 1180, margin: '0 auto', paddingBottom: 100 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Deploy a new VM</h1>
          <p className="page-subtitle">Configure your instance — choose the specs you need</p>
        </div>
        <div className="page-actions">
          <span className="text-xs text-mute">Step {step} of {totalSteps}</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <React.Fragment key={label}>
                  <button
                    onClick={() => n < step && setStep(n)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      background: 'transparent', border: 'none',
                      cursor: n < step ? 'pointer' : 'default',
                      padding: '4px 4px', flexShrink: 0, minWidth: 68,
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: done ? 'var(--accent)' : active ? 'var(--accent-soft)' : 'var(--surface-3)',
                      color: done ? 'var(--accent-fg)' : active ? 'var(--accent-strong)' : 'var(--ink-3)',
                      display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13,
                      border: active ? '2px solid var(--accent)' : 'none',
                      transition: 'background 0.2s, transform 0.15s',
                      transform: active ? 'scale(1.08)' : 'scale(1)',
                    }}>{done ? <Icon name="check" size={14}/> : n}</div>
                    <span className="text-xs fw-6" style={{
                      color: active ? 'var(--ink)' : done ? 'var(--ink-2)' : 'var(--ink-3)',
                      whiteSpace: 'nowrap', letterSpacing: '0.005em',
                    }}>{label}</span>
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, minWidth: 8,
                      background: n < step ? 'var(--accent)' : 'var(--surface-3)',
                      marginTop: 16, transition: 'background 0.3s',
                    }}/>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step body */}
      <div className="grid-asym" style={{ gap: 24, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Step 1: Purpose ── */}
          {step === 1 && (
            <div className="card">
              <div className="card-head"><h3 className="card-title">What's this VM for?</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Purpose / project name</label>
                  <input value={f.purpose} onChange={e => set('purpose', e.target.value)} placeholder="e.g. Production web app, ERP database, dev environment"/>
                  <div className="hint">Helps your account manager allocate the right resources.</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Hostname & OS ── */}
          {step === 2 && (
            <>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Hostname</h3></div>
                <div className="card-body">
                  <div className="field">
                    <label>VM hostname</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        value={f.hostname}
                        onChange={e => set('hostname', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="my-production-app"
                        style={{ fontFamily: 'var(--mono)', paddingRight: 110, width: '100%' }}
                      />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>.vpsmm.local</span>
                    </div>
                    <div className="hint" style={{ color: f.hostname && !hostValid ? 'var(--bad)' : undefined }}>
                      {f.hostname && !hostValid
                        ? 'Hostname must be 2–31 chars, lowercase letters, digits, or hyphen.'
                        : 'Lowercase letters, digits, hyphens. 2–31 characters. Must start with a letter or digit.'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Choose an OS image</h3>
                  <span className="text-xs text-mute">{selectedOS?.name} {f.osVersion}</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {osCatalog.map(os => (
                      <IaaSCard key={os.id} selected={f.os === os.id} onClick={() => { set('os', os.id); set('osVersion', os.versions[0]); }} padding={14}>
                        <div className="flex center gap-2 mb-2">
                          <div style={{ width: 38, height: 38, borderRadius: 8, background: `${os.accent}1a`, color: os.accent, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{os.logo}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="fw-7 text-sm">{os.name}</div>
                            <div className="text-xs text-mute">{os.versions.length} versions</div>
                          </div>
                          {f.os === os.id && <Icon name="check" size={14} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <select
                          value={f.os === os.id ? f.osVersion : os.versions[0]}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { set('os', os.id); set('osVersion', e.target.value); }}
                          style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 5, background: 'var(--surface)', fontSize: 11.5 }}
                        >
                          {os.versions.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: Specification ── */}
          {step === 3 && (
            <>
              {/* Compute — preset or custom */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Compute</h3>
                  <div className="flex gap-1" style={{ background: 'var(--surface-3)', borderRadius: 8, padding: 3 }}>
                    {[['preset', 'Presets'], ['custom', 'Custom']].map(([id, label]) => (
                      <button key={id} onClick={() => set('sizing', id)}
                        style={{
                          padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                          background: f.sizing === id ? 'var(--surface)' : 'transparent',
                          color: f.sizing === id ? 'var(--ink)' : 'var(--ink-3)',
                          boxShadow: f.sizing === id ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.15s',
                        }}>{label}</button>
                    ))}
                  </div>
                </div>
                <div className="card-body">
                  {f.sizing === 'preset' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      {presets.map(p => (
                        <IaaSCard key={p.id} selected={f.preset === p.id} onClick={() => set('preset', p.id)} padding={16}>
                          <div className="flex center between mb-2">
                            <div className="flex center gap-2">
                              <span className="fw-7" style={{ fontSize: 15 }}>{p.label}</span>
                              {p.popular && <span className="pill accent" style={{ fontSize: 10 }}><span className="dot"/>Popular</span>}
                            </div>
                            {f.preset === p.id && <Icon name="check" size={15} style={{ color: 'var(--accent-strong)' }}/>}
                          </div>
                          <div className="text-xs text-mute mb-3">{p.desc}</div>
                          <div className="flex between" style={{ gap: 8 }}>
                            <SpecPill icon="cpu" value={p.vcpu} unit="vCPU"/>
                            <SpecPill icon="database" value={p.ram} unit="GB RAM"/>
                            <SpecPill icon="box" value={p.storage} unit="GB SSD"/>
                          </div>
                        </IaaSCard>
                      ))}
                    </div>
                  ) : (
                    <div className="flex col gap-4">
                      <SpecStepper label="vCPU cores" icon="cpu" steps={cpuSteps} value={f.vcpu} unit="" onChange={v => set('vcpu', v)}/>
                      <SpecStepper label="Memory" icon="database" steps={ramSteps} value={f.ram} unit=" GB" onChange={v => set('ram', v)}/>
                    </div>
                  )}
                </div>
              </div>

              {/* Storage volumes */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Storage volumes</h3>
                  <div className="flex center gap-2">
                    <span className="text-xs text-mute">Number of disks:</span>
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setVolumeCount(n)}
                        className={`filter-chip ${f.volumes.length === n ? 'active' : ''}`}
                        style={{ minWidth: 36 }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex col gap-4">
                    {f.volumes.map((vol, idx) => (
                      <div key={idx}>
                        <div className="flex center between mb-2">
                          <span className="fw-6 text-sm flex center gap-2">
                            <Icon name="box" size={13}/>
                            {idx === 0 ? 'System disk (OS)' : `Data disk ${idx}`}
                          </span>
                          <span className="tnum fw-7" style={{ fontSize: 15, color: 'var(--accent-strong)' }}>{vol.size} GB SSD</span>
                        </div>
                        <div className="flex gap-1 wrap">
                          {storageSteps.map(s => (
                            <button key={s} onClick={() => setVolumeSize(idx, s)}
                              className={`filter-chip ${vol.size === s ? 'active' : ''}`}
                              style={{ minWidth: 52, justifyContent: 'center' }}>
                              {s} GB
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Network bandwidth */}
              <div className="card">
                <div className="card-head"><h3 className="card-title">Network bandwidth</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {bandwidthOpts.map(bw => (
                      <IaaSCard key={bw} selected={f.bandwidth === bw} onClick={() => set('bandwidth', bw)} padding={12}>
                        <div className="flex center between mb-1">
                          <span className="fw-7 text-sm">{bw}</span>
                          {f.bandwidth === bw && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="text-xs text-mute">{bw === '10 Gbps' ? 'Dedicated line' : bw === '1 Gbps' ? 'Recommended' : bw === '100 Mbps' ? 'Basic' : 'Standard'}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              {/* Backup service */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Backup service</h3>
                  <span className={`toggle ${f.backupEnabled ? 'on' : ''}`} onClick={() => set('backupEnabled', !f.backupEnabled)}/>
                </div>
                {f.backupEnabled && (
                  <div className="card-body">
                    <div className="flex col gap-3">
                      <div>
                        <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Frequency</div>
                        <div className="flex gap-2">
                          {['Daily', 'Weekly', 'Monthly'].map(freq => (
                            <button key={freq} className={`filter-chip ${f.backupFrequency === freq ? 'active' : ''}`} onClick={() => set('backupFrequency', freq)}>{freq}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Retention</div>
                        <div className="flex gap-2">
                          {[7, 14, 30, 90].map(days => (
                            <button key={days} className={`filter-chip ${f.backupRetention === days ? 'active' : ''}`} onClick={() => set('backupRetention', days)}>{days} days</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Managed monitoring */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Managed monitoring & alerts</div>
                    <div className="text-xs text-mute mt-1">CPU, RAM, disk, and uptime alerts via email/SMS</div>
                  </div>
                  <span className={`toggle ${f.monitoring ? 'on' : ''}`} onClick={() => set('monitoring', !f.monitoring)}/>
                </div>
              </div>
            </>
          )}

          {/* ── Step 4: Zone & Network ── */}
          {step === 4 && (
            <>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Choose a zone</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {zones.map(z => (
                      <IaaSCard key={z.id} selected={f.zone === z.id} onClick={() => set('zone', z.id)} padding={14}>
                        <div className="flex center between mb-2">
                          <div style={{ fontSize: 24, lineHeight: 1 }}>{z.flag}</div>
                          {f.zone === z.id && <Icon name="check" size={14} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="fw-7 text-sm">{z.name}</div>
                        <div className="text-xs text-mute">{z.sub}</div>
                        <div className="text-xs mt-2 mono"><span className="text-mute">Latency:</span> <span className="fw-6">{z.latency}</span></div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              {/* Network Interface Controllers */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Network interfaces (NICs)</h3>
                  {f.nics.length < 3 && (
                    <button className="btn sm" onClick={addNic}><Icon name="plus" size={11}/>Add NIC</button>
                  )}
                </div>
                <div className="card-body">
                  <div className="flex col gap-3">
                    {f.nics.map((nic, idx) => (
                      <div key={nic.id} style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
                        <div className="flex center between mb-3">
                          <div className="flex center gap-2">
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: idx === 0 ? 'var(--accent-soft)' : 'var(--surface-3)', color: idx === 0 ? 'var(--accent-strong)' : 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
                              <Icon name="network" size={13}/>
                            </div>
                            <div>
                              <div className="fw-7 text-sm">{nic.label}</div>
                              {idx === 0 && <div className="text-xs text-mute">Primary interface</div>}
                            </div>
                          </div>
                          {idx > 0 && (
                            <button className="btn sm danger" onClick={() => removeNic(nic.id)}><Icon name="trash" size={11}/>Remove</button>
                          )}
                        </div>
                        <div className="grid-2" style={{ gap: 12 }}>
                          <div>
                            <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Interface type</div>
                            <div className="flex gap-2">
                              {['Public', 'Private'].map(t => (
                                <button key={t} className={`filter-chip ${nic.type === t ? 'active' : ''}`} onClick={() => updateNic(nic.id, 'type', t)}>{t}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>VLAN / subnet</div>
                            <select value={nic.vlan} onChange={e => updateNic(nic.id, 'vlan', e.target.value)}
                              style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12, width: '100%' }}>
                              <option value="auto">Auto-assign</option>
                              <option value="vlan-100">VLAN 100 (default)</option>
                              <option value="vlan-200">VLAN 200 (management)</option>
                              <option value="vlan-300">VLAN 300 (storage)</option>
                              <option value="vlan-400">VLAN 400 (backup)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-mute mt-2">Up to 3 NICs per VM. Additional NICs require VLAN setup by the network team.</div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="field">
                    <label>Anything else for our team? (optional)</label>
                    <textarea rows="3" value={f.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} placeholder="Migration timeline, integrations, preferred contact…"/>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 5: Firewall ── */}
          {step === 5 && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Firewall rules — inbound ports</h3>
                  <span className="text-xs text-mute">{f.firewallPorts.length} port{f.firewallPorts.length !== 1 ? 's' : ''} open</span>
                </div>
                <div className="card-body">
                  <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Common services — select all that apply</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {commonPorts.map(p => {
                      const active = f.firewallPorts.includes(p.port);
                      return (
                        <button key={p.port} onClick={() => togglePort(p.port)}
                          style={{
                            textAlign: 'left', padding: 12,
                            background: active ? 'var(--accent-soft)' : 'var(--surface)',
                            border: '1.5px solid', borderColor: active ? 'var(--accent)' : 'var(--line)',
                            borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                            transition: 'all 0.15s',
                          }}>
                          <div className="flex center between mb-1">
                            <span className="mono fw-7 text-sm" style={{ color: active ? 'var(--accent-strong)' : 'var(--ink)' }}>{p.port}</span>
                            {active && <Icon name="check" size={12} style={{ color: 'var(--accent-strong)' }}/>}
                          </div>
                          <div className="fw-6 text-xs">{p.label}</div>
                          <div className="text-xs text-mute">{p.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs text-mute fw-6 mt-4 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Custom port</div>
                  <div className="flex gap-2">
                    <input value={customPort} onChange={e => setCustomPort(e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && addCustomPort()}
                      placeholder="e.g. 8443"
                      style={{ width: 120, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5, fontFamily: 'var(--mono)' }}
                    />
                    <button className="btn" onClick={addCustomPort}><Icon name="plus" size={12}/>Add port</button>
                  </div>

                  {f.firewallPorts.length > 0 && (
                    <div style={{ marginTop: 16, padding: 12, background: 'var(--surface-2)', borderRadius: 8 }}>
                      <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Open ports</div>
                      <div className="flex gap-1 wrap">
                        {f.firewallPorts.map(p => (
                          <span key={p} className="pill accent" style={{ paddingRight: 4 }}>
                            <span className="mono">{p}</span>
                            <button className="icon-btn" style={{ width: 16, height: 16, marginLeft: 2 }} onClick={() => togglePort(p)}><Icon name="x" size={9}/></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Port forwarding */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Port forwarding</h3>
                  <span className="text-xs text-mute">{f.portForwarding.length} rule{f.portForwarding.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="card-body">
                  <div className="text-xs text-mute mb-3">Map incoming public ports to internal destination ports on this VM.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px auto', gap: 8, marginBottom: 12, alignItems: 'end' }}>
                    <div>
                      <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Source port</div>
                      <input value={pfDraft.srcPort} onChange={e => setPfDraft({ ...pfDraft, srcPort: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 8080" style={{ fontFamily: 'var(--mono)', width: '100%' }}/>
                    </div>
                    <div>
                      <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Destination port</div>
                      <input value={pfDraft.dstPort} onChange={e => setPfDraft({ ...pfDraft, dstPort: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 80" style={{ fontFamily: 'var(--mono)', width: '100%' }}/>
                    </div>
                    <div>
                      <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Protocol</div>
                      <select value={pfDraft.protocol} onChange={e => setPfDraft({ ...pfDraft, protocol: e.target.value })}
                        style={{ padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12, width: '100%' }}>
                        <option>TCP</option><option>UDP</option><option>TCP+UDP</option>
                      </select>
                    </div>
                    <button className="btn primary" onClick={addPfRule} disabled={!pfDraft.srcPort || !pfDraft.dstPort}><Icon name="plus" size={12}/>Add</button>
                  </div>
                  {f.portForwarding.length > 0 ? (
                    <table className="tbl">
                      <thead><tr><th>Source port</th><th></th><th>Destination port</th><th>Protocol</th><th></th></tr></thead>
                      <tbody>
                        {f.portForwarding.map(r => (
                          <tr key={r.id}>
                            <td className="mono fw-6">{r.srcPort}</td>
                            <td className="text-mute text-xs">→</td>
                            <td className="mono fw-6">{r.dstPort}</td>
                            <td><span className="pill subtle mono">{r.protocol}</span></td>
                            <td className="right"><button className="btn sm danger" onClick={() => removePfRule(r.id)}><Icon name="trash" size={11}/></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-xs text-mute" style={{ padding: '10px 0' }}>No rules yet. Add a rule above to forward public traffic to an internal port.</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Step 6: Add-on Services ── */}
          {step === 6 && (
            <>
              <div className="card">
                <div className="card-head"><h3 className="card-title">VM protection</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'No automated protection', icon: 'x' },
                      { id: 'daily', label: 'Daily snapshot', desc: 'Automated daily snapshots, 7-day retention', icon: 'refresh' },
                      { id: 'advanced', label: 'Advanced backup', desc: 'Daily + weekly + cross-zone replication', icon: 'shield' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.vmProtection === opt.id} onClick={() => set('vmProtection', opt.id)} padding={14}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: f.vmProtection === opt.id ? 'var(--accent-soft)' : 'var(--surface-3)', color: f.vmProtection === opt.id ? 'var(--accent-strong)' : 'var(--ink-3)', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
                          <Icon name={opt.icon} size={13}/>
                        </div>
                        <div className="fw-7 text-sm">{opt.label}</div>
                        <div className="text-xs text-mute mt-1">{opt.desc}</div>
                        {f.vmProtection === opt.id && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)', marginTop: 6 }}/>}
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3 className="card-title">DDoS protection</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'No DDoS mitigation', color: 'var(--ink-3)' },
                      { id: 'standard', label: 'Standard', desc: 'L3/L4 volumetric mitigation up to 10 Gbps', color: 'oklch(0.55 0.16 75)' },
                      { id: 'advanced', label: 'Advanced', desc: 'L7 application protection + 24/7 SOC monitoring', color: 'var(--bad)' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.ddosProtection === opt.id} onClick={() => set('ddosProtection', opt.id)} padding={14}>
                        <div className="flex center between mb-2">
                          <div className="fw-7 text-sm" style={{ color: f.ddosProtection === opt.id ? opt.color : 'var(--ink)' }}>{opt.label}</div>
                          {f.ddosProtection === opt.id && <Icon name="check" size={13} style={{ color: opt.color }}/>}
                        </div>
                        <div className="text-xs text-mute">{opt.desc}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3 className="card-title">SSL / TLS certificate</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'Manage your own certificates' },
                      { id: 'standard', label: 'Standard DV', desc: 'Domain-validated certificate, single domain' },
                      { id: 'wildcard', label: 'Wildcard', desc: 'Covers *.yourdomain.com and all subdomains' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.sslCertificate === opt.id} onClick={() => set('sslCertificate', opt.id)} padding={14}>
                        <div className="flex center between mb-2">
                          <div className="fw-7 text-sm">{opt.label}</div>
                          {f.sslCertificate === opt.id && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="text-xs text-mute">{opt.desc}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3 className="card-title">Load balancer</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'Direct traffic to this VM only' },
                      { id: 'shared', label: 'Shared LB', desc: 'Multi-tenant balancer, HTTP/HTTPS routing' },
                      { id: 'dedicated', label: 'Dedicated LB', desc: 'Dedicated instance, custom rules + health checks' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.loadBalancer === opt.id} onClick={() => set('loadBalancer', opt.id)} padding={14}>
                        <div className="flex center between mb-2">
                          <div className="fw-7 text-sm">{opt.label}</div>
                          {f.loadBalancer === opt.id && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="text-xs text-mute">{opt.desc}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 7: Review ── */}
          {step === 7 && (
            <div className="card">
              <div className="card-head"><h3 className="card-title">Review your configuration</h3></div>
              <div className="card-body">
                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Instance</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <ReviewBlock icon="server" label="Hostname" value={<span className="mono">{f.hostname}.vpsmm.local</span>}/>
                  <ReviewBlock icon="box" label="Purpose" value={f.purpose || '—'}/>
                  <ReviewBlock icon="database" label="Operating system" value={`${selectedOS?.name} ${f.osVersion}`}/>
                  <ReviewBlock icon="globe" label="Zone" value={selectedZone?.name}/>
                </div>

                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Compute & storage</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <ReviewBlock icon="cpu" label="vCPU" value={`${spec.vcpu} cores`}/>
                  <ReviewBlock icon="database" label="Memory" value={`${spec.ram} GB RAM`}/>
                  <ReviewBlock icon="box" label="Storage" value={`${f.volumes.length} disk${f.volumes.length > 1 ? 's' : ''} · ${f.volumes.map((v,i) => `Disk ${i+1}: ${v.size} GB`).join(', ')}`}/>
                  <ReviewBlock icon="network" label="Bandwidth" value={f.bandwidth}/>
                  <ReviewBlock icon="refresh" label="Backup" value={f.backupEnabled ? `${f.backupFrequency} · ${f.backupRetention}-day retention` : 'Disabled'}/>
                  <ReviewBlock icon="alert" label="Monitoring" value={f.monitoring ? 'Enabled' : 'Disabled'}/>
                </div>

                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Network interfaces</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  {f.nics.map(nic => (
                    <ReviewBlock key={nic.id} icon="network" label={nic.label} value={`${nic.type} · VLAN: ${nic.vlan}`}/>
                  ))}
                </div>

                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Firewall</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <ReviewBlock icon="shield" label="Open ports" value={f.firewallPorts.length > 0 ? f.firewallPorts.join(', ') : 'None'}/>
                  <ReviewBlock icon="network" label="Port forwarding" value={f.portForwarding.length > 0 ? `${f.portForwarding.length} rule${f.portForwarding.length > 1 ? 's' : ''}` : 'None'}/>
                </div>

                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Add-on services</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 8 }}>
                  <ReviewBlock icon="shield" label="VM protection" value={f.vmProtection === 'none' ? 'None' : f.vmProtection === 'daily' ? 'Daily snapshot' : 'Advanced backup'}/>
                  <ReviewBlock icon="alert" label="DDoS protection" value={f.ddosProtection === 'none' ? 'None' : f.ddosProtection.charAt(0).toUpperCase() + f.ddosProtection.slice(1)}/>
                  <ReviewBlock icon="lock" label="SSL certificate" value={f.sslCertificate === 'none' ? 'None' : f.sslCertificate === 'standard' ? 'Standard DV' : 'Wildcard'}/>
                  <ReviewBlock icon="network" label="Load balancer" value={f.loadBalancer === 'none' ? 'None' : f.loadBalancer === 'shared' ? 'Shared LB' : 'Dedicated LB'}/>
                </div>

                {f.additionalNotes && (
                  <div style={{ marginTop: 16, padding: 14, background: 'var(--surface-2)', borderRadius: 8 }}>
                    <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Notes for our team</div>
                    <div className="text-sm">{f.additionalNotes}</div>
                  </div>
                )}
                <div className="card" style={{ background: 'var(--info-soft)', borderColor: 'transparent', marginTop: 16 }}>
                  <div className="card-body" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Icon name="alert" size={14} style={{ marginTop: 2, color: 'var(--info)' }}/>
                    <div style={{ fontSize: 12.5, color: 'var(--info)' }}>
                      Submitting sends this to <strong>{me.salesperson}</strong> as a Pending request. Your account manager will confirm the configuration and follow up with next steps.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step navigation */}
          <div className="flex center" style={{ gap: 10, paddingTop: 8 }}>
            {step > 1 && <button className="btn" onClick={() => setStep(step - 1)}><Icon name="chevron-left" size={11}/>Back</button>}
            <div style={{ flex: 1 }}/>
            {step < totalSteps && <button className="btn primary" disabled={!canContinue()} onClick={() => setStep(step + 1)}>Continue<Icon name="chevron-right" size={11}/></button>}
            {step === totalSteps && <button className="btn accent" onClick={submit} style={{ padding: '10px 18px', fontSize: 13 }}><Icon name="check" size={13}/>Submit deployment request</button>}
          </div>
        </div>

        {/* Sticky configuration summary */}
        <div style={{ position: 'sticky', top: 16 }}>
          <div className="card">
            <div className="card-head" style={{ paddingTop: 14, paddingBottom: 12 }}>
              <h3 className="card-title">Your configuration</h3>
              <span className="pill accent" style={{ fontSize: 10 }}><span className="dot"/>{f.sizing === 'preset' ? (presets.find(p=>p.id===f.preset)?.label || 'Preset') : 'Custom'}</span>
            </div>
            <div className="card-body" style={{ padding: '14px 18px' }}>
              <SummaryLine icon="server" label="Hostname" value={f.hostname || <span className="text-mute">not set</span>} mono/>
              <SummaryLine icon="database" label="OS" value={selectedOS ? `${selectedOS.name} ${f.osVersion}` : '—'}/>
              <div className="divider" style={{ margin: '10px 0' }}/>
              <SummaryLine icon="cpu" label="vCPU" value={`${spec.vcpu} cores`}/>
              <SummaryLine icon="database" label="RAM" value={`${spec.ram} GB`}/>
              <SummaryLine icon="box" label={`Storage (${f.volumes.length} disk${f.volumes.length > 1 ? 's' : ''})`} value={`${f.volumes.reduce((a, v) => a + v.size, 0)} GB SSD`}/>
              <SummaryLine icon="network" label="Bandwidth" value={f.bandwidth}/>
              <SummaryLine icon="refresh" label="Backup" value={f.backupEnabled ? f.backupFrequency : 'No'}/>
              <SummaryLine icon="alert" label="Monitoring" value={f.monitoring ? 'Enabled' : 'No'}/>
              <div className="divider" style={{ margin: '10px 0' }}/>
              <SummaryLine icon="globe" label="Zone" value={selectedZone?.name || '—'}/>
              <SummaryLine icon="network" label="NICs" value={`${f.nics.length} interface${f.nics.length > 1 ? 's' : ''}`}/>
              <SummaryLine icon="shield" label="Firewall" value={`${f.firewallPorts.length} port${f.firewallPorts.length !== 1 ? 's' : ''} open`}/>
              {(f.vmProtection !== 'none' || f.ddosProtection !== 'none' || f.sslCertificate !== 'none' || f.loadBalancer !== 'none') && (
                <>
                  <div className="divider" style={{ margin: '10px 0' }}/>
                  {f.vmProtection !== 'none' && <SummaryLine icon="shield" label="VM protection" value={f.vmProtection === 'daily' ? 'Daily snapshot' : 'Advanced'}/>}
                  {f.ddosProtection !== 'none' && <SummaryLine icon="alert" label="DDoS" value={f.ddosProtection.charAt(0).toUpperCase() + f.ddosProtection.slice(1)}/>}
                  {f.sslCertificate !== 'none' && <SummaryLine icon="lock" label="SSL" value={f.sslCertificate === 'standard' ? 'Standard DV' : 'Wildcard'}/>}
                  {f.loadBalancer !== 'none' && <SummaryLine icon="network" label="Load balancer" value={f.loadBalancer === 'shared' ? 'Shared' : 'Dedicated'}/>}
                </>
              )}
            </div>
          </div>
          <div className="text-xs text-mute mt-3" style={{ textAlign: 'center' }}>
            Need help? Contact <strong>{me.salesperson}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

// IaaS-style selectable card
const IaaSCard = ({ children, selected, onClick, padding = 14 }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      textAlign: 'left',
      padding,
      background: selected ? 'var(--accent-soft)' : 'var(--surface)',
      border: '1.5px solid',
      borderColor: selected ? 'var(--accent)' : 'var(--line)',
      borderRadius: 10,
      cursor: 'pointer',
      transition: 'border-color 0.15s, background 0.15s, transform 0.05s',
      fontFamily: 'inherit',
      color: 'var(--ink)',
      boxShadow: selected ? '0 0 0 3px var(--accent-soft)' : 'none',
      width: '100%',
    }}
  >
    {children}
  </button>
);

const SummaryLine = ({ icon, label, value, mono }) => (
  <div className="flex center between" style={{ padding: '5px 0', fontSize: 12 }}>
    <span className="text-mute flex center gap-2"><Icon name={icon} size={11}/>{label}</span>
    <span className={mono ? 'mono fw-6' : 'fw-6'} style={{ fontSize: 12, textAlign: 'right', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
  </div>
);

// Spec pill used inside preset cards
const SpecPill = ({ icon, value, unit }) => (
  <div style={{ flex: 1, padding: '8px 6px', background: 'var(--surface-2)', borderRadius: 8, textAlign: 'center' }}>
    <Icon name={icon} size={13} className="text-mute"/>
    <div className="tnum fw-7" style={{ fontSize: 15, marginTop: 2 }}>{value}</div>
    <div className="text-xs text-mute">{unit}</div>
  </div>
);

// Custom spec stepper (chip row)
const SpecStepper = ({ label, icon, steps, value, unit, onChange }) => (
  <div>
    <div className="flex center between mb-2">
      <span className="fw-6 text-sm flex center gap-2"><Icon name={icon} size={13}/>{label}</span>
      <span className="tnum fw-7" style={{ fontSize: 15, color: 'var(--accent-strong)' }}>{value}{unit}</span>
    </div>
    <div className="flex gap-1 wrap">
      {steps.map(s => (
        <button key={s}
          onClick={() => onChange(s)}
          className={`filter-chip ${value === s ? 'active' : ''}`}
          style={{ minWidth: 52, justifyContent: 'center' }}>
          {s}{unit}
        </button>
      ))}
    </div>
  </div>
);

const ReviewBlock = ({ icon, label, value }) => (
  <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={13}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div className="text-sm fw-6 mt-1" style={{ wordBreak: 'break-word' }}>{value}</div>
    </div>
  </div>
);

// ── Account view ─────────────────────────────────────────────────────────
const CustomerAccountView = ({ me }) => {
  const { updateCustomer, toast } = useStore();
  const [profile, setProfile] = React.useState({ name: me.name, email: me.email, phone: me.phone, company: me.company });
  const [security, setSecurity] = React.useState({ twoFA: true, emailNotif: true, renewalReminders: true });

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Account</h1>
          <p className="page-subtitle">Manage your profile and security settings</p>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <div className="flex center gap-3">
            <Avatar name={profile.name} size={56}/>
            <div style={{ flex: 1 }}>
              <div className="fw-7" style={{ fontSize: 17 }}>{profile.name}</div>
              <div className="text-sm text-mute">{profile.company} · {me.id}</div>
              <div className="flex gap-2 mt-2">
                <StatusPill status={me.kyc}/>
                <StatusPill status={me.status}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Profile</h3>
            <button className="btn sm accent" onClick={() => { updateCustomer(me.id, profile); toast('Profile saved', 'ok'); }}><Icon name="check" size={11}/>Save</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="field"><label>Contact name</label><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}/></div>
              <div className="field"><label>Company</label><input value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })}/></div>
              <div className="field"><label>Email</label><input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}/></div>
              <div className="field"><label>Phone</label><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={{ fontFamily: 'var(--mono)' }}/></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Security & notifications</h3>
            <button className="btn sm accent" onClick={() => toast('Settings saved', 'ok')}><Icon name="check" size={11}/>Save</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="flex center between"><span className="text-sm">Two-factor auth</span><span className={`toggle ${security.twoFA ? 'on' : ''}`} onClick={() => setSecurity({ ...security, twoFA: !security.twoFA })}/></div>
              <div className="flex center between"><span className="text-sm">Email notifications</span><span className={`toggle ${security.emailNotif ? 'on' : ''}`} onClick={() => setSecurity({ ...security, emailNotif: !security.emailNotif })}/></div>
              <div className="flex center between"><span className="text-sm">Renewal reminders (30/7/1 day)</span><span className={`toggle ${security.renewalReminders ? 'on' : ''}`} onClick={() => setSecurity({ ...security, renewalReminders: !security.renewalReminders })}/></div>
              <div className="divider"/>
              <button className="btn" onClick={() => toast('Password reset email sent', 'info')}><Icon name="key" size={12}/>Change password</button>
              <button className="btn" onClick={() => toast('Account data export queued', 'info')}><Icon name="download" size={12}/>Download my data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tickets list — IaaS-style with stat cards + card grid ──────────────────
const CustomerTicketsView = ({ me, myTickets, setOpenTicket }) => {
  const [composing, setComposing] = React.useState(false);
  const [filter, setFilter] = React.useState('all');
  const [sort, setSort] = React.useState('updated');

  const statusConfig = {
    'Open': { color: 'oklch(0.62 0.15 230)', bg: 'var(--info-soft)', icon: 'mail', desc: 'Awaiting first response' },
    'In Progress': { color: 'oklch(0.55 0.16 75)', bg: 'var(--warn-soft)', icon: 'refresh', desc: 'Our team is working on it' },
    'Resolved': { color: 'var(--ok)', bg: 'var(--ok-soft)', icon: 'check', desc: 'Issue resolved · ready to close' },
    'Closed': { color: 'var(--ink-3)', bg: 'var(--surface-3)', icon: 'lock', desc: 'Conversation archived' },
  };

  const stats = ['Open', 'In Progress', 'Resolved', 'Closed'].map(s => ({
    status: s,
    count: myTickets.filter(t => t.status === s).length,
    ...statusConfig[s],
  }));

  let list = filter === 'all' ? myTickets : myTickets.filter(t => t.status === filter);
  list = [...list].sort((a, b) => sort === 'updated'
    ? b.updated.localeCompare(a.updated)
    : a.priority === 'Urgent' ? -1 : 1);

  return (
    <div className="content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Support tickets</h1>
          <p className="page-subtitle">{myTickets.length} total · responses within 4 hours during business hours</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setComposing(true)}><Icon name="plus" size={13}/>New ticket</button>
        </div>
      </div>

      {/* Stat cards — IaaS style */}
      <div className="grid-4 mb-4">
        {stats.map(s => {
          const active = filter === s.status;
          return (
            <button
              key={s.status}
              onClick={() => setFilter(filter === s.status ? 'all' : s.status)}
              style={{
                textAlign: 'left',
                padding: 16,
                background: active ? s.bg : 'var(--surface)',
                border: '1.5px solid',
                borderColor: active ? s.color : 'var(--line)',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: 'inherit', color: 'var(--ink)',
                transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
                boxShadow: active ? `0 0 0 3px ${s.bg}` : 'none',
              }}>
              <div className="flex center between mb-2">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${s.color}1a`, color: s.color,
                  display: 'grid', placeItems: 'center',
                }}><Icon name={s.icon} size={14}/></div>
                {active && <Icon name="check" size={14} style={{ color: s.color }}/>}
              </div>
              <div className="tnum fw-7" style={{ fontSize: 24, lineHeight: 1.1 }}>{s.count}</div>
              <div className="fw-6 text-sm mt-1" style={{ color: s.color }}>{s.status}</div>
              <div className="text-xs text-mute mt-1">{s.desc}</div>
            </button>
          );
        })}
      </div>

      {composing && (
        <NewTicketForm me={me} onClose={() => setComposing(false)} onCreated={() => setComposing(false)}/>
      )}

      {/* Filter bar */}
      <div className="flex center between mb-3">
        <div className="flex gap-2 wrap">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All<span className="ct">{myTickets.length}</span></button>
          {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}<span className="ct">{stats.find(x => x.status === s).count}</span>
            </button>
          ))}
        </div>
        <div className="flex center gap-2">
          <span className="text-xs text-mute">Sort by</span>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12 }}>
            <option value="updated">Recently updated</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Ticket cards — IaaS style */}
      {list.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="title">No tickets {filter !== 'all' ? `in ${filter}` : 'yet'}</div>
            <div className="sub">Click "New ticket" to open one.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {list.map(t => {
            const cfg = statusConfig[t.status];
            return (
              <button
                key={t.id}
                onClick={() => setOpenTicket(t)}
                style={{
                  textAlign: 'left',
                  padding: 18,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderLeft: `4px solid ${cfg.color}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: 'inherit', color: 'var(--ink)',
                  transition: 'border-color 0.15s, transform 0.1s, box-shadow 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.borderLeftColor = cfg.color; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.borderLeftColor = cfg.color; e.currentTarget.style.boxShadow = 'none'; }}>
                <div className="flex center between">
                  <div className="flex center gap-2">
                    <span className="mono text-xs text-mute">{t.id}</span>
                    <span className="pill subtle" style={{ fontSize: 10 }}>{t.replies.length} {t.replies.length === 1 ? 'reply' : 'replies'}</span>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 999,
                    background: cfg.bg, color: cfg.color,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color }}/>
                    {t.status}
                  </div>
                </div>
                <div>
                  <div className="fw-7 text-sm" style={{ lineHeight: 1.4 }}>{t.subject}</div>
                  <div className="text-xs text-mute mt-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{t.body}</div>
                </div>
                <div className="flex center between" style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <div className="flex center gap-2">
                    <span className={`pill ${t.priority === 'Urgent' ? 'bad' : t.priority === 'Low' ? 'subtle' : 'warn'}`} style={{ fontSize: 10 }}>
                      <span className="dot"/>{t.priority}
                    </span>
                    {t.assignee !== '—' && (
                      <div className="flex center gap-1">
                        <Avatar name={t.assignee} size={18}/>
                        <span className="text-xs">{t.assignee}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-mute">{t.updated.slice(5, 16).replace(' ', ' · ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

const NewTicketForm = ({ me, onClose, onCreated }) => {
  const { addTicket } = useStore();
  const [f, setF] = React.useState({ subject: '', priority: 'Normal', body: '', category: 'general' });
  const submit = () => {
    if (!f.subject || !f.body) return;
    const id = addTicket({ ...f, customer: me.id });
    onCreated(id);
  };

  const categories = [
    { id: 'general', label: 'General question', icon: 'mail', accent: 'oklch(0.6 0.13 250)' },
    { id: 'technical', label: 'Technical issue', icon: 'cpu', accent: 'oklch(0.55 0.18 285)' },
    { id: 'billing', label: 'Billing', icon: 'invoice', accent: 'oklch(0.55 0.16 155)' },
    { id: 'urgent', label: 'Service outage', icon: 'alert', accent: 'oklch(0.55 0.18 25)' },
  ];

  const priorities = [
    { id: 'Low', desc: 'Within 1 business day', color: 'var(--ink-3)' },
    { id: 'Normal', desc: 'Within 4 hours', color: 'oklch(0.55 0.16 75)' },
    { id: 'Urgent', desc: 'ASAP · within 1 hour', color: 'var(--bad)' },
  ];

  return (
    <div className="card mb-4" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      <div className="card-head">
        <div>
          <h3 className="card-title">New support ticket</h3>
          <div className="text-xs text-mute mt-1">Our team will respond based on the priority you select</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div className="card-body">
        <div className="flex col gap-4">
          <div>
            <label style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {categories.map(c => (
                <IaaSCard key={c.id} selected={f.category === c.id} onClick={() => setF({...f, category: c.id})} padding={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.accent}1a`, color: c.accent, display: 'grid', placeItems: 'center' }}>
                      <Icon name={c.icon} size={15}/>
                    </div>
                    <div className="fw-6 text-xs">{c.label}</div>
                  </div>
                </IaaSCard>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Subject</label>
            <input value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} placeholder="Brief summary of the issue"/>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Priority</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {priorities.map(p => (
                <IaaSCard key={p.id} selected={f.priority === p.id} onClick={() => setF({...f, priority: p.id})} padding={12}>
                  <div className="flex center between">
                    <div>
                      <div className="fw-7 text-sm" style={{ color: f.priority === p.id ? p.color : 'var(--ink)' }}>{p.id}</div>
                      <div className="text-xs text-mute mt-1">{p.desc}</div>
                    </div>
                    {f.priority === p.id && <Icon name="check" size={14} style={{ color: p.color }}/>}
                  </div>
                </IaaSCard>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Describe the issue</label>
            <textarea rows="6" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} placeholder="Include VM IDs, error messages, and any steps already tried…"/>
            <div className="hint">Tip: include the VM ID and the exact error message for fastest resolution.</div>
          </div>

          <div className="flex gap-2" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <div style={{ flex: 1 }}/>
            <button className="btn" onClick={() => { onClose(); }}>Save as draft</button>
            <button className="btn accent" disabled={!f.subject || !f.body} onClick={submit}><Icon name="check" size={12}/>Submit ticket</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Ticket detail (full page) — view, reply, change status, delete ───────
const CustomerTicketDetail = ({ ticket: initial, onClose }) => {
  const { state, replyTicket, setTicketStatus, updateTicket, deleteTicket, toast } = useStore();
  const ticket = state.tickets.find(t => t.id === initial.id) || initial;
  const [reply, setReply] = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({ subject: ticket.subject, body: ticket.body, priority: ticket.priority });

  React.useEffect(() => {
    setDraft({ subject: ticket.subject, body: ticket.body, priority: ticket.priority });
  }, [ticket.id]);

  const sendReply = () => {
    if (!reply.trim()) return;
    replyTicket(ticket.id, ticket.customer ? state.customers.find(c => c.id === ticket.customer)?.name || 'You' : 'You', reply.trim());
    setReply('');
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to tickets</button>
            <span className="mono text-xs text-mute">{ticket.id}</span>
          </div>
          {editing ? (
            <input value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} style={{ fontSize: 22, fontWeight: 700, padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 6, width: 540 }}/>
          ) : <h1 className="page-title">{ticket.subject}</h1>}
          <div className="flex gap-2 mt-2">
            <StatusPill status={ticket.status}/>
            <span className={`pill ${ticket.priority === 'Urgent' ? 'bad' : ticket.priority === 'Low' ? 'subtle' : 'warn'}`}><span className="dot"/>{ticket.priority}</span>
            <span className="pill subtle">Opened {ticket.created}</span>
            {ticket.assignee !== '—' && <span className="pill subtle">Assigned: {ticket.assignee}</span>}
          </div>
        </div>
        <div className="page-actions">
          {!editing && <button className="btn" onClick={() => setEditing(true)}><Icon name="edit" size={12}/>Edit</button>}
          {editing && <>
            <button className="btn ghost" onClick={() => { setDraft({ subject: ticket.subject, body: ticket.body, priority: ticket.priority }); setEditing(false); }}>Cancel</button>
            <button className="btn accent" onClick={() => { updateTicket(ticket.id, draft); setEditing(false); toast('Ticket updated', 'ok'); }}><Icon name="check" size={12}/>Save</button>
          </>}
          {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
            <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Resolved')}><Icon name="check" size={12}/>Mark resolved</button>
          )}
          {ticket.status === 'Resolved' && (
            <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Closed')}>Close ticket</button>
          )}
          <button className="btn danger" onClick={() => { if (confirm('Delete this ticket?')) { deleteTicket(ticket.id); onClose(); } }}><Icon name="trash" size={12}/></button>
        </div>
      </div>

      <div className="grid-asym">
        {/* Conversation */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Conversation</h3>
            <span className="text-xs text-mute">{ticket.replies.length + 1} message{ticket.replies.length === 0 ? '' : 's'}</span>
          </div>
          <div className="card-body">
            {/* Original */}
            <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
              <div className="flex center gap-2 mb-2">
                <Avatar name={state.customers.find(c => c.id === ticket.customer)?.name || 'Customer'} size={28}/>
                <div style={{ flex: 1 }}>
                  <div className="fw-6 text-sm">{state.customers.find(c => c.id === ticket.customer)?.name || 'You'}</div>
                  <div className="text-xs text-mute">{ticket.created}</div>
                </div>
                <span className="pill subtle">Original</span>
              </div>
              {editing
                ? <textarea value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} rows="4" style={{ width: '100%' }}/>
                : <div className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{ticket.body}</div>
              }
            </div>

            {/* Replies */}
            {ticket.replies.map((r, i) => (
              <div key={i} style={{ padding: '12px 14px', background: r.who.includes(state.customers.find(c => c.id === ticket.customer)?.name?.split(' ')[0] || 'xxxxxxx') ? 'var(--surface-2)' : 'var(--accent-soft)', borderRadius: 8, marginBottom: 10 }}>
                <div className="flex center gap-2 mb-2">
                  <Avatar name={r.who} size={24}/>
                  <div style={{ flex: 1 }}>
                    <div className="fw-6 text-sm">{r.who}</div>
                    <div className="text-xs text-mute">{r.when}</div>
                  </div>
                </div>
                <div className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{r.body}</div>
              </div>
            ))}

            {/* Reply box */}
            {ticket.status !== 'Closed' && (
              <div style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Add reply</div>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows="3" placeholder="Type your reply…" style={{ width: '100%' }}/>
                <div className="flex gap-2 mt-2">
                  <button className="btn"><Icon name="attach" size={12}/>Attach file</button>
                  <div style={{ flex: 1 }}/>
                  <button className="btn accent" disabled={!reply.trim()} onClick={sendReply}><Icon name="mail" size={12}/>Send reply</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="flex col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Ticket info</h3></div>
            <div className="card-body">
              <dl className="dl">
                <dt>Ticket ID</dt><dd className="mono">{ticket.id}</dd>
                <dt>Status</dt><dd>
                  {editing ? (
                    <select value={ticket.status} onChange={e => setTicketStatus(ticket.id, e.target.value)} style={{ padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 4, background: 'var(--surface)' }}>
                      <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                    </select>
                  ) : <StatusPill status={ticket.status}/>}
                </dd>
                <dt>Priority</dt><dd>
                  {editing ? (
                    <select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })} style={{ padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 4, background: 'var(--surface)' }}>
                      <option>Low</option><option>Normal</option><option>Urgent</option>
                    </select>
                  ) : <span className={`pill ${ticket.priority === 'Urgent' ? 'bad' : ticket.priority === 'Low' ? 'subtle' : 'warn'}`}><span className="dot"/>{ticket.priority}</span>}
                </dd>
                <dt>Assignee</dt><dd>{ticket.assignee !== '—' ? ticket.assignee : <span className="text-mute">Unassigned</span>}</dd>
                <dt>Created</dt><dd className="tnum">{ticket.created}</dd>
                <dt>Updated</dt><dd className="tnum">{ticket.updated}</dd>
              </dl>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Actions</h3></div>
            <div className="card-body">
              <div className="flex col gap-2">
                {ticket.status === 'Open' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'In Progress')}>Mark in progress</button>}
                {ticket.status === 'In Progress' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Resolved')}>Mark resolved</button>}
                {ticket.status === 'Resolved' && <>
                  <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Closed')}>Close ticket</button>
                  <button className="btn ghost" onClick={() => setTicketStatus(ticket.id, 'Open')}>Reopen</button>
                </>}
                {ticket.status === 'Closed' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Open')}>Reopen ticket</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CustomerRequestVMView, CustomerAccountView, CustomerTicketsView, CustomerTicketDetail });
