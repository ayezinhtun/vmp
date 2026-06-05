// Customers list + drawer + KYC view — store-wired

const CustomersView = ({ openCust, openModal }) => {
  const { state, updateCustomer } = useStore();
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [menu, setMenu] = React.useState(null);

  const filters = [
    { id: 'all', label: 'All customers', count: state.customers.length },
    { id: 'Active', label: 'Active', count: state.customers.filter(c => c.status === 'Active').length },
    { id: 'Pending', label: 'KYC pending', count: state.customers.filter(c => c.kyc === 'Pending').length },
    { id: 'Rejected', label: 'KYC rejected', count: state.customers.filter(c => c.kyc === 'Rejected').length },
    { id: 'Inactive', label: 'Inactive', count: state.customers.filter(c => c.status === 'Inactive').length },
  ];

  const filtered = state.customers.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'Pending' || filter === 'Rejected') return c.kyc === filter;
    return c.status === filter;
  }).filter(c => {
    if (!search) return true;
    return [c.id, c.name, c.company, c.email, c.phone].join(' ').toLowerCase().includes(search.toLowerCase());
  });

  React.useEffect(() => {
    const close = () => setMenu(null);
    if (menu) { window.addEventListener('click', close); return () => window.removeEventListener('click', close); }
  }, [menu]);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{state.customers.length} accounts · {state.customers.filter(c => c.kyc === 'Pending').length} pending KYC</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Customers CSV download started', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => openModal('newcust')}><Icon name="plus" size={13}/>New customer</button>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          {filters.map(f => (
            <button key={f.id} className={`filter-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}<span className="ct">{f.count}</span>
            </button>
          ))}
          <div style={{ flex: 1 }}/>
          <div className="search" style={{ width: 220 }}>
            <Icon name="search" size={13} className="search-icon"/>
            <input placeholder="Name, company, email…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Company</th>
              <th>KYC</th>
              <th>Status</th>
              <th className="right">Active VMs</th>
              <th className="right">Total spend</th>
              <th>Sales</th>
              <th>Since</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const vmCount = state.vms.filter(v => v.customer === c.id && v.status === 'Active').length;
              return (
                <tr key={c.id} onClick={() => openCust(c.id)}>
                  <td>
                    <div className="flex center gap-2">
                      <Avatar name={c.name} size={28}/>
                      <div><div className="fw-6">{c.name}</div><div className="text-xs text-mute mono">{c.id}</div></div>
                    </div>
                  </td>
                  <td><div className="fw-6 text-sm">{c.company}</div><div className="text-xs text-mute">{c.email}</div></td>
                  <td><StatusPill status={c.kyc}/></td>
                  <td><StatusPill status={c.status}/></td>
                  <td className="right tnum">{vmCount}</td>
                  <td className="right tnum">MMK {formatMMK(c.totalSpend)}</td>
                  <td className="text-sm">{c.salesperson}</td>
                  <td className="tnum text-sm">{c.since}</td>
                  <td onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setMenu(menu === c.id ? null : c.id); }}><Icon name="more"/></button>
                    {menu === c.id && (
                      <div onClick={e => e.stopPropagation()} style={{
                        position: 'absolute', right: 14, top: 36, zIndex: 20,
                        background: 'var(--surface)', border: '1px solid var(--line)',
                        borderRadius: 8, boxShadow: 'var(--shadow)', minWidth: 180, padding: 4,
                      }}>
                        <button className="nav-item" onClick={() => { openCust(c.id); setMenu(null); }}><Icon name="eye" size={13}/>View profile</button>
                        <button className="nav-item" onClick={() => { openModal('email', { to: c.email }); setMenu(null); }}><Icon name="mail" size={13}/>Send email</button>
                        <button className="nav-item" onClick={() => { openModal('newvm', { customer: c.id }); setMenu(null); }}><Icon name="plus" size={13}/>New VM</button>
                        {c.status === 'Active'
                          ? <button className="nav-item" onClick={() => { updateCustomer(c.id, { status: 'Inactive' }); setMenu(null); }}><Icon name="pause" size={13}/>Deactivate</button>
                          : <button className="nav-item" onClick={() => { updateCustomer(c.id, { status: 'Active' }); setMenu(null); }}><Icon name="play" size={13}/>Activate</button>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CustomerDrawer = ({ custId, onClose, openVM, openModal }) => {
  const { state, updateCustomer } = useStore();
  const c = state.customers.find(c => c.id === custId);
  if (!c) return null;
  const vms = state.vms.filter(v => v.customer === custId);
  const invs = state.invoices.filter(i => i.customer === custId);
  const [tab, setTab] = React.useState('overview');
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(c);

  React.useEffect(() => { setDraft(c); }, [custId]);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="flex center between mb-2">
            <span className="mono text-sm text-mute">{c.id}</span>
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
          </div>
          <div className="flex center gap-3">
            <Avatar name={c.name} size={48}/>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.name}</h2>
              <div className="text-sm text-mute">{c.company} · {c.email} · {c.phone}</div>
              <div className="flex gap-2 mt-2">
                <StatusPill status={c.kyc}/>
                <StatusPill status={c.status}/>
                <span className="pill subtle">Sales: {c.salesperson}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => openModal('email', { to: c.email })}><Icon name="mail" size={12}/>Email</button>
              <button className="btn primary" onClick={() => openModal('newvm', { customer: c.id })}><Icon name="plus" size={12}/>New VM</button>
            </div>
          </div>
        </div>

        <div className="tabs">
          {['overview','vms','kyc','billing','comms'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Overview' : t === 'vms' ? 'VMs' : t === 'kyc' ? 'KYC' : t === 'billing' ? 'Billing' : 'Communication'}
              {t === 'vms' && <span className="count">{vms.length}</span>}
              {t === 'billing' && <span className="count">{invs.length}</span>}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {tab === 'overview' && (
            <div className="flex col gap-4">
              <div className="grid-3">
                <div className="metric"><div className="label">Lifetime value</div><div className="value tnum" style={{ fontSize: 22 }}>MMK {formatMMK(c.totalSpend)}</div></div>
                <div className="metric"><div className="label">Active VMs</div><div className="value tnum" style={{ fontSize: 22 }}>{vms.filter(v => v.status === 'Active').length}</div></div>
                <div className="metric"><div className="label">Open invoices</div><div className="value tnum" style={{ fontSize: 22 }}>{invs.filter(i => i.status !== 'Payment Received').length}</div></div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Account details</h3>
                  {!editing
                    ? <button className="btn sm" onClick={() => setEditing(true)}><Icon name="edit" size={11}/>Edit</button>
                    : <div className="flex gap-2">
                        <button className="btn sm ghost" onClick={() => { setDraft(c); setEditing(false); }}>Cancel</button>
                        <button className="btn sm accent" onClick={() => { updateCustomer(c.id, draft); setEditing(false); }}><Icon name="check" size={11}/>Save</button>
                      </div>
                  }
                </div>
                <div className="card-body">
                  {!editing ? (
                    <dl className="dl">
                      <dt>Customer ID</dt><dd className="mono">{c.id}</dd>
                      <dt>Company</dt><dd>{c.company}</dd>
                      <dt>Contact name</dt><dd>{c.name}</dd>
                      <dt>Email</dt><dd>{c.email}</dd>
                      <dt>Phone</dt><dd className="mono">{c.phone}</dd>
                      <dt>Customer since</dt><dd className="tnum">{c.since}</dd>
                      <dt>Salesperson</dt><dd>{c.salesperson}</dd>
                      <dt>Portal access</dt><dd>{c.kyc === 'Approved' ? <span className="pill ok"><span className="dot"/>Enabled</span> : <span className="pill bad"><span className="dot"/>Blocked</span>}</dd>
                    </dl>
                  ) : (
                    <div className="flex col gap-3">
                      <div className="grid-2" style={{ gap: 12 }}>
                        <div className="field"><label>Contact name</label><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}/></div>
                        <div className="field"><label>Company</label><input value={draft.company} onChange={e => setDraft({ ...draft, company: e.target.value })}/></div>
                      </div>
                      <div className="grid-2" style={{ gap: 12 }}>
                        <div className="field"><label>Email</label><input value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })}/></div>
                        <div className="field"><label>Phone</label><input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })}/></div>
                      </div>
                      <div className="field"><label>Salesperson</label>
                        <select value={draft.salesperson} onChange={e => setDraft({ ...draft, salesperson: e.target.value })}>
                          {state.team.filter(t => t.role === 'Sales').map(t => <option key={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Internal notes</h3></div>
                <div className="card-body">
                  <textarea rows="3" defaultValue={c.notes} placeholder="Notes only visible to admin team…" onBlur={e => updateCustomer(c.id, { notes: e.target.value })}/>
                </div>
              </div>
            </div>
          )}

          {tab === 'vms' && (
            <div className="card">
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>VM</th><th>Status</th><th>Spec</th><th>Expires</th></tr></thead>
                  <tbody>
                    {vms.map(v => (
                      <tr key={v.id} onClick={() => openVM(v.id)}>
                        <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                        <td><StatusPill status={v.status}/></td>
                        <td className="mono text-xs">{v.vcpu}c · {v.ram}GB · {v.storage}GB</td>
                        <td><ExpiryCell date={v.expiry}/></td>
                      </tr>
                    ))}
                    {vms.length === 0 && <tr><td colSpan="4"><div className="empty"><div className="sub">No VMs yet for this customer.</div></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'kyc' && (
            <div className="flex col gap-4">
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">KYC submission</h3>
                  <StatusPill status={c.kyc}/>
                </div>
                <div className="card-body">
                  <dl className="dl">
                    <dt>Status</dt><dd><StatusPill status={c.kyc}/></dd>
                    <dt>Submitted</dt><dd className="tnum">{c.since}</dd>
                    <dt>Documents</dt><dd>
                      <div className="flex gap-2">
                        <span className="pill subtle"><Icon name="file" size={10}/>NRC front</span>
                        <span className="pill subtle"><Icon name="file" size={10}/>NRC back</span>
                        <span className="pill subtle"><Icon name="file" size={10}/>Co. registration</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="flex gap-2">
                    <button className="btn" onClick={() => openModal('kycdocs', { customer: c })}><Icon name="eye" size={12}/>View documents</button>
                    {c.kyc === 'Pending' && <>
                      <button className="btn accent" onClick={() => useStore().setKYC && openModal('kycdocs', { customer: c })}><Icon name="check" size={12}/>Approve</button>
                      <button className="btn" onClick={() => useStore().toast(`Re-upload request emailed to ${c.email}`, 'info')}><Icon name="refresh" size={12}/>Request re-upload</button>
                      <button className="btn danger" onClick={() => openModal('kycdocs', { customer: c })}><Icon name="x" size={12}/>Reject</button>
                    </>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="card">
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Invoice</th><th>Issued</th><th className="right">Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {invs.map(i => (
                      <tr key={i.id}>
                        <td className="mono">{i.id}</td>
                        <td className="tnum text-sm">{i.issued}</td>
                        <td className="right tnum fw-6">MMK {formatMMK(i.amount)}</td>
                        <td><StatusPill status={i.status}/></td>
                      </tr>
                    ))}
                    {invs.length === 0 && <tr><td colSpan="4"><div className="empty"><div className="sub">No invoices yet.</div></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'comms' && (
            <div className="card">
              <div className="card-head">
                <h3 className="card-title">Communication history</h3>
                <button className="btn sm" onClick={() => openModal('email', { to: c.email })}><Icon name="mail" size={11}/>Send email</button>
              </div>
              <div className="card-body" style={{ padding: '6px 18px' }}>
                {[
                  ['2026-05-26 14:08', 'system', 'Email sent', 'KYC re-upload request — document was blurry.'],
                  ['2026-05-22 10:30', 'Su Su', 'Note', 'Called customer to walk through KYC form.'],
                  ['2026-05-22 09:45', 'system', 'Email sent', 'Welcome email + KYC form link.'],
                  ['2026-05-22 09:42', 'system', 'Account created', 'Customer signed up via website.'],
                ].map((a, i) => (
                  <div key={i} className="feed-item">
                    <span className="dot customer"/>
                    <div className="body"><span className="fw-6 text-sm">{a[2]}</span> — {a[3]}<div className="meta">{a[1]} · {a[0]}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KYCView = ({ openCust, openModal }) => {
  const { state, setKYC, toast } = useStore();
  const [tab, setTab] = React.useState('Pending');
  const [selected, setSelected] = React.useState(null);
  const [note, setNote] = React.useState('');

  const pending = state.customers.filter(c => c.kyc === 'Pending');
  const approved = state.customers.filter(c => c.kyc === 'Approved');
  const rejected = state.customers.filter(c => c.kyc === 'Rejected');

  const list = tab === 'Pending' ? pending : tab === 'Approved' ? approved : tab === 'Rejected' ? rejected : state.customers;

  // auto-select first pending on first render
  React.useEffect(() => {
    if (!selected && list.length) setSelected(list[0]);
    if (selected && !list.find(c => c.id === selected.id)) setSelected(list[0] || null);
  }, [tab, list.length]);

  const sel = selected ? state.customers.find(c => c.id === selected.id) : null;

  const decide = (id, decision) => {
    setKYC(id, decision);
    setNote('');
  };

  const docs = [
    { name: 'NRC — front', sub: 'PDF · 2.4 MB', tone: 'oklch(0.6 0.16 30)' },
    { name: 'NRC — back', sub: 'PDF · 2.1 MB', tone: 'oklch(0.55 0.16 230)' },
    { name: 'Company registration', sub: 'PDF · 1.1 MB', tone: 'oklch(0.55 0.17 285)' },
    { name: 'Director ID / selfie', sub: 'JPG · 840 KB', tone: 'var(--ok)' },
  ];

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">KYC review</h1>
          <p className="page-subtitle">{pending.length} awaiting review · avg. response time 4.2 hours · {approved.length} approved this period</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('KYC report exported', 'info')}><Icon name="download" size={13}/>Export</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-4">
        {[
          { label: 'Awaiting review', value: pending.length, color: 'oklch(0.55 0.16 75)', icon: 'clock' },
          { label: 'Approved', value: approved.length, color: 'var(--ok)', icon: 'check' },
          { label: 'Rejected', value: rejected.length, color: 'var(--bad)', icon: 'x' },
          { label: 'Total customers', value: state.customers.length, color: 'var(--accent)', icon: 'users' },
        ].map(s => (
          <div key={s.label} className="metric">
            <div className="label flex center gap-2">
              <span style={{ width: 24, height: 24, borderRadius: 7, background: `${s.color}1a`, color: s.color, display: 'grid', placeItems: 'center' }}><Icon name={s.icon} size={13}/></span>
              {s.label}
            </div>
            <div className="value tnum" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-asym" style={{ alignItems: 'flex-start' }}>
        {/* Master list */}
        <div className="card">
          <div className="tabs">
            {['Pending', 'Approved', 'Rejected'].map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}<span className="count">{t === 'Pending' ? pending.length : t === 'Approved' ? approved.length : rejected.length}</span>
              </button>
            ))}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {list.map(c => (
              <div key={c.id} onClick={() => setSelected(c)} style={{
                padding: '14px 18px', borderBottom: '1px solid var(--line)',
                display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer',
                background: sel?.id === c.id ? 'var(--accent-soft)' : 'transparent',
                transition: 'background 0.12s',
              }}>
                <Avatar name={c.name} size={38}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fw-6 text-sm">{c.name}</div>
                  <div className="text-xs text-mute" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company} · {c.id}</div>
                </div>
                <StatusPill status={c.kyc}/>
              </div>
            ))}
            {list.length === 0 && <div className="empty"><div className="title">All caught up</div><div className="sub">No {tab.toLowerCase()} submissions.</div></div>}
          </div>
        </div>

        {/* Detail / review panel */}
        <div className="card" style={{ position: 'sticky', top: 16 }}>
          {sel ? (
            <>
              <div className="card-head">
                <h3 className="card-title">Review submission</h3>
                <StatusPill status={sel.kyc}/>
              </div>
              <div className="card-body">
                {/* Applicant */}
                <div className="flex center gap-3 mb-3">
                  <Avatar name={sel.name} size={46}/>
                  <div style={{ flex: 1 }}>
                    <div className="fw-7" style={{ fontSize: 15 }}>{sel.name}</div>
                    <div className="text-xs text-mute">{sel.company}</div>
                  </div>
                  <button className="btn sm" onClick={() => openCust(sel.id)}><Icon name="external" size={11}/>Profile</button>
                </div>
                <dl className="dl">
                  <dt>Customer ID</dt><dd className="mono">{sel.id}</dd>
                  <dt>Email</dt><dd className="text-sm">{sel.email}</dd>
                  <dt>Phone</dt><dd className="mono text-sm">{sel.phone}</dd>
                  <dt>Type</dt><dd>{sel.kind === 'org' || ['Co','Ltd','Group','Holdings'].some(w => (sel.company || '').includes(w)) ? 'Organization' : 'Individual'}</dd>
                  <dt>Submitted</dt><dd className="tnum">{sel.since}</dd>
                </dl>

                <div className="divider"/>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Submitted documents</div>
                <div className="grid-2" style={{ gap: 8 }}>
                  {docs.map(d => (
                    <div key={d.name} onClick={() => toast(`Opening ${d.name}…`, 'info')} style={{
                      border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    }}>
                      <div style={{ height: 56, background: `${d.tone}14`, display: 'grid', placeItems: 'center', color: d.tone }}>
                        <Icon name="file" size={20}/>
                      </div>
                      <div style={{ padding: '7px 9px' }}>
                        <div className="fw-6" style={{ fontSize: 11.5 }}>{d.name}</div>
                        <div className="text-xs text-mute">{d.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {sel.kyc === 'Pending' && (
                  <>
                    <div className="divider"/>
                    <div className="field">
                      <label>Reviewer note</label>
                      <textarea rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note recorded with your decision…"/>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="btn accent" style={{ flex: 1 }} onClick={() => decide(sel.id, 'Approved')}><Icon name="check" size={12}/>Approve</button>
                      <button className="btn" onClick={() => { toast(`Re-upload requested from ${sel.email}`, 'info'); setNote(''); }}><Icon name="refresh" size={12}/>Re-upload</button>
                      <button className="btn danger" onClick={() => decide(sel.id, 'Rejected')}><Icon name="x" size={12}/>Reject</button>
                    </div>
                  </>
                )}
                {sel.kyc !== 'Pending' && (
                  <>
                    <div className="divider"/>
                    <div style={{ padding: 12, background: sel.kyc === 'Approved' ? 'var(--ok-soft)' : 'var(--bad-soft)', borderRadius: 8, fontSize: 12, color: sel.kyc === 'Approved' ? 'var(--ok)' : 'var(--bad)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Icon name={sel.kyc === 'Approved' ? 'check' : 'x'} size={14}/>
                      <div>KYC <strong>{sel.kyc.toLowerCase()}</strong> · reviewed by Min Khant</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {sel.kyc === 'Rejected' && <button className="btn accent" style={{ flex: 1 }} onClick={() => decide(sel.id, 'Approved')}><Icon name="check" size={12}/>Override → Approve</button>}
                      {sel.kyc === 'Approved' && <button className="btn" style={{ flex: 1 }} onClick={() => decide(sel.id, 'Pending')}><Icon name="refresh" size={12}/>Re-open review</button>}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: '60px 20px' }}>
              <div className="title">No submission selected</div>
              <div className="sub">Pick a customer from the list to review their KYC.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CustomersView, CustomerDrawer, KYCView });
