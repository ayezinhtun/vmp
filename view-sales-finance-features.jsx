// Sales (4) + Finance (4) features

// ── SALES ─────────────────────────────────────────────────────────────────

// 1. SALES PIPELINE — drag-drop kanban for deals
const PipelineView = ({ openModal }) => {
  const { state, addCustomer, toast } = useStore();
  const [deals, setDeals] = React.useState([
    { id: 'D-001', company: 'Mawlamyine Tech Hub', contact: 'U Aung Phyo', value: 6800000, owner: 'Su Su', stage: 'Lead', age: 2, source: 'Website', last: 'Email exchange · 2d ago' },
    { id: 'D-002', company: 'Pathein Logistics', contact: 'Daw Khin Khin', value: 4200000, owner: 'Su Su', stage: 'Qualified', age: 5, source: 'Referral · C-1042', last: 'Discovery call · yesterday' },
    { id: 'D-003', company: 'Bago Manufacturing', contact: 'U Tin Soe', value: 12400000, owner: 'Ko Naing', stage: 'Qualified', age: 8, source: 'Cold outreach', last: 'Demo scheduled Friday' },
    { id: 'D-004', company: 'Monywa Trading', contact: 'Daw Mya Mya', contact_email: 'mya@monywa.mm', value: 3600000, owner: 'Su Su', stage: 'Proposal', age: 12, source: 'Google Form', last: 'Quote Q-2026-018 sent' },
    { id: 'D-005', company: 'Hpa-An Coffee Co.', contact: 'U Soe Win', value: 1800000, owner: 'Ko Naing', stage: 'Proposal', age: 7, source: 'Trial conversion', last: 'Awaiting customer review' },
    { id: 'D-006', company: 'Dawei Port Holdings', contact: 'U Maung Maung', value: 18500000, owner: 'Su Su', stage: 'Negotiation', age: 18, source: 'Inbound call', last: 'Pricing discussion · today' },
    { id: 'D-007', company: 'Loikaw Solar', contact: 'Daw Ei Ei', value: 5200000, owner: 'Ko Naing', stage: 'Won', age: 25, source: 'Referral', last: 'Onboarded' },
  ]);
  const [dragId, setDragId] = React.useState(null);
  const [overCol, setOverCol] = React.useState(null);

  const stages = [
    { id: 'Lead', label: 'Lead', accent: 'var(--ink-3)' },
    { id: 'Qualified', label: 'Qualified', accent: 'var(--info)' },
    { id: 'Proposal', label: 'Proposal', accent: 'oklch(0.55 0.18 285)' },
    { id: 'Negotiation', label: 'Negotiation', accent: 'oklch(0.72 0.14 75)' },
    { id: 'Won', label: 'Won', accent: 'var(--ok)' },
  ];

  const totalValue = (stage) => deals.filter(d => d.stage === stage).reduce((a, d) => a + d.value, 0);

  const onDrop = (stage) => {
    if (dragId) {
      setDeals(deals.map(d => d.id === dragId ? { ...d, stage } : d));
      if (stage === 'Won') toast(`Deal moved to Won — convert to customer?`, 'ok');
    }
    setDragId(null); setOverCol(null);
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Sales pipeline</h1>
          <p className="page-subtitle">{deals.length} active deals · MMK {formatMMK(deals.reduce((a, d) => a + d.value, 0))} weighted value · drag cards between stages</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Pipeline exported to CSV', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => openModal('newdeal', { onAdd: (d) => { const id = `D-${String(deals.length + 8).padStart(3, '0')}`; setDeals([{ id, ...d }, ...deals]); } })}><Icon name="plus" size={13}/>New deal</button>
        </div>
      </div>

      <div className="grid-4 mb-3">
        <div className="metric"><div className="label">Pipeline value</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(deals.filter(d => d.stage !== 'Won').reduce((a, d) => a + d.value, 0))}</div></div>
        <div className="metric"><div className="label">Won this month</div><div className="value tnum" style={{ fontSize: 20, color: 'var(--ok)' }}>MMK {formatMMK(totalValue('Won'))}</div></div>
        <div className="metric"><div className="label">Avg deal size</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(Math.round(deals.reduce((a, d) => a + d.value, 0) / deals.length))}</div></div>
        <div className="metric"><div className="label">Avg sales cycle</div><div className="value tnum" style={{ fontSize: 20 }}>14<span style={{ fontSize: 14, color: 'var(--ink-3)' }}> days</span></div></div>
      </div>

      <div className="kanban" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {stages.map(s => {
          const items = deals.filter(d => d.stage === s.id);
          return (
            <div key={s.id} className="kcol"
              onDragOver={e => { e.preventDefault(); setOverCol(s.id); }}
              onDrop={e => { e.preventDefault(); onDrop(s.id); }}
              style={{ background: overCol === s.id ? 'var(--accent-soft)' : 'var(--surface-2)', borderColor: overCol === s.id ? 'var(--accent)' : 'var(--line)' }}>
              <div className="kcol-head">
                <span className="title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.accent }}/>{s.label}
                </span>
                <span className="count">{items.length}</span>
                <div style={{ flex: 1 }}/>
                <span className="text-xs text-mute tnum">{formatMMK(totalValue(s.id) / 1000000).split('.')[0]}M</span>
              </div>
              <div className="kcol-body">
                {items.map(d => (
                  <div key={d.id} className="kcard"
                    draggable
                    onDragStart={() => setDragId(d.id)}
                    onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    style={{ opacity: dragId === d.id ? 0.4 : 1, cursor: 'grab' }}>
                    <div className="fw-6 text-sm">{d.company}</div>
                    <div className="text-xs text-mute mb-2">{d.contact}</div>
                    <div className="tnum fw-7" style={{ fontSize: 14, marginBottom: 6 }}>MMK {formatMMK(d.value)}</div>
                    <div className="meta">
                      <span><Icon name="users" size={11}/>{d.owner}</span>
                      <span><Icon name="clock" size={11}/>{d.age}d</span>
                    </div>
                    <div className="text-xs text-mute mt-2" style={{ paddingTop: 6, borderTop: '1px solid var(--line)' }}>{d.last}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. QUOTE GENERATOR
const QuotesView = () => {
  const { state, toast } = useStore();
  const [quotes, setQuotes] = React.useState([
    { id: 'Q-2026-018', customer: 'Monywa Trading', items: 3, total: 3600000, validity: '2026-06-10', status: 'Sent' },
    { id: 'Q-2026-017', customer: 'Loikaw Solar', items: 1, total: 1800000, validity: '2026-06-05', status: 'Accepted' },
    { id: 'Q-2026-016', customer: 'Dawei Port', items: 5, total: 18500000, validity: '2026-06-08', status: 'Sent' },
    { id: 'Q-2026-015', customer: 'Pathein Logistics', items: 2, total: 4200000, validity: '2026-06-01', status: 'Draft' },
  ]);
  const [building, setBuilding] = React.useState(false);
  const [form, setForm] = React.useState({
    customer: '', lines: [{ vcpu: 4, ram: 16, storage: 200, qty: 1, price: 180000 }]
  });

  const lineTotal = (l) => l.price * l.qty;
  const subTotal = form.lines.reduce((a, l) => a + lineTotal(l), 0);
  const yearTotal = subTotal * 12;

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Quotes</h1>
          <p className="page-subtitle">{quotes.length} quotes · {quotes.filter(q => q.status === 'Accepted').length} accepted this month</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setBuilding(true)}><Icon name="plus" size={13}/>New quote</button>
        </div>
      </div>

      {building && (
        <div className="card mb-4">
          <div className="card-head">
            <h3 className="card-title">Build a quote</h3>
            <button className="icon-btn" onClick={() => setBuilding(false)}><Icon name="x" size={14}/></button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="field"><label>Customer / prospect</label><input value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} placeholder="Company name"/></div>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>VMs</div>
              <table className="tbl">
                <thead><tr><th>vCPU</th><th>RAM (GB)</th><th>Storage (GB)</th><th className="right">Qty</th><th className="right">Unit (MMK/mo)</th><th className="right">Line total</th><th></th></tr></thead>
                <tbody>
                  {form.lines.map((l, i) => (
                    <tr key={i}>
                      <td><input type="number" value={l.vcpu} onChange={e => { const lines = [...form.lines]; lines[i].vcpu = +e.target.value; setForm({...form, lines}); }} style={{ width: 60, padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 4 }}/></td>
                      <td><input type="number" value={l.ram} onChange={e => { const lines = [...form.lines]; lines[i].ram = +e.target.value; setForm({...form, lines}); }} style={{ width: 60, padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 4 }}/></td>
                      <td><input type="number" value={l.storage} onChange={e => { const lines = [...form.lines]; lines[i].storage = +e.target.value; setForm({...form, lines}); }} style={{ width: 70, padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 4 }}/></td>
                      <td className="right"><input type="number" value={l.qty} onChange={e => { const lines = [...form.lines]; lines[i].qty = +e.target.value; setForm({...form, lines}); }} style={{ width: 50, padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 4 }}/></td>
                      <td className="right"><input type="number" value={l.price} onChange={e => { const lines = [...form.lines]; lines[i].price = +e.target.value; setForm({...form, lines}); }} style={{ width: 100, padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 4 }}/></td>
                      <td className="right tnum fw-6">{formatMMK(lineTotal(l))}</td>
                      <td className="right"><button className="icon-btn" onClick={() => setForm({...form, lines: form.lines.filter((_, j) => j !== i)})}><Icon name="trash" size={12}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => setForm({...form, lines: [...form.lines, { vcpu: 4, ram: 16, storage: 200, qty: 1, price: 180000 }]})}><Icon name="plus" size={11}/>Add line</button>
              <div className="card" style={{ background: 'var(--surface-2)' }}>
                <div className="card-body">
                  <div className="grid-3" style={{ gap: 16 }}>
                    <div><div className="text-xs text-mute">Monthly subtotal</div><div className="tnum fw-7" style={{ fontSize: 18 }}>MMK {formatMMK(subTotal)}</div></div>
                    <div><div className="text-xs text-mute">Annual (1 year)</div><div className="tnum fw-7" style={{ fontSize: 18 }}>MMK {formatMMK(yearTotal)}</div></div>
                    <div><div className="text-xs text-mute">Annual w/ 10% discount</div><div className="tnum fw-7" style={{ fontSize: 18, color: 'var(--ok)' }}>MMK {formatMMK(Math.round(yearTotal * 0.9))}</div></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                <button className="btn" onClick={() => { const id = `Q-2026-${String(quotes.length + 19).padStart(3, '0')}`; setQuotes([{ id, customer: form.customer, items: form.lines.length, total: subTotal * 12, validity: '2026-06-15', status: 'Draft' }, ...quotes]); toast('Quote saved as draft', 'ok'); setBuilding(false); }}>Save draft</button>
                <button className="btn accent" onClick={() => { const id = `Q-2026-${String(quotes.length + 19).padStart(3, '0')}`; setQuotes([{ id, customer: form.customer, items: form.lines.length, total: subTotal * 12, validity: '2026-06-15', status: 'Sent' }, ...quotes]); toast(`Quote ${id} sent to customer`, 'ok'); setBuilding(false); }}><Icon name="mail" size={12}/>Send to customer</button>
                <div style={{ flex: 1 }}/>
                <button className="btn ghost" onClick={() => setBuilding(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Quote #</th><th>Customer</th><th className="right">Lines</th><th className="right">Total (1y)</th><th>Valid until</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td className="mono fw-6">{q.id}</td>
                  <td>{q.customer}</td>
                  <td className="right tnum">{q.items}</td>
                  <td className="right tnum fw-6">MMK {formatMMK(q.total)}</td>
                  <td className="tnum text-sm">{q.validity}</td>
                  <td><span className={`pill ${q.status === 'Accepted' ? 'ok' : q.status === 'Sent' ? 'accent' : 'subtle'}`}><span className="dot"/>{q.status}</span></td>
                  <td className="right"><button className="btn sm" onClick={() => toast(`Downloaded ${q.id}.pdf`, 'info')}><Icon name="download" size={11}/>PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. FOLLOW-UP REMINDERS
const FollowupsView = ({ openModal }) => {
  const { state, toast } = useStore();
  const [list, setList] = React.useState([
    { id: 'F-001', customer: 'C-1043', task: 'Confirm 6-month renewal (VM-2091/92/93)', due: '2026-05-28', priority: 'Urgent', done: false },
    { id: 'F-002', customer: 'C-1046', task: 'Renewal call (NPD cluster)', due: '2026-05-27', priority: 'Urgent', done: false },
    { id: 'F-003', customer: 'C-1044', task: 'Re-upload KYC documents', due: '2026-05-29', priority: 'Normal', done: false },
    { id: 'F-004', customer: 'C-1050', task: 'KYC follow-up call', due: '2026-05-30', priority: 'Normal', done: false },
    { id: 'F-005', customer: 'C-1042', task: 'Quarterly check-in', due: '2026-06-05', priority: 'Low', done: false },
    { id: 'F-006', customer: 'C-1045', task: 'Resolved KYC question', due: '2026-05-26', priority: 'Normal', done: true },
  ]);
  const [show, setShow] = React.useState('open');

  const toggle = (id) => setList(list.map(l => l.id === id ? { ...l, done: !l.done } : l));
  const filtered = show === 'open' ? list.filter(l => !l.done) : show === 'done' ? list.filter(l => l.done) : list;

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Follow-ups</h1>
          <p className="page-subtitle">{list.filter(l => !l.done).length} open · {list.filter(l => !l.done && l.priority === 'Urgent').length} urgent · don't miss a renewal</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => openModal('newreminder', { onAdd: (f) => { const id = `F-${String(list.length + 7).padStart(3, '0')}`; setList([{ id, done: false, ...f }, ...list]); } })}><Icon name="plus" size={13}/>Add reminder</button>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          {[['open', 'Open'], ['done', 'Completed'], ['all', 'All']].map(([id, l]) => (
            <button key={id} className={`filter-chip ${show === id ? 'active' : ''}`} onClick={() => setShow(id)}>{l}</button>
          ))}
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th style={{ width: 30 }}></th><th>Task</th><th>Customer</th><th>Due</th><th>Priority</th><th></th></tr></thead>
            <tbody>
              {filtered.map(f => {
                const c = state.customers.find(c => c.id === f.customer);
                const diff = Math.ceil((new Date(f.due) - window.MOCK.TODAY) / 86400000);
                const overdue = diff < 0 && !f.done;
                const today = diff === 0;
                return (
                  <tr key={f.id} style={{ opacity: f.done ? 0.55 : 1 }}>
                    <td><input type="checkbox" checked={f.done} onChange={() => toggle(f.id)}/></td>
                    <td><div className="fw-6 text-sm" style={{ textDecoration: f.done ? 'line-through' : 'none' }}>{f.task}</div></td>
                    <td>
                      <div className="flex center gap-2"><Avatar name={c?.name || 'X'} size={22}/>
                        <div><div className="text-sm">{c?.company}</div><div className="text-xs text-mute mono">{f.customer}</div></div>
                      </div>
                    </td>
                    <td>
                      <div className="tnum text-sm">{f.due}</div>
                      <div className="text-xs" style={{ color: overdue ? 'var(--bad)' : today ? 'oklch(0.55 0.16 75)' : 'var(--ink-3)' }}>
                        {overdue ? `${Math.abs(diff)}d overdue` : today ? 'Today' : `in ${diff}d`}
                      </div>
                    </td>
                    <td><span className={`pill ${f.priority === 'Urgent' ? 'bad' : f.priority === 'Low' ? 'subtle' : 'warn'}`}><span className="dot"/>{f.priority}</span></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => toast(`Snoozed ${f.task}`, 'info')}>Snooze</button>
                      <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => toast(`Email opened for ${c?.company}`, 'info')}><Icon name="mail" size={11}/></button>
                    </td>
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

// 4. TRIAL CONVERSION TRACKER
const TrialsView = () => {
  const { state } = useStore();
  const trials = state.vms.filter(v => v.type === 'Trial');
  // Mock historical: 12 trials, 7 converted
  const historical = [
    { id: 'VM-2050', customer: 'Mawlamyine Media', started: '2026-05-08', expires: '2026-05-22', converted: true, value: 1680000 },
    { id: 'VM-2055', customer: 'Pyay Agritech', started: '2026-05-12', expires: '2026-05-26', converted: true, value: 1920000 },
    { id: 'VM-2061', customer: 'Lashio Trade', started: '2026-05-15', expires: '2026-05-29', converted: false, value: 0 },
    { id: 'VM-2068', customer: 'Magway Foods', started: '2026-05-18', expires: '2026-06-01', converted: true, value: 1440000 },
    { id: 'VM-2071', customer: 'Bhamo Mining', started: '2026-05-20', expires: '2026-06-03', converted: false, value: 0 },
  ];
  const converted = historical.filter(h => h.converted).length;
  const convRate = Math.round(converted / historical.length * 100);
  const totalValue = historical.filter(h => h.converted).reduce((a, h) => a + h.value, 0);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Trial conversions</h1>
          <p className="page-subtitle">{trials.length} active trials · {convRate}% conversion rate (last 90 days)</p>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Active trials</div><div className="value tnum">{trials.length}</div></div>
        <div className="metric"><div className="label">Conversion rate</div><div className="value tnum" style={{ color: 'var(--ok)' }}>{convRate}%</div><div className="trend"><span className="up">+8%</span> vs last quarter</div></div>
        <div className="metric"><div className="label">Avg trial → paid</div><div className="value tnum">9<span style={{ fontSize: 14, color: 'var(--ink-3)' }}> days</span></div></div>
        <div className="metric"><div className="label">Revenue from conv.</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(totalValue)}</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Active trials</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>VM</th><th>Customer</th><th>Day</th><th>Status</th></tr></thead>
              <tbody>
                {trials.length === 0 && <tr><td colSpan="4"><div className="empty"><div className="sub">No active trials.</div></div></td></tr>}
                {trials.map(v => {
                  const c = state.customers.find(c => c.id === v.customer);
                  return (
                    <tr key={v.id}>
                      <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                      <td className="text-sm">{c?.company}</td>
                      <td className="tnum text-sm">{v.start === '—' ? '0' : Math.ceil((window.MOCK.TODAY - new Date(v.start)) / 86400000)} / 14</td>
                      <td><StatusPill status={v.status}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 className="card-title">Recent trial outcomes</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Customer</th><th>Started</th><th>Outcome</th><th className="right">Value</th></tr></thead>
              <tbody>
                {historical.map(h => (
                  <tr key={h.id}>
                    <td><div className="fw-6 text-sm">{h.customer}</div><div className="text-xs text-mute mono">{h.id}</div></td>
                    <td className="tnum text-sm">{h.started}</td>
                    <td>{h.converted ? <span className="pill ok"><span className="dot"/>Converted</span> : <span className="pill subtle"><span className="dot"/>Expired</span>}</td>
                    <td className="right tnum">{h.converted ? `MMK ${formatMMK(h.value)}` : '—'}</td>
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

// ── FINANCE ───────────────────────────────────────────────────────────────

// 1. AGING RECEIVABLES (30/60/90+)
const AgingView = () => {
  const { state, markPaid } = useStore();
  const TODAY = window.MOCK.TODAY;
  const buckets = { current: [], '0-30': [], '31-60': [], '61-90': [], '90+': [] };
  state.invoices.filter(i => i.status !== 'Payment Received').forEach(i => {
    const days = Math.ceil((TODAY - new Date(i.due)) / 86400000);
    if (days < 0) buckets.current.push({ ...i, days });
    else if (days <= 30) buckets['0-30'].push({ ...i, days });
    else if (days <= 60) buckets['31-60'].push({ ...i, days });
    else if (days <= 90) buckets['61-90'].push({ ...i, days });
    else buckets['90+'].push({ ...i, days });
  });
  const total = (b) => b.reduce((a, i) => a + i.amount, 0);
  const all = [...buckets.current, ...buckets['0-30'], ...buckets['31-60'], ...buckets['61-90'], ...buckets['90+']];

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Aging receivables</h1>
          <p className="page-subtitle">{all.length} unpaid invoices · MMK {formatMMK(total(all))} outstanding</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Aging report exported', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => useStore().toast(`Sent ${all.length} payment reminders`, 'ok')}><Icon name="mail" size={13}/>Bulk reminder</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Current</div><div className="value tnum" style={{ fontSize: 18, color: 'var(--ok)' }}>MMK {formatMMK(total(buckets.current))}</div><div className="trend">{buckets.current.length} invoices</div></div>
        <div className="metric"><div className="label">0–30 days</div><div className="value tnum" style={{ fontSize: 18, color: 'oklch(0.55 0.16 75)' }}>MMK {formatMMK(total(buckets['0-30']))}</div><div className="trend">{buckets['0-30'].length} invoices</div></div>
        <div className="metric"><div className="label">31–60 days</div><div className="value tnum" style={{ fontSize: 18, color: 'oklch(0.55 0.16 35)' }}>MMK {formatMMK(total(buckets['31-60']))}</div><div className="trend">{buckets['31-60'].length} invoices</div></div>
        <div className="metric"><div className="label">90+ days</div><div className="value tnum" style={{ fontSize: 18, color: 'var(--bad)' }}>MMK {formatMMK(total(buckets['90+']) + total(buckets['61-90']))}</div><div className="trend">{buckets['90+'].length + buckets['61-90'].length} invoices</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">All unpaid invoices</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th>Age</th><th className="right">Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {all.map(i => {
                const c = state.customers.find(c => c.id === i.customer);
                const bucket = i.days < 0 ? 'Current' : i.days <= 30 ? '0-30d' : i.days <= 60 ? '31-60d' : i.days <= 90 ? '61-90d' : '90+d';
                const color = i.days < 0 ? 'ok' : i.days <= 30 ? 'warn' : 'bad';
                return (
                  <tr key={i.id}>
                    <td className="mono fw-6">{i.id}</td>
                    <td><div className="fw-6 text-sm">{c?.company}</div></td>
                    <td className="tnum text-sm">{i.due}</td>
                    <td><span className={`pill ${color}`}><span className="dot"/>{bucket}</span></td>
                    <td className="right tnum fw-6">MMK {formatMMK(i.amount)}</td>
                    <td><StatusPill status={i.status}/></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => useStore().toast(`Reminder sent to ${c?.company}`, 'info')}>Remind</button>
                      <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => markPaid(i.id)}>Mark paid</button>
                    </td>
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

// 2. RECONCILIATION — match bank transactions to invoices
const ReconciliationView = () => {
  const { state, markPaid, toast } = useStore();
  const [matches, setMatches] = React.useState({});
  const txns = [
    { id: 'TX-9821', date: '2026-05-26', amount: 6120000, ref: 'KBZ TR-9821 / INV-0418 / YFG', method: 'KBZ Pay' },
    { id: 'TX-9819', date: '2026-05-22', amount: 5520000, ref: 'AYA Direct / MLC Co. May renewal', method: 'AYA Bank' },
    { id: 'TX-9817', date: '2026-05-21', amount: 2640000, ref: 'KBZ TR-9817 / Sittwe Marine', method: 'KBZ Pay' },
    { id: 'TX-9815', date: '2026-05-18', amount: 1920000, ref: 'CB Bank wire / Pyay Agri', method: 'CB Bank' },
    { id: 'TX-9812', date: '2026-05-15', amount: 480000, ref: 'KBZ TR-9812 / no reference', method: 'KBZ Pay' }, // unmatched
  ];
  const unmatchedInv = state.invoices.filter(i => i.status === 'Pending' || i.status === 'Customer Transferred');

  const match = (txId, invId) => {
    setMatches({ ...matches, [txId]: invId });
    markPaid(invId);
    toast(`Matched ${txId} → ${invId}`, 'ok');
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Payment reconciliation</h1>
          <p className="page-subtitle">Match bank transactions to invoices · {txns.length - Object.keys(matches).length} unmatched</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Bank feed synced — 2 new transactions', 'ok')}><Icon name="refresh" size={13}/>Sync bank feed</button>
        </div>
      </div>

      <div className="grid-asym">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Bank transactions</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Txn</th><th>Date</th><th>Method</th><th>Reference</th><th className="right">Amount</th><th>Match</th></tr></thead>
              <tbody>
                {txns.map(tx => (
                  <tr key={tx.id}>
                    <td className="mono fw-6">{tx.id}</td>
                    <td className="tnum text-sm">{tx.date}</td>
                    <td><span className="pill subtle">{tx.method}</span></td>
                    <td className="text-xs mono" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.ref}</td>
                    <td className="right tnum fw-6">MMK {formatMMK(tx.amount)}</td>
                    <td>
                      {matches[tx.id]
                        ? <span className="pill ok"><Icon name="check" size={10}/>{matches[tx.id]}</span>
                        : (() => {
                            const candidate = unmatchedInv.find(i => i.amount === tx.amount);
                            return candidate
                              ? <button className="btn sm accent" onClick={() => match(tx.id, candidate.id)}>Match {candidate.id}</button>
                              : <span className="pill warn"><span className="dot"/>No match</span>;
                          })()
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Reconciliation summary</h3></div>
          <div className="card-body">
            <div className="flex col gap-3 text-sm">
              <div className="flex between"><span className="text-mute">Bank deposits</span><span className="tnum fw-6">MMK {formatMMK(txns.reduce((a, t) => a + t.amount, 0))}</span></div>
              <div className="flex between"><span className="text-mute">Matched to invoices</span><span className="tnum fw-6" style={{ color: 'var(--ok)' }}>{Object.keys(matches).length} of {txns.length}</span></div>
              <div className="flex between"><span className="text-mute">Unmatched amount</span><span className="tnum fw-6" style={{ color: 'var(--warn)' }}>MMK 480,000</span></div>
              <div className="divider"/>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Open invoices</div>
              {unmatchedInv.slice(0, 4).map(i => {
                const c = state.customers.find(c => c.id === i.customer);
                return (
                  <div key={i.id} className="flex between text-xs">
                    <span>{i.id}<span className="text-mute"> · {c?.company}</span></span>
                    <span className="tnum fw-6">{formatMMK(i.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. RECURRING BILLING
const RecurringView = () => {
  const { state, toast } = useStore();
  const cycles = state.vms.filter(v => v.status === 'Active').map(v => {
    const c = state.customers.find(c => c.id === v.customer);
    return {
      ...v,
      customerName: c?.company,
      nextBill: (() => { const d = new Date(v.expiry); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })(),
      autoRenew: true,
    };
  });

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Recurring billing</h1>
          <p className="page-subtitle">{cycles.length} active subscriptions · MMK {formatMMK(cycles.reduce((a, v) => a + v.priceMonth, 0))} monthly recurring</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Billing schedule exported', 'info')}><Icon name="download" size={13}/>Export schedule</button>
          <button className="btn primary" onClick={() => toast(`Generated ${cycles.length} invoices for next cycle`, 'ok')}><Icon name="refresh" size={13}/>Generate invoices</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">MRR</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.reduce((a, v) => a + v.priceMonth, 0))}</div></div>
        <div className="metric"><div className="label">ARR (projected)</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.reduce((a, v) => a + v.priceMonth, 0) * 12)}</div></div>
        <div className="metric"><div className="label">Auto-renew on</div><div className="value tnum">{cycles.length}</div><div className="trend">All subscriptions</div></div>
        <div className="metric"><div className="label">Next 7 days billing</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.filter(v => { const d = (new Date(v.nextBill) - window.MOCK.TODAY) / 86400000; return d >= 0 && d <= 7; }).reduce((a, v) => a + v.priceMonth, 0))}</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Billing schedule</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>VM</th><th>Customer</th><th className="right">Monthly</th><th>Next bill</th><th>Renewal</th><th>Auto-renew</th><th></th></tr></thead>
            <tbody>
              {cycles.sort((a, b) => new Date(a.nextBill) - new Date(b.nextBill)).map(v => (
                <tr key={v.id}>
                  <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                  <td className="text-sm">{v.customerName}</td>
                  <td className="right tnum">MMK {formatMMK(v.priceMonth)}</td>
                  <td className="tnum text-sm">{v.nextBill}</td>
                  <td className="tnum text-sm">{v.expiry}</td>
                  <td><span className="toggle on"/></td>
                  <td className="right"><button className="btn sm" onClick={() => toast(`Invoice generated for ${v.name}`, 'ok')}>Bill now</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 4. TAX / VAT REPORT
const TaxView = () => {
  const { state } = useStore();
  const totalRev = state.invoices.filter(i => i.status === 'Payment Received').reduce((a, i) => a + i.amount, 0);
  const vatRate = 5;
  const vatCollected = Math.round(totalRev * vatRate / (100 + vatRate));
  const monthly = [
    ['Dec 2025', 8420000, 421000],
    ['Jan 2026', 9180000, 459000],
    ['Feb 2026', 9520000, 476000],
    ['Mar 2026', 10240000, 512000],
    ['Apr 2026', 10960000, 548000],
    ['May 2026', totalRev, vatCollected],
  ];

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tax / VAT report</h1>
          <p className="page-subtitle">Commercial tax tracking · Q2 2026</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Tax report (PDF) downloaded', 'info')}><Icon name="download" size={13}/>PDF report</button>
          <button className="btn" onClick={() => useStore().toast('IRD format file generated', 'info')}><Icon name="download" size={13}/>IRD format</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Q2 revenue</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(totalRev * 3)}</div></div>
        <div className="metric"><div className="label">VAT collected ({vatRate}%)</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(vatCollected * 3)}</div></div>
        <div className="metric"><div className="label">Filing due</div><div className="value tnum" style={{ fontSize: 20 }}>15 Jul</div><div className="trend">Q2 IRD submission</div></div>
        <div className="metric"><div className="label">Status</div><div className="value" style={{ fontSize: 16 }}><span className="pill ok"><span className="dot"/>On track</span></div></div>
      </div>

      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">Monthly breakdown</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Month</th><th className="right">Gross revenue</th><th className="right">Commercial tax (5%)</th><th className="right">Net revenue</th><th>Status</th></tr></thead>
            <tbody>
              {monthly.map(([m, rev, tax]) => (
                <tr key={m}>
                  <td className="fw-6">{m}</td>
                  <td className="right tnum">MMK {formatMMK(rev)}</td>
                  <td className="right tnum">MMK {formatMMK(tax)}</td>
                  <td className="right tnum">MMK {formatMMK(rev - tax)}</td>
                  <td><span className="pill ok"><span className="dot"/>Filed</span></td>
                </tr>
              ))}
              <tr style={{ background: 'var(--surface-2)' }}>
                <td className="fw-7">Total</td>
                <td className="right tnum fw-7">MMK {formatMMK(monthly.reduce((a, m) => a + m[1], 0))}</td>
                <td className="right tnum fw-7">MMK {formatMMK(monthly.reduce((a, m) => a + m[2], 0))}</td>
                <td className="right tnum fw-7">MMK {formatMMK(monthly.reduce((a, m) => a + m[1] - m[2], 0))}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Filing checklist · Q2 2026</h3></div>
        <div className="card-body">
          {[
            ['April invoices reconciled', true],
            ['May invoices reconciled', true],
            ['June invoices reconciled', false],
            ['Commercial tax form drafted', false],
            ['IRD portal submission', false],
            ['Payment to treasury', false],
          ].map(([l, done], i) => (
            <div key={i} className="flex center gap-2" style={{ padding: '6px 0' }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: done ? 'var(--ok)' : 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'white' }}>
                {done && <Icon name="check" size={11}/>}
              </span>
              <span className="text-sm" style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--ink-3)' : 'var(--ink)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PipelineView, QuotesView, FollowupsView, TrialsView, AgingView, ReconciliationView, RecurringView, TaxView });
