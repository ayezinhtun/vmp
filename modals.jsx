// Modals — New VM wizard, New customer, New task, Email composer,
// Renewal, Spec change, Termination, KYC document viewer, Confirm

const Modal = ({ title, subtitle, onClose, children, footer, size = 560 }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: size }}>
      <div className="modal-head">
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
          {subtitle && <div className="text-xs text-mute mt-1">{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-foot">{footer}</div>}
    </div>
  </div>
);

// ── New VM wizard (4 steps) ───────────────────────────────────────────────
const NewVMModal = ({ onClose, presetCustomer }) => {
  const store = useStore();
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    customer: presetCustomer || store.state.customers[0]?.id || '',
    name: '',
    environment: 'Production',
    label: '',
    purpose: '',
    adminContact: '',
    type: 'Paid',
    subscription: '1 year',
    autoRenew: true,
    priceMonth: 180000,
    vcpu: 4, ram: 16, storage: 200, bandwidth: '1 Gbps',
    osFamily: 'ubuntu', os: 'Ubuntu 22.04 LTS',
    sshKey: '',
    publicAccess: true,
    portForward: '443→443, 22→2222',
    vlan: '',
    publicIp: '',
    datacenter: 'Yangon DC1',
    node: 'pve-node-02',
    firewallPolicy: '',
    backup: 'Daily 02:00, 7d retention',
    security: true,
    notes: '',
    powerState: 'Running',
    proxmoxFlag: 'P',
    interconnect: [],
    start: new Date().toISOString().slice(0,10),
    expiry: '',
  });

  const totalSteps = 5;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Shared OS template catalog (mirrors customer-side Request VM)
  const OS_CATALOG = [
    { id: 'ubuntu', name: 'Ubuntu', logo: 'U', accent: 'oklch(0.6 0.17 30)', kind: 'Linux', versions: ['24.04 LTS', '22.04 LTS', '20.04 LTS'] },
    { id: 'debian', name: 'Debian', logo: 'D', accent: 'oklch(0.55 0.18 0)', kind: 'Linux', versions: ['12 (Bookworm)', '11 (Bullseye)'] },
    { id: 'rocky', name: 'Rocky Linux', logo: 'R', accent: 'oklch(0.58 0.16 155)', kind: 'Linux', versions: ['9.3', '8.9'] },
    { id: 'alma', name: 'AlmaLinux', logo: 'A', accent: 'oklch(0.6 0.15 25)', kind: 'Linux', versions: ['9.3', '8.9'] },
    { id: 'centos', name: 'CentOS Stream', logo: 'C', accent: 'oklch(0.55 0.17 285)', kind: 'Linux', versions: ['9', '8'] },
    { id: 'fedora', name: 'Fedora Server', logo: 'F', accent: 'oklch(0.5 0.16 250)', kind: 'Linux', versions: ['40', '39'] },
    { id: 'alpine', name: 'Alpine', logo: 'Al', accent: 'oklch(0.55 0.15 230)', kind: 'Linux', versions: ['3.19', '3.18'] },
    { id: 'windows', name: 'Windows Server', logo: 'W', accent: 'oklch(0.5 0.14 245)', kind: 'Windows', versions: ['2022', '2019'] },
    { id: 'freebsd', name: 'FreeBSD', logo: 'B', accent: 'oklch(0.55 0.18 15)', kind: 'BSD', versions: ['14.0', '13.3'] },
    { id: 'docker', name: 'Docker (Ubuntu)', logo: '◧', accent: 'oklch(0.55 0.13 230)', kind: 'App template', versions: ['Ubuntu 22.04 + Docker 26'] },
    { id: 'wordpress', name: 'WordPress', logo: 'Wp', accent: 'oklch(0.5 0.12 250)', kind: 'App template', versions: ['LAMP + WP 6.5'] },
    { id: 'cpanel', name: 'cPanel / WHM', logo: 'cP', accent: 'oklch(0.58 0.15 40)', kind: 'App template', versions: ['AlmaLinux 9 + cPanel'] },
  ];
  const selOS = OS_CATALOG.find(o => o.id === form.osFamily) || OS_CATALOG[0];
  const cust = store.state.customers.find(c => c.id === form.customer);

  const cpuSteps = [1, 2, 4, 6, 8, 12, 16, 24, 32];
  const ramSteps = [1, 2, 4, 8, 16, 24, 32, 48, 64, 128];
  const storageSteps = [25, 50, 100, 200, 400, 500, 1000, 2000];
  // Auto price: 20k/vCPU + 6k/GB RAM + 200/GB SSD + bw uplift
  const computedPrice = form.vcpu * 20000 + form.ram * 6000 + form.storage * 200 + (form.bandwidth === '1 Gbps' ? 30000 : form.bandwidth === '500 Mbps' ? 10000 : 0);

  const submit = () => {
    const expiry = new Date();
    const months = { '14-day trial': 0.5, '6 months': 6, '1 year': 12, '2 years': 24 }[form.subscription] || 12;
    expiry.setMonth(expiry.getMonth() + months);
    store.addVM({
      ...form,
      status: 'Active',
      priceMonth: form.priceMonth || computedPrice,
      expiry: expiry.toISOString().slice(0,10),
      firewallPolicy: form.firewallPolicy || `fw-${form.name || 'vm'}`,
      vlan: form.vlan || `VLAN-${200 + Math.floor(Math.random() * 50)}`,
      publicIp: form.publicAccess ? (form.publicIp || `203.81.64.${100 + Math.floor(Math.random()*100)}`) : '—',
      tags: form.label ? [form.label.toLowerCase()] : [],
      notes: form.notes || (form.purpose ? `Purpose: ${form.purpose}` : ''),
    });
    onClose();
  };

  const stepLabels = ['Customer & details', 'OS template', 'Specification', 'Network', 'Review'];

  return (
    <Modal title="Provision new VM" subtitle={`Step ${step} of ${totalSteps} — ${stepLabels[step-1]}`} onClose={onClose} size={720}
      footer={
        <>
          {step > 1 && <button className="btn" onClick={() => setStep(s => s - 1)}><Icon name="chevron-left" size={11}/>Back</button>}
          <div style={{ flex: 1 }}/>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          {step < totalSteps
            ? <button className="btn primary" onClick={() => setStep(s => s + 1)} disabled={step === 1 && !form.name}>Continue<Icon name="chevron-right" size={11}/></button>
            : <button className="btn accent" onClick={submit}><Icon name="check" size={12}/>Provision VM</button>}
        </>
      }>
      {/* Stepper */}
      <div className="flex gap-1 mb-4" style={{ alignItems: 'center' }}>
        {stepLabels.map((l, i) => (
          <React.Fragment key={l}>
            <div className="flex center gap-2" style={{ opacity: i + 1 <= step ? 1 : 0.5 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: i + 1 < step ? 'var(--ok)' : i + 1 === step ? 'var(--accent)' : 'var(--surface-3)', color: i + 1 <= step ? '#fff' : 'var(--ink-3)', display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 700 }}>
                {i + 1 < step ? <Icon name="check" size={11}/> : i + 1}
              </div>
              <span className="text-xs fw-6" style={{ whiteSpace: 'nowrap', color: i + 1 === step ? 'var(--ink)' : 'var(--ink-3)' }}>{l}</span>
            </div>
            {i < stepLabels.length - 1 && <div style={{ flex: 1, height: 2, background: i + 1 < step ? 'var(--ok)' : 'var(--surface-3)' }}/>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="flex col gap-3">
          <div className="field">
            <label>Customer</label>
            <select value={form.customer} onChange={e => set('customer', e.target.value)}>
              {store.state.customers.filter(c => c.kyc === 'Approved').map(c => (
                <option key={c.id} value={c.id}>{c.company} — {c.name}</option>
              ))}
            </select>
            <div className="hint">Only KYC-approved customers can have new VMs provisioned.</div>
          </div>
          {cust && (
            <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={cust.name} size={32}/>
              <div style={{ flex: 1 }}>
                <div className="fw-6 text-sm">{cust.company}</div>
                <div className="text-xs text-mute">{cust.id} · {cust.email} · {cust.phone}</div>
              </div>
              <StatusPill status={cust.kyc}/>
            </div>
          )}
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>VM name (hostname)</label>
              <input value={form.name} onChange={e => set('name', e.target.value.replace(/\s/g, '-').toLowerCase())} placeholder="mlc-app-prod-02" style={{ fontFamily: 'var(--mono)' }}/>
            </div>
            <div className="field">
              <label>Label / tag</label>
              <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. erp, web, db"/>
            </div>
          </div>
          <div className="field">
            <label>Environment</label>
            <div className="flex gap-2">
              {['Production', 'Staging', 'Development'].map(en => (
                <button key={en} type="button" className={`filter-chip ${form.environment === en ? 'active' : ''}`} onClick={() => set('environment', en)}>{en}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Purpose / workload</label>
            <input value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="e.g. ERP production database, internal web app"/>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option>Paid</option><option>Trial</option>
              </select>
            </div>
            <div className="field">
              <label>Subscription period</label>
              <select value={form.subscription} onChange={e => set('subscription', e.target.value)}>
                {form.type === 'Trial'
                  ? <option>14-day trial</option>
                  : <><option>6 months</option><option>1 year</option><option>2 years</option></>}
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Start date</label>
              <input type="date" value={form.start} onChange={e => set('start', e.target.value)}/>
            </div>
            <div className="field">
              <label>Technical contact (email)</label>
              <input value={form.adminContact} onChange={e => set('adminContact', e.target.value)} placeholder={cust?.email || 'admin@customer.com'}/>
            </div>
          </div>
          <div className="flex center between" style={{ padding: '4px 2px' }}>
            <div><div className="fw-6 text-sm">Auto-renew</div><div className="text-xs text-mute">Renew automatically before expiry</div></div>
            <span className={`toggle ${form.autoRenew ? 'on' : ''}`} onClick={() => set('autoRenew', !form.autoRenew)}/>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex col gap-3">
          <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Choose an OS template</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {OS_CATALOG.map(o => {
              const sel = form.osFamily === o.id;
              return (
                <button key={o.id} type="button"
                  onClick={() => { set('osFamily', o.id); set('os', `${o.name} ${o.versions[0]}`); }}
                  style={{
                    textAlign: 'left', padding: 11, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                    background: sel ? 'var(--accent-soft)' : 'var(--surface)', border: '1.5px solid', borderColor: sel ? 'var(--accent)' : 'var(--line)',
                    boxShadow: sel ? '0 0 0 3px var(--accent-soft)' : 'none', transition: 'all 0.15s',
                  }}>
                  <div className="flex center gap-2 mb-1">
                    <span style={{ width: 30, height: 30, borderRadius: 7, background: `${o.accent}1a`, color: o.accent, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{o.logo}</span>
                    {sel && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)', marginLeft: 'auto' }}/>}
                  </div>
                  <div className="fw-7" style={{ fontSize: 12 }}>{o.name}</div>
                  <div className="text-xs text-mute">{o.kind} · {o.versions.length} ver.</div>
                </button>
              );
            })}
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Version</label>
              <select value={form.os.replace(`${selOS.name} `, '')} onChange={e => set('os', `${selOS.name} ${e.target.value}`)}>
                {selOS.versions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Architecture</label>
              <select defaultValue="x86_64"><option>x86_64</option><option>aarch64</option></select>
            </div>
          </div>
          <div className="field">
            <label>SSH public key (optional)</label>
            <textarea rows="2" value={form.sshKey} onChange={e => set('sshKey', e.target.value)} placeholder="ssh-ed25519 AAAA… (leave blank to auto-generate root password)" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}/>
          </div>
          <div style={{ padding: 12, background: 'var(--info-soft)', borderRadius: 8, fontSize: 12, display: 'flex', gap: 8, color: 'var(--info)' }}>
            <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: 1 }}/>
            <div>Selected image: <strong>{form.os}</strong>. The same OS catalog is offered to customers in the self-service Request VM flow.</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex col gap-4">
          <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Custom configuration — size every resource</div>
          {[
            { label: 'vCPU cores', icon: 'cpu', steps: cpuSteps, val: form.vcpu, k: 'vcpu', unit: '' },
            { label: 'Memory', icon: 'database', steps: ramSteps, val: form.ram, k: 'ram', unit: ' GB' },
            { label: 'Storage (SSD)', icon: 'box', steps: storageSteps, val: form.storage, k: 'storage', unit: ' GB' },
          ].map(row => (
            <div key={row.k}>
              <div className="flex center between mb-2">
                <span className="fw-6 text-sm flex center gap-2"><Icon name={row.icon} size={13}/>{row.label}</span>
                <span className="tnum fw-7" style={{ fontSize: 15, color: 'var(--accent-strong)' }}>{row.val}{row.unit}</span>
              </div>
              <div className="flex gap-1 wrap">
                {row.steps.map(s => (
                  <button key={s} type="button" className={`filter-chip ${row.val === s ? 'active' : ''}`} onClick={() => set(row.k, s)} style={{ minWidth: 48, justifyContent: 'center' }}>{s}{row.unit}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field"><label>Bandwidth</label><select value={form.bandwidth} onChange={e => set('bandwidth', e.target.value)}><option>100 Mbps</option><option>500 Mbps</option><option>1 Gbps</option></select></div>
            <div className="field"><label>Backup policy</label><select value={form.backup} onChange={e => set('backup', e.target.value)}><option>None</option><option>Daily 02:00, 7d retention</option><option>Daily 02:00, 14d retention</option><option>Hourly snapshots, 48h retention</option><option>Weekly Sun 02:00, 4w retention</option></select></div>
          </div>
          <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10 }}>
            <div className="flex center between">
              <div className="text-sm">Custom instance <span className="fw-7 mono">{form.vcpu}c · {form.ram}GB · {form.storage}GB</span></div>
              <div className="right">
                <div className="text-xs text-mute">Suggested price</div>
                <div className="tnum fw-7" style={{ fontSize: 15 }}>MMK {formatMMK(computedPrice)}/mo</div>
              </div>
            </div>
            <div className="field mt-3"><label>Monthly price (MMK) — override</label><input type="number" value={form.priceMonth} onChange={e => set('priceMonth', +e.target.value)} placeholder={String(computedPrice)}/></div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex col gap-3">
          <div className="flex center between">
            <div>
              <div className="fw-6 text-sm">Public access</div>
              <div className="text-xs text-mute">Assign a public IPv4 and enable inbound routing</div>
            </div>
            <span className={`toggle ${form.publicAccess ? 'on' : ''}`} onClick={() => set('publicAccess', !form.publicAccess)}/>
          </div>
          {form.publicAccess && (
            <>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field"><label>Public IPv4</label><input value={form.publicIp} onChange={e => set('publicIp', e.target.value)} placeholder="auto-assign" style={{ fontFamily: 'var(--mono)' }}/></div>
                <div className="field"><label>VLAN</label><input value={form.vlan} onChange={e => set('vlan', e.target.value)} placeholder="auto-assign" style={{ fontFamily: 'var(--mono)' }}/></div>
              </div>
              <div className="field"><label>Port forwarding</label><input value={form.portForward} onChange={e => set('portForward', e.target.value)} placeholder="443→443, 22→2222" style={{ fontFamily: 'var(--mono)' }}/></div>
            </>
          )}
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field"><label>Datacenter</label><select value={form.datacenter} onChange={e => set('datacenter', e.target.value)}><option>Yangon DC1</option><option>Yangon DC2</option><option>Mandalay DC1</option></select></div>
            <div className="field"><label>Proxmox node</label><select value={form.node} onChange={e => set('node', e.target.value)}><option>pve-node-01</option><option>pve-node-02</option><option>pve-node-03</option><option>pve-node-04</option><option>pve-node-05</option></select></div>
          </div>
          <div className="field"><label>Firewall policy name</label><input value={form.firewallPolicy} onChange={e => set('firewallPolicy', e.target.value)} placeholder={`fw-${form.name || 'vm'}`} style={{ fontFamily: 'var(--mono)' }}/></div>
          <div className="flex center between" style={{ padding: '4px 2px' }}>
            <div><div className="fw-6 text-sm">Hardened security baseline</div><div className="text-xs text-mute">Fail2ban, disabled root SSH, auto-patching</div></div>
            <span className={`toggle ${form.security ? 'on' : ''}`} onClick={() => set('security', !form.security)}/>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex col gap-3">
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="building" size={12}/> Customer & account</h3></div>
              <div className="card-body" style={{ padding: '10px 14px' }}>
                <dl className="dl" style={{ gridTemplateColumns: '92px 1fr', gap: '7px 12px' }}>
                  <dt>Customer</dt><dd>{cust?.company}</dd>
                  <dt>Contact</dt><dd>{cust?.name}</dd>
                  <dt>Tech contact</dt><dd className="text-sm">{form.adminContact || cust?.email}</dd>
                  <dt>Environment</dt><dd><span className="pill subtle">{form.environment}</span></dd>
                  <dt>Auto-renew</dt><dd>{form.autoRenew ? 'Yes' : 'No'}</dd>
                </dl>
              </div>
            </div>
            <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="server" size={12}/> Instance</h3></div>
              <div className="card-body" style={{ padding: '10px 14px' }}>
                <dl className="dl" style={{ gridTemplateColumns: '78px 1fr', gap: '7px 12px' }}>
                  <dt>Hostname</dt><dd className="mono">{form.name || '—'}</dd>
                  <dt>Label</dt><dd>{form.label || '—'}</dd>
                  <dt>OS</dt><dd>{form.os}</dd>
                  <dt>Type</dt><dd>{form.type} · {form.subscription}</dd>
                  <dt>Start</dt><dd className="tnum">{form.start}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="cpu" size={12}/> Specification</h3></div>
              <div className="card-body" style={{ padding: '10px 14px' }}>
                <dl className="dl" style={{ gridTemplateColumns: '78px 1fr', gap: '7px 12px' }}>
                  <dt>vCPU</dt><dd className="tnum">{form.vcpu} cores</dd>
                  <dt>RAM</dt><dd className="tnum">{form.ram} GB</dd>
                  <dt>Storage</dt><dd className="tnum">{form.storage} GB SSD</dd>
                  <dt>Bandwidth</dt><dd>{form.bandwidth}</dd>
                  <dt>Backup</dt><dd className="text-sm">{form.backup}</dd>
                </dl>
              </div>
            </div>
            <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="network" size={12}/> Network</h3></div>
              <div className="card-body" style={{ padding: '10px 14px' }}>
                <dl className="dl" style={{ gridTemplateColumns: '78px 1fr', gap: '7px 12px' }}>
                  <dt>Access</dt><dd>{form.publicAccess ? 'Public IPv4' : 'Private only'}</dd>
                  <dt>Ports</dt><dd className="mono text-sm">{form.publicAccess ? form.portForward : '—'}</dd>
                  <dt>Datacenter</dt><dd>{form.datacenter}</dd>
                  <dt>Node</dt><dd className="mono">{form.node}</dd>
                  <dt>Firewall</dt><dd className="mono text-sm">{form.firewallPolicy || `fw-${form.name || 'vm'}`}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <div className="card-body" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="text-xs text-mute">Monthly charge</div>
                <div className="tnum fw-7" style={{ fontSize: 20 }}>MMK {formatMMK(form.priceMonth || computedPrice)}</div>
              </div>
              <div className="text-xs text-mute" style={{ textAlign: 'right', maxWidth: 280 }}>A provisioning task is created and assigned to Engineering. The customer is notified when the VM is ready.</div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ── New Customer modal ────────────────────────────────────────────────────
const NewCustomerModal = ({ onClose }) => {
  const { addCustomer, state } = useStore();
  const [f, setF] = React.useState({ name: '', company: '', email: '', phone: '', salesperson: state.team.find(t => t.role === 'Sales')?.name || 'Su Su' });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  return (
    <Modal title="Add new customer" onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.name || !f.email} onClick={() => { addCustomer(f); onClose(); }}>
            <Icon name="plus" size={12}/>Add customer
          </button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Contact name</label><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Aung Min Htet"/></div>
          <div className="field"><label>Company</label><input value={f.company} onChange={e => set('company', e.target.value)} placeholder="Mandalay Logistics Co., Ltd"/></div>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Email</label><input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="contact@company.com"/></div>
          <div className="field"><label>Phone</label><input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+95 9 ..."/></div>
        </div>
        <div className="field">
          <label>Assigned salesperson</label>
          <select value={f.salesperson} onChange={e => set('salesperson', e.target.value)}>
            {state.team.filter(t => t.role === 'Sales').map(t => <option key={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ padding: 12, background: 'var(--warn-soft)', borderRadius: 6, fontSize: 12, color: 'oklch(0.4 0.13 75)', display: 'flex', gap: 8 }}>
          <Icon name="alert" size={14}/>
          <div>Customer will be created with KYC status <strong>Pending</strong>. They'll receive an email link to upload identity documents.</div>
        </div>
      </div>
    </Modal>
  );
};

// ── New Task modal ────────────────────────────────────────────────────────
const NewTaskModal = ({ onClose, presetStatus }) => {
  const { addTask, state } = useStore();
  const [f, setF] = React.useState({
    title: '', customer: state.customers[0]?.id || '', vm: '',
    type: 'New', priority: 'Normal',
    assignee: state.team.find(t => t.role === 'Engineer')?.name || '—',
    team: 'Provisioning',
    subscription: '1 year', status: presetStatus || 'Pending', notes: '',
  });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const custVMs = state.vms.filter(v => v.customer === f.customer);

  return (
    <Modal title="Create provisioning task" onClose={onClose} size={620}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.title || !f.customer} onClick={() => { addTask(f); onClose(); }}>
            <Icon name="plus" size={12}/>Create task
          </button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field"><label>Title</label><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?"/></div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Customer</label>
            <select value={f.customer} onChange={e => set('customer', e.target.value)}>
              {state.customers.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </select>
          </div>
          <div className="field"><label>Related VM (optional)</label>
            <select value={f.vm} onChange={e => set('vm', e.target.value)}>
              <option value="">— None —</option>
              {custVMs.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
            </select>
          </div>
        </div>
        <div className="grid-3" style={{ gap: 12 }}>
          <div className="field"><label>Type</label><select value={f.type} onChange={e => set('type', e.target.value)}><option>New</option><option>Renewal</option><option>Upgrade</option><option>Terminate</option></select></div>
          <div className="field"><label>Priority</label><select value={f.priority} onChange={e => set('priority', e.target.value)}><option>Normal</option><option>Urgent</option></select></div>
          <div className="field"><label>Status</label><select value={f.status} onChange={e => set('status', e.target.value)}><option>Pending</option><option>In Progress</option><option>Blocked</option><option>Done</option></select></div>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Assignee</label>
            <select value={f.assignee} onChange={e => set('assignee', e.target.value)}>
              <option value="—">Unassigned</option>
              {state.team.map(t => <option key={t.id} value={t.name}>{t.name} · {t.role}</option>)}
            </select>
          </div>
          <div className="field"><label>Team</label><select value={f.team} onChange={e => set('team', e.target.value)}><option>Sales</option><option>Provisioning</option><option>Network</option><option>Finance</option></select></div>
        </div>
        <div className="field"><label>Notes</label><textarea rows="2" value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Context, links, customer comments…"/></div>
      </div>
    </Modal>
  );
};

// ── Email composer ────────────────────────────────────────────────────────
const EmailModal = ({ onClose, to, template }) => {
  const { toast } = useStore();
  const templates = {
    welcome: { subject: 'Welcome to VPS Myanmar', body: `Hi,\n\nThank you for signing up. To activate your account, please complete the KYC verification by uploading your ID and company registration documents.\n\nThe link is in the portal.\n\n— VPS Myanmar Team` },
    renewal: { subject: 'Your VM subscription is expiring soon', body: `Hi,\n\nYour subscription is set to expire in 7 days. To avoid service interruption, please confirm your renewal.\n\nReply to this email or visit the portal.\n\n— VPS Myanmar Team` },
    invoice: { subject: 'Invoice attached', body: `Hi,\n\nPlease find your invoice attached.\n\nPayment is due within 10 days. We accept KBZ Pay, AYA Bank, and CB Bank transfers.\n\n— VPS Myanmar Team` },
    kyc_request: { subject: 'KYC document re-upload', body: `Hi,\n\nWe need to re-verify your identity documents. Please upload a clearer image of your NRC.\n\nLink: portal.vpsmm.co/kyc\n\n— VPS Myanmar Team` },
  };
  const [tmpl, setTmpl] = React.useState(template || 'renewal');
  const [f, setF] = React.useState({ to: to || '', subject: templates[tmpl].subject, body: templates[tmpl].body });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const pick = (k) => { setTmpl(k); setF(x => ({ ...x, subject: templates[k].subject, body: templates[k].body })); };

  return (
    <Modal title="Compose email" onClose={onClose} size={680}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Discard</button>
          <button className="btn" onClick={() => { toast('Saved as draft', 'info'); onClose(); }}>Save draft</button>
          <button className="btn accent" onClick={() => { toast(`Email sent to ${f.to || 'customer'}`, 'ok'); onClose(); }}><Icon name="mail" size={12}/>Send</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field">
          <label>Template</label>
          <div className="flex gap-2 wrap">
            {Object.keys(templates).map(k => (
              <button key={k} className={`filter-chip ${tmpl === k ? 'active' : ''}`} onClick={() => pick(k)}>
                {k.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="field"><label>To</label><input value={f.to} onChange={e => set('to', e.target.value)}/></div>
        <div className="field"><label>Subject</label><input value={f.subject} onChange={e => set('subject', e.target.value)}/></div>
        <div className="field"><label>Body</label><textarea rows="8" value={f.body} onChange={e => set('body', e.target.value)} style={{ fontFamily: 'var(--mono)', fontSize: 12 }}/></div>
      </div>
    </Modal>
  );
};

// ── Renewal modal ─────────────────────────────────────────────────────────
const RenewModal = ({ vm, onClose }) => {
  const { renew, addInvoice, state } = useStore();
  const [months, setMonths] = React.useState(12);
  const monthOpts = [3, 6, 12, 24];
  const price = vm.priceMonth * months;
  const c = state.customers.find(c => c.id === vm.customer);

  return (
    <Modal title={`Renew ${vm.name}`} subtitle={`Customer: ${c?.company}`} onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={() => {
            renew(vm.id, months);
            addInvoice({ customer: vm.customer, vms: [vm.id], amount: price, due: new Date(Date.now() + 10*86400000).toISOString().slice(0,10) });
            onClose();
          }}><Icon name="check" size={12}/>Renew & invoice</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field"><label>Renewal period</label>
          <div className="flex gap-2">
            {monthOpts.map(m => (
              <button key={m} className={`filter-chip ${months === m ? 'active' : ''}`} onClick={() => setMonths(m)}>
                {m < 12 ? `${m} months` : m === 12 ? '1 year' : `${m/12} years`}
              </button>
            ))}
          </div>
        </div>
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="card-body">
            <dl className="dl">
              <dt>Current expiry</dt><dd className="tnum">{vm.expiry}</dd>
              <dt>New expiry</dt><dd className="tnum fw-6" style={{ color: 'var(--ok)' }}>
                {(() => { const d = new Date(vm.expiry === '—' ? Date.now() : vm.expiry); d.setMonth(d.getMonth() + months); return d.toISOString().slice(0,10); })()}
              </dd>
              <dt>Monthly rate</dt><dd className="tnum">MMK {formatMMK(vm.priceMonth)}</dd>
              <dt>Renewal total</dt><dd className="tnum fw-7" style={{ fontSize: 14 }}>MMK {formatMMK(price)}</dd>
            </dl>
          </div>
        </div>
        <div style={{ padding: 12, background: 'var(--info-soft)', borderRadius: 6, fontSize: 12, display: 'flex', gap: 8 }}>
          <Icon name="invoice" size={14}/>
          <div>An invoice will be created automatically and emailed to the customer.</div>
        </div>
      </div>
    </Modal>
  );
};

// ── Spec change modal ─────────────────────────────────────────────────────
const SpecChangeModal = ({ vm, onClose }) => {
  const { updateVM, addTask, toast } = useStore();
  const [f, setF] = React.useState({ vcpu: vm.vcpu, ram: vm.ram, storage: vm.storage });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const oldPrice = vm.priceMonth;
  const newPrice = Math.round(oldPrice * (f.vcpu / vm.vcpu * 0.4 + f.ram / vm.ram * 0.4 + f.storage / vm.storage * 0.2));
  const diff = newPrice - oldPrice;

  return (
    <Modal title={`Spec change — ${vm.name}`} onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={() => {
            updateVM(vm.id, { ...f, priceMonth: newPrice });
            addTask({ title: `Spec change: ${vm.name} (${vm.vcpu}/${vm.ram}/${vm.storage} → ${f.vcpu}/${f.ram}/${f.storage})`, customer: vm.customer, vm: vm.id, type: 'Upgrade', status: 'Pending' });
            toast('Spec change scheduled', 'ok');
            onClose();
          }}>Apply & schedule</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="grid-3" style={{ gap: 12 }}>
          <div className="field"><label>vCPU</label><input type="number" value={f.vcpu} onChange={e => set('vcpu', +e.target.value)}/></div>
          <div className="field"><label>RAM (GB)</label><input type="number" value={f.ram} onChange={e => set('ram', +e.target.value)}/></div>
          <div className="field"><label>Storage (GB)</label><input type="number" value={f.storage} onChange={e => set('storage', +e.target.value)}/></div>
        </div>
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="card-body">
            <div className="flex center between">
              <div><div className="text-xs text-mute">Old monthly</div><div className="tnum fw-6">MMK {formatMMK(oldPrice)}</div></div>
              <Icon name="chevron-right" size={14}/>
              <div><div className="text-xs text-mute">New monthly</div><div className="tnum fw-6">MMK {formatMMK(newPrice)}</div></div>
              <div className="text-sm fw-7 tnum" style={{ color: diff >= 0 ? 'var(--bad)' : 'var(--ok)' }}>
                {diff >= 0 ? '+' : ''}MMK {formatMMK(Math.abs(diff))}/mo
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── Termination modal ─────────────────────────────────────────────────────
const TerminateModal = ({ vm, onClose }) => {
  const { setVMStatus, addTask } = useStore();
  const [confirmText, setConfirmText] = React.useState('');
  return (
    <Modal title={`Terminate ${vm.name}?`} onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn danger" disabled={confirmText !== vm.name} onClick={() => {
            setVMStatus(vm.id, 'Suspended', 'Stopped');
            addTask({ title: `Terminate ${vm.name} (7-day grace)`, customer: vm.customer, vm: vm.id, type: 'Terminate', status: 'In Progress', notes: 'Interface disabled. Permanent deletion after 7 days.' });
            onClose();
          }}><Icon name="trash" size={12}/>Begin termination</button>
        </>
      }>
      <div className="flex col gap-3">
        <div style={{ padding: 12, background: 'var(--bad-soft)', borderRadius: 6, fontSize: 12, color: 'var(--bad)', display: 'flex', gap: 8 }}>
          <Icon name="alert" size={14}/>
          <div>This will suspend the VM and schedule permanent deletion in <strong>7 days</strong>. All data, backups, and credentials will be erased. The customer's IP and VLAN usage record is preserved.</div>
        </div>
        <div className="field">
          <label>Type the VM name to confirm</label>
          <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={vm.name} style={{ fontFamily: 'var(--mono)' }}/>
        </div>
      </div>
    </Modal>
  );
};

// ── KYC document viewer ───────────────────────────────────────────────────
const KYCDocsModal = ({ customer, onClose }) => {
  const { setKYC } = useStore();
  const [decision, setDecision] = React.useState(null);
  const [reason, setReason] = React.useState('');

  return (
    <Modal title={`KYC review — ${customer.name}`} subtitle={`${customer.company} · ${customer.id}`} onClose={onClose} size={820}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn danger" onClick={() => { setKYC(customer.id, 'Rejected'); onClose(); }}><Icon name="x" size={12}/>Reject</button>
          <button className="btn" onClick={() => onClose()}><Icon name="refresh" size={12}/>Request re-upload</button>
          <button className="btn accent" onClick={() => { setKYC(customer.id, 'Approved'); onClose(); }}><Icon name="check" size={12}/>Approve</button>
        </>
      }>
      <div className="grid-2" style={{ gap: 16 }}>
        <div>
          <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Submitted documents</div>
          <div className="flex col gap-2">
            {['NRC front', 'NRC back', 'Company registration'].map(doc => (
              <div key={doc} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 64, height: 40,
                  background: 'repeating-linear-gradient(45deg, var(--surface-3) 0, var(--surface-3) 4px, var(--surface-2) 4px, var(--surface-2) 8px)',
                  borderRadius: 4, display: 'grid', placeItems: 'center',
                }}><Icon name="file" size={18} className="text-mute"/></div>
                <div style={{ flex: 1 }}>
                  <div className="fw-6 text-sm">{doc}</div>
                  <div className="text-xs text-mute">PDF · 1.2 MB · uploaded {customer.since}</div>
                </div>
                <button className="btn sm"><Icon name="eye" size={11}/></button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Customer details</div>
          <dl className="dl">
            <dt>Customer ID</dt><dd className="mono">{customer.id}</dd>
            <dt>Contact name</dt><dd>{customer.name}</dd>
            <dt>Company</dt><dd>{customer.company}</dd>
            <dt>Email</dt><dd className="mono text-sm">{customer.email}</dd>
            <dt>Phone</dt><dd className="mono">{customer.phone}</dd>
            <dt>Submitted</dt><dd className="tnum">{customer.since}</dd>
          </dl>
          <div className="divider"/>
          <div className="field">
            <label>Internal review note</label>
            <textarea rows="3" value={reason} onChange={e => setReason(e.target.value)} placeholder="Any concerns or context for your decision…"/>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── Confirm modal (generic) ───────────────────────────────────────────────
const ConfirmModal = ({ title, message, danger, onConfirm, onClose, confirmLabel = 'Confirm' }) => (
  <Modal title={title} onClose={onClose} size={460}
    footer={
      <>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className={`btn ${danger ? 'danger' : 'accent'}`} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </>
    }>
    <div className="text-sm">{message}</div>
  </Modal>
);

// ── Invite member modal ───────────────────────────────────────────────────
const InviteMemberModal = ({ onClose }) => {
  const { addMember } = useStore();
  const [f, setF] = React.useState({ name: '', email: '', role: 'Sales', team: 'Sales' });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  return (
    <Modal title="Invite team member" onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.name || !f.email} onClick={() => { addMember(f); onClose(); }}><Icon name="mail" size={12}/>Send invite</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field"><label>Name</label><input value={f.name} onChange={e => set('name', e.target.value)}/></div>
        <div className="field"><label>Work email</label><input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="@vpsmm.co"/></div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Role</label><select value={f.role} onChange={e => set('role', e.target.value)}><option>Admin</option><option>Sales</option><option>Engineer</option><option>Finance</option></select></div>
          <div className="field"><label>Team</label><select value={f.team} onChange={e => set('team', e.target.value)}><option>Sales</option><option>Provisioning</option><option>Network</option><option>Finance</option><option>Management</option></select></div>
        </div>
      </div>
    </Modal>
  );
};

// ── New Invoice modal ─────────────────────────────────────────────────────
const NewInvoiceModal = ({ onClose, presetCustomer }) => {
  const { addInvoice, state } = useStore();
  const [f, setF] = React.useState({
    customer: presetCustomer || state.customers[0]?.id,
    vms: [], months: 6,
  });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const custVMs = state.vms.filter(v => v.customer === f.customer && v.status !== 'Expired');
  const amount = custVMs.filter(v => f.vms.includes(v.id)).reduce((a, v) => a + v.priceMonth * f.months, 0);
  const dueDate = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  const toggle = (id) => set('vms', f.vms.includes(id) ? f.vms.filter(x => x !== id) : [...f.vms, id]);

  return (
    <Modal title="Create invoice" onClose={onClose} size={620}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.vms.length} onClick={() => { addInvoice({ customer: f.customer, vms: f.vms, amount, due: dueDate }); onClose(); }}><Icon name="plus" size={12}/>Create invoice</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field"><label>Customer</label>
          <select value={f.customer} onChange={e => { set('customer', e.target.value); set('vms', []); }}>
            {state.customers.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
        </div>
        <div className="field"><label>Billing period</label>
          <div className="flex gap-2">
            {[1, 3, 6, 12].map(m => (
              <button key={m} className={`filter-chip ${f.months === m ? 'active' : ''}`} onClick={() => set('months', m)}>{m} {m === 1 ? 'month' : 'months'}</button>
            ))}
          </div>
        </div>
        <div className="field"><label>Include these VMs</label>
          <div className="card" style={{ borderColor: 'var(--line)' }}>
            <div className="card-body flush" style={{ maxHeight: 240, overflowY: 'auto' }}>
              {custVMs.length === 0 && <div className="empty"><div className="sub">No billable VMs for this customer.</div></div>}
              {custVMs.map(v => (
                <label key={v.id} style={{ display: 'flex', padding: '10px 14px', borderBottom: '1px solid var(--line)', cursor: 'pointer', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={f.vms.includes(v.id)} onChange={() => toggle(v.id)}/>
                  <div style={{ flex: 1 }}>
                    <div className="fw-6 text-sm">{v.name}</div>
                    <div className="text-xs text-mute mono">{v.id} · {v.vcpu}c · {v.ram}GB · {v.storage}GB</div>
                  </div>
                  <div className="tnum text-sm">MMK {formatMMK(v.priceMonth)}/mo</div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="card-body">
            <div className="flex between"><span className="text-mute">Selected</span><span className="tnum fw-6">{f.vms.length} VM{f.vms.length !== 1 ? 's' : ''}</span></div>
            <div className="flex between"><span className="text-mute">Period</span><span className="tnum fw-6">{f.months} month{f.months !== 1 ? 's' : ''}</span></div>
            <div className="flex between"><span className="text-mute">Due date</span><span className="tnum fw-6">{dueDate}</span></div>
            <div className="divider"/>
            <div className="flex between"><span className="fw-7">Total</span><span className="tnum fw-7" style={{ fontSize: 16 }}>MMK {formatMMK(amount)}</span></div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── New Deal modal ────────────────────────────────────────────────────────
const NewDealModal = ({ onClose, onAdd }) => {
  const [f, setF] = React.useState({ company: '', contact: '', value: 1000000, owner: 'Su Su', source: 'Website' });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  return (
    <Modal title="New deal" onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.company} onClick={() => { onAdd({ ...f, stage: 'Lead', age: 0, last: 'Just added' }); onClose(); }}><Icon name="plus" size={12}/>Add deal</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Company</label><input value={f.company} onChange={e => set('company', e.target.value)}/></div>
          <div className="field"><label>Contact</label><input value={f.contact} onChange={e => set('contact', e.target.value)}/></div>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Deal value (MMK)</label><input type="number" value={f.value} onChange={e => set('value', +e.target.value)}/></div>
          <div className="field"><label>Owner</label><select value={f.owner} onChange={e => set('owner', e.target.value)}><option>Su Su</option><option>Ko Naing</option></select></div>
        </div>
        <div className="field"><label>Source</label><select value={f.source} onChange={e => set('source', e.target.value)}><option>Website</option><option>Cold outreach</option><option>Referral</option><option>Google Form</option><option>Trial conversion</option><option>Inbound call</option></select></div>
      </div>
    </Modal>
  );
};

// ── New follow-up reminder ────────────────────────────────────────────────
const NewReminderModal = ({ onClose, onAdd }) => {
  const { state } = useStore();
  const [f, setF] = React.useState({ task: '', customer: state.customers[0]?.id || '', due: new Date(Date.now() + 86400000).toISOString().slice(0, 10), priority: 'Normal' });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  return (
    <Modal title="Add follow-up reminder" onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.task} onClick={() => { onAdd(f); onClose(); }}><Icon name="check" size={12}/>Add</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field"><label>Task</label><input value={f.task} onChange={e => set('task', e.target.value)} placeholder="What do you need to follow up on?"/></div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Customer</label><select value={f.customer} onChange={e => set('customer', e.target.value)}>{state.customers.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>
          <div className="field"><label>Due date</label><input type="date" value={f.due} onChange={e => set('due', e.target.value)}/></div>
        </div>
        <div className="field"><label>Priority</label><select value={f.priority} onChange={e => set('priority', e.target.value)}><option>Urgent</option><option>Normal</option><option>Low</option></select></div>
      </div>
    </Modal>
  );
};

// ── New API key ────────────────────────────────────────────────────────────
const NewApiKeyModal = ({ onClose, onAdd }) => {
  const [f, setF] = React.useState({ name: '', scopes: ['vm:read'] });
  const allScopes = ['vm:read', 'vm:write', 'task:read', 'task:write', 'invoice:read', 'invoice:write', 'customer:read', 'customer:write', '*:read', '*:*'];
  const toggle = (s) => setF(x => ({ ...x, scopes: x.scopes.includes(s) ? x.scopes.filter(y => y !== s) : [...x.scopes, s] }));
  return (
    <Modal title="Create API key" onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.name} onClick={() => { onAdd({ name: f.name, scopes: f.scopes }); onClose(); }}><Icon name="key" size={12}/>Generate key</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field"><label>Key name</label><input value={f.name} onChange={e => setF({...f, name: e.target.value})} placeholder="e.g. Mobile app · prod"/></div>
        <div className="field"><label>Scopes</label>
          <div className="flex gap-1 wrap">
            {allScopes.map(s => (
              <button key={s} className={`filter-chip ${f.scopes.includes(s) ? 'active' : ''}`} onClick={() => toggle(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: 12, background: 'var(--warn-soft)', borderRadius: 6, fontSize: 12, color: 'oklch(0.4 0.13 75)', display: 'flex', gap: 8 }}>
          <Icon name="alert" size={14}/>
          <div>The full key will be shown once after creation. Store it securely — it can't be retrieved later.</div>
        </div>
      </div>
    </Modal>
  );
};

// ── New maintenance window ────────────────────────────────────────────────
const NewMaintenanceModal = ({ onClose, onAdd }) => {
  const [f, setF] = React.useState({ title: '', start: '', duration: 60, scope: 'Network', impact: '' });
  return (
    <Modal title="Schedule maintenance window" onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.title || !f.start} onClick={() => { onAdd(f); onClose(); }}><Icon name="check" size={12}/>Schedule</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="field"><label>Title</label><input value={f.title} onChange={e => setF({...f, title: e.target.value})}/></div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Start</label><input type="datetime-local" value={f.start} onChange={e => setF({...f, start: e.target.value})}/></div>
          <div className="field"><label>Duration (min)</label><input type="number" value={f.duration} onChange={e => setF({...f, duration: +e.target.value})}/></div>
        </div>
        <div className="field"><label>Scope</label>
          <select value={f.scope} onChange={e => setF({...f, scope: e.target.value})}>
            <option>Network</option><option>Database</option><option>pve-node-01</option><option>pve-node-02</option><option>pve-node-03</option><option>pve-node-04</option><option>pve-node-05</option>
          </select>
        </div>
        <div className="field"><label>Impact description</label><textarea rows="3" value={f.impact} onChange={e => setF({...f, impact: e.target.value})}/></div>
      </div>
    </Modal>
  );
};

// ── Reserve IP modal ──────────────────────────────────────────────────────
const ReserveIpModal = ({ onClose }) => {
  const { toast } = useStore();
  const [f, setF] = React.useState({ ip: '', vlan: 'VLAN-240', reason: '' });
  return (
    <Modal title="Reserve public IP" onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.ip || !f.reason} onClick={() => { toast(`Reserved ${f.ip} on ${f.vlan}`, 'ok'); onClose(); }}>Reserve</button>
        </>
      }>
      <div className="flex col gap-3">
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Public IPv4</label><input value={f.ip} onChange={e => setF({...f, ip: e.target.value})} placeholder="203.81.64.x" style={{ fontFamily: 'var(--mono)' }}/></div>
          <div className="field"><label>VLAN</label><input value={f.vlan} onChange={e => setF({...f, vlan: e.target.value})} style={{ fontFamily: 'var(--mono)' }}/></div>
        </div>
        <div className="field"><label>Reservation reason</label><textarea rows="2" value={f.reason} onChange={e => setF({...f, reason: e.target.value})} placeholder="Customer name, project, expected use…"/></div>
      </div>
    </Modal>
  );
};

Object.assign(window, { Modal, NewVMModal, NewCustomerModal, NewTaskModal, EmailModal, RenewModal, SpecChangeModal, TerminateModal, KYCDocsModal, ConfirmModal, InviteMemberModal, NewInvoiceModal, NewDealModal, NewReminderModal, NewApiKeyModal, NewMaintenanceModal, ReserveIpModal });
