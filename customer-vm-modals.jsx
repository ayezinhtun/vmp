// Customer VM action modals — Renew, Upgrade, Change Plan (IaaS style)

// ── Renew (IaaS-style) ────────────────────────────────────────────────────
const CustRenewModal = ({ vm, onClose, onSubmit }) => {
  const [months, setMonths] = React.useState(12);
  const periods = [
    { months: 1, label: '1 month', discount: 0 },
    { months: 3, label: '3 months', discount: 5 },
    { months: 6, label: '6 months', discount: 8 },
    { months: 12, label: '12 months', tag: 'Best value', discount: 12 },
    { months: 24, label: '24 months', discount: 18 },
  ];
  const selected = periods.find(p => p.months === months);
  const subtotal = vm.priceMonth * months;
  const discount = Math.round(subtotal * selected.discount / 100);
  const total = subtotal - discount;
  const newExpiry = (() => {
    const d = new Date(vm.expiry === '—' ? Date.now() : vm.expiry);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Renew {vm.name}</h3>
            <div className="text-xs text-mute mt-1 mono">{vm.id} · expires {vm.expiry}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Renewal period</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {periods.map(p => (
              <IaaSCard key={p.months} selected={months === p.months} onClick={() => setMonths(p.months)} padding={12}>
                <div className="flex between">
                  <div>
                    <div className="fw-7 text-sm">{p.label}</div>
                    <div className="text-xs text-mute mt-1">
                      {p.discount > 0 && <span className="fw-6" style={{ color: 'var(--ok)' }}>{p.discount}% off</span>}
                      {p.discount === 0 && <span className="text-mute">No discount</span>}
                    </div>
                  </div>
                  {p.tag && <span className="pill accent" style={{ fontSize: 10, alignSelf: 'flex-start' }}><span className="dot"/>{p.tag}</span>}
                </div>
              </IaaSCard>
            ))}
          </div>

          <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Summary</div>
          <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 14 }}>
            <SummaryLine icon="server" label="VM" value={<span className="mono">{vm.name}</span>}/>
            <SummaryLine icon="clock" label="Current expiry" value={vm.expiry}/>
            <SummaryLine icon="clock" label="New expiry" value={<span style={{ color: 'var(--ok)' }} className="fw-7">{newExpiry}</span>}/>
            <SummaryLine icon="invoice" label="Monthly rate" value={`MMK ${formatMMK(vm.priceMonth)}`}/>
            <div className="divider" style={{ margin: '10px 0' }}/>
            <div className="flex between text-sm"><span className="text-mute">Subtotal ({months} mo)</span><span className="tnum">MMK {formatMMK(subtotal)}</span></div>
            {discount > 0 && <div className="flex between text-sm mt-1"><span className="text-mute">Discount</span><span className="tnum" style={{ color: 'var(--ok)' }}>− MMK {formatMMK(discount)}</span></div>}
            <div className="divider" style={{ margin: '10px 0' }}/>
            <div className="flex center between">
              <span className="fw-7">Total</span>
              <span className="tnum fw-7" style={{ fontSize: 18 }}>MMK {formatMMK(total)}</span>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={() => onSubmit(vm, months)}><Icon name="check" size={12}/>Submit renewal request</button>
        </div>
      </div>
    </div>
  );
};

// ── Upgrade VM (CPU / RAM / Storage / Bandwidth) ──────────────────────────
const CustUpgradeModal = ({ vm, onClose }) => {
  const { addTask, toast, state } = useStore();
  const me = state.customers.find(c => c.id === vm.customer);
  const [spec, setSpec] = React.useState({ vcpu: vm.vcpu, ram: vm.ram, storage: vm.storage, bandwidth: vm.bandwidth });

  const oldCost = vm.priceMonth;
  // Pricing rough: 20k per vCPU, 6k per GB RAM, 200 per GB storage
  const calcCost = (s) => Math.round(s.vcpu * 20000 + s.ram * 6000 + s.storage * 200 + (s.bandwidth === '1 Gbps' ? 30000 : s.bandwidth === '500 Mbps' ? 10000 : 0));
  const newCost = calcCost(spec);
  const diff = newCost - oldCost;

  const cpuSteps = [1, 2, 4, 8, 16, 32];
  const ramSteps = [2, 4, 8, 16, 32, 64, 128];
  const storageSteps = [50, 100, 200, 500, 1000, 2000];
  const bwOpts = ['100 Mbps', '500 Mbps', '1 Gbps'];

  const submit = () => {
    addTask({
      title: `Spec upgrade — ${vm.name} (${vm.vcpu}/${vm.ram}/${vm.storage} → ${spec.vcpu}/${spec.ram}/${spec.storage})`,
      customer: vm.customer, vm: vm.id, type: 'Upgrade', priority: 'Normal', status: 'Pending', team: 'Sales',
      subscription: '—',
      assignee: me?.salesperson || '—',
      notes: `Customer-initiated spec upgrade via portal.
Current: ${vm.vcpu} vCPU · ${vm.ram} GB RAM · ${vm.storage} GB · ${vm.bandwidth}
Requested: ${spec.vcpu} vCPU · ${spec.ram} GB RAM · ${spec.storage} GB · ${spec.bandwidth}
Cost diff: ${diff >= 0 ? '+' : ''}MMK ${formatMMK(Math.abs(diff))}/mo`,
    });
    toast('Upgrade request sent to Sales', 'ok');
    onClose();
  };

  const Section = ({ label, current, options, value, onChange, unit, icon }) => (
    <div className="card" style={{ borderColor: 'var(--line)' }}>
      <div className="card-body" style={{ padding: 14 }}>
        <div className="flex center between mb-2">
          <div className="flex center gap-2">
            <Icon name={icon} size={13}/>
            <span className="fw-7 text-sm">{label}</span>
          </div>
          <div className="text-xs text-mute">
            Current: <span className="tnum fw-6">{current}{unit}</span>
            {value !== current && <> → <span className="tnum fw-7" style={{ color: 'var(--accent-strong)' }}>{value}{unit}</span></>}
          </div>
        </div>
        <div className="flex gap-1 wrap">
          {options.map(o => (
            <button key={o}
              className={`filter-chip ${value === o ? 'active' : ''}`}
              onClick={() => onChange(o)}
              disabled={o < current}
              style={{ opacity: o < current ? 0.4 : 1, cursor: o < current ? 'not-allowed' : 'pointer', minWidth: 50 }}>
              {o}{unit}{o === current && <span className="text-xs text-mute" style={{ marginLeft: 4 }}>(now)</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Upgrade {vm.name}</h3>
            <div className="text-xs text-mute mt-1">Pick higher spec — downgrades require sales approval</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-2">
            <Section label="vCPU cores" icon="cpu" current={vm.vcpu} options={cpuSteps} value={spec.vcpu} onChange={v => setSpec({...spec, vcpu: v})} unit=""/>
            <Section label="RAM" icon="database" current={vm.ram} options={ramSteps} value={spec.ram} onChange={v => setSpec({...spec, ram: v})} unit=" GB"/>
            <Section label="Storage" icon="box" current={vm.storage} options={storageSteps} value={spec.storage} onChange={v => setSpec({...spec, storage: v})} unit=" GB"/>
            <Section label="Network traffic" icon="network" current={vm.bandwidth} options={bwOpts} value={spec.bandwidth} onChange={v => setSpec({...spec, bandwidth: v})} unit=""/>
          </div>

          <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 14, marginTop: 16 }}>
            <div className="flex center between">
              <div>
                <div className="text-xs text-mute">Current monthly</div>
                <div className="tnum fw-7" style={{ fontSize: 15 }}>MMK {formatMMK(oldCost)}</div>
              </div>
              <Icon name="chevron-right" size={16} className="text-mute"/>
              <div>
                <div className="text-xs text-mute">New monthly</div>
                <div className="tnum fw-7" style={{ fontSize: 15 }}>MMK {formatMMK(newCost)}</div>
              </div>
              <div className="right">
                <div className="text-xs text-mute">Cost diff</div>
                <div className="tnum fw-7" style={{ fontSize: 15, color: diff >= 0 ? 'var(--bad)' : 'var(--ok)' }}>{diff >= 0 ? '+' : '−'}MMK {formatMMK(Math.abs(diff))}/mo</div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={spec.vcpu === vm.vcpu && spec.ram === vm.ram && spec.storage === vm.storage && spec.bandwidth === vm.bandwidth} onClick={submit}>
            <Icon name="arrow-up" size={12}/>Submit upgrade request
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Change Plan ───────────────────────────────────────────────────────────
const CustChangePlanModal = ({ vm, onClose }) => {
  const { addTask, toast, state } = useStore();
  const me = state.customers.find(c => c.id === vm.customer);

  const plans = [
    { id: 'starter', label: 'Starter', vcpu: 2, ram: 4, storage: 50, price: 90000, desc: 'Small services, dev work' },
    { id: 'standard', label: 'Standard', vcpu: 4, ram: 8, storage: 100, price: 140000, desc: 'Web apps, staging' },
    { id: 'business', label: 'Business', vcpu: 4, ram: 16, storage: 200, price: 180000, desc: 'Production workloads' },
    { id: 'performance', label: 'Performance', vcpu: 8, ram: 32, storage: 500, price: 280000, desc: 'Heavy traffic, databases' },
    { id: 'enterprise', label: 'Enterprise', vcpu: 16, ram: 64, storage: 1000, price: 520000, desc: 'Mission-critical' },
  ];

  // Match current plan by spec
  const currentPlan = plans.find(p => p.vcpu === vm.vcpu && p.ram === vm.ram && p.storage === vm.storage) || { label: 'Custom', vcpu: vm.vcpu, ram: vm.ram, storage: vm.storage, price: vm.priceMonth };
  const [picked, setPicked] = React.useState(currentPlan.id || 'business');

  const target = plans.find(p => p.id === picked);
  const diff = (target?.price || 0) - vm.priceMonth;
  const direction = diff > 0 ? 'Upgrade' : diff < 0 ? 'Downgrade' : 'Switch';

  const submit = () => {
    addTask({
      title: `Plan change — ${vm.name} (${currentPlan.label} → ${target.label})`,
      customer: vm.customer, vm: vm.id, type: 'Upgrade', priority: 'Normal', status: 'Pending', team: 'Sales',
      subscription: '—',
      assignee: me?.salesperson || '—',
      notes: `Customer-initiated plan change via portal.
From: ${currentPlan.label} (${vm.vcpu}c / ${vm.ram}GB / ${vm.storage}GB) — MMK ${formatMMK(vm.priceMonth)}/mo
To: ${target.label} (${target.vcpu}c / ${target.ram}GB / ${target.storage}GB) — MMK ${formatMMK(target.price)}/mo
Direction: ${direction}
Cost diff: ${diff >= 0 ? '+' : ''}MMK ${formatMMK(Math.abs(diff))}/mo`,
    });
    toast(`${direction} request sent to Sales`, 'ok');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Change plan — {vm.name}</h3>
            <div className="text-xs text-mute mt-1">Currently on <strong>{currentPlan.label}</strong> · MMK {formatMMK(vm.priceMonth)}/mo</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {plans.map(p => {
              const isCurrent = p.id === currentPlan.id;
              return (
                <IaaSCard key={p.id} selected={picked === p.id} onClick={() => setPicked(p.id)} padding={14}>
                  <div className="flex center between mb-2">
                    <div>
                      <div className="flex center gap-2">
                        <span className="fw-7 text-sm">{p.label}</span>
                        {isCurrent && <span className="pill subtle" style={{ fontSize: 10 }}>Current</span>}
                      </div>
                      <div className="text-xs text-mute mt-1">{p.desc}</div>
                    </div>
                    <div className="right">
                      <div className="tnum fw-7" style={{ fontSize: 14 }}>MMK {formatMMK(p.price)}</div>
                      <div className="text-xs text-mute">/month</div>
                    </div>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }}/>
                  <div className="flex between text-xs">
                    <span><Icon name="cpu" size={10}/> <span className="tnum fw-6">{p.vcpu}</span>c</span>
                    <span><Icon name="database" size={10}/> <span className="tnum fw-6">{p.ram}</span>GB</span>
                    <span><Icon name="box" size={10}/> <span className="tnum fw-6">{p.storage}</span>GB</span>
                  </div>
                </IaaSCard>
              );
            })}
          </div>

          {target && target.id !== currentPlan.id && (
            <div style={{ marginTop: 16, padding: 14, background: diff > 0 ? 'var(--bad-soft)' : 'var(--ok-soft)', borderRadius: 8 }}>
              <div className="flex center between">
                <span className="fw-7 text-sm" style={{ color: diff > 0 ? 'var(--bad)' : 'var(--ok)' }}>{direction} to {target.label}</span>
                <span className="tnum fw-7" style={{ fontSize: 15, color: diff > 0 ? 'var(--bad)' : 'var(--ok)' }}>{diff > 0 ? '+' : '−'}MMK {formatMMK(Math.abs(diff))}/mo</span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!target || target.id === currentPlan.id} onClick={submit}>
            <Icon name="check" size={12}/>Submit {direction.toLowerCase()} request
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Support ticket modal (legacy — kept for back-compat) ─────────────────
const SupportTicketModal = ({ onClose }) => {
  const { addTicket, state } = useStore();
  const me = state.customers.find(c => c.id === 'C-1043');
  const [f, setF] = React.useState({ subject: '', priority: 'Normal', body: '' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-head"><h3 style={{ margin: 0 }}>New support ticket</h3><button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button></div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="field"><label>Subject</label><input value={f.subject} onChange={e => setF({...f, subject: e.target.value})}/></div>
            <div className="field"><label>Priority</label>
              <div className="flex gap-2">
                {['Low', 'Normal', 'Urgent'].map(p => <button key={p} className={`filter-chip ${f.priority === p ? 'active' : ''}`} onClick={() => setF({...f, priority: p})}>{p}</button>)}
              </div>
            </div>
            <div className="field"><label>Describe the issue</label><textarea rows="6" value={f.body} onChange={e => setF({...f, body: e.target.value})}/></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.subject || !f.body} onClick={() => { addTicket({ ...f, customer: me.id }); onClose(); }}>Submit ticket</button>
        </div>
      </div>
    </div>
  );
};

// ── Customer VM Detail-only modal (legacy compat) ─────────────────────────
const CustVMModal = ({ vm, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-head"><h3 style={{ margin: 0 }}>{vm.name}</h3><button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button></div>
      <div className="modal-body"><div className="text-sm">Open the full VM detail page for control actions.</div></div>
      <div className="modal-foot"><button className="btn primary" onClick={onClose}>Close</button></div>
    </div>
  </div>
);

Object.assign(window, { CustRenewModal, CustUpgradeModal, CustChangePlanModal, SupportTicketModal, CustVMModal });
