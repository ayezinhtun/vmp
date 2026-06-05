// Dashboard view — store-wired

const Dashboard = ({ openVM, setView, openModal }) => {
  const { state } = useStore();
  const { customers, vms, invoices, activity } = state;
  const TODAY = window.MOCK.TODAY;

  const activeVMs = vms.filter(v => v.status === 'Active').length;
  const expiringSoon = vms.filter(v => {
    if (!v.expiry || v.expiry === '—') return false;
    const d = Math.ceil((new Date(v.expiry) - TODAY) / 86400000);
    return d >= 0 && d <= 7;
  });
  const overdue = invoices.filter(i => i.status === 'Overdue').length;
  const pendingKYC = customers.filter(c => c.kyc === 'Pending').length;
  const mrr = vms.filter(v => v.status === 'Active').reduce((a, v) => a + v.priceMonth, 0);
  const overdueValue = invoices.filter(i => i.status === 'Overdue').reduce((a, i) => a + i.amount, 0);
  const pendingTasks = state.tasks.filter(t => t.status === 'Pending').length;

  const statusDonut = [
    { label: 'Active', value: vms.filter(v => v.status === 'Active').length, color: 'oklch(0.62 0.13 155)' },
    { label: 'Pending', value: vms.filter(v => v.status === 'Pending').length, color: 'oklch(0.72 0.14 75)' },
    { label: 'Suspended', value: vms.filter(v => v.status === 'Suspended').length, color: 'oklch(0.6 0.18 25)' },
    { label: 'Expired', value: vms.filter(v => v.status === 'Expired').length, color: 'oklch(0.55 0.01 80)' },
  ];

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Good morning, Min Khant</h1>
          <p className="page-subtitle">Wednesday, 27 May 2026 — here's what needs attention today.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => openModal('newvm')}><Icon name="plus" size={13}/>New VM</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric">
          <div className="label"><Icon name="server" size={13}/> Active VMs</div>
          <div className="value tnum">{activeVMs}</div>
          <div className="trend"><span className="up">+3</span> this week · {vms.length} total</div>
        </div>
        <div className="metric">
          <div className="label"><Icon name="clock" size={13}/> Expiring ≤ 7 days</div>
          <div className="value tnum" style={{ color: 'oklch(0.55 0.16 75)' }}>{expiringSoon.length}</div>
          <div className="trend">{expiringSoon.length > 0 ? `${expiringSoon.length} need follow-up` : 'all clear'}</div>
        </div>
        <div className="metric">
          <div className="label"><Icon name="invoice" size={13}/> Overdue payments</div>
          <div className="value tnum" style={{ color: 'var(--bad)' }}>{overdue}</div>
          <div className="trend">MMK {formatMMK(overdueValue)} outstanding</div>
        </div>
        <div className="metric">
          <div className="label"><Icon name="arrow-up" size={13}/> Monthly recurring</div>
          <div className="value tnum">MMK {formatMMK(mrr)}</div>
          <div className="trend"><span className="up">+8.4%</span> vs last month</div>
        </div>
      </div>

      <div className="grid-asym mb-4">
        <div className="card">
          <div className="card-head">
            <div>
              <h2 className="card-title">Expiring soon</h2>
              <div className="card-sub">VMs needing renewal action in the next 7 days</div>
            </div>
            <button className="btn sm" onClick={() => setView('vms')}>View all<Icon name="chevron-right" size={12}/></button>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead>
                <tr>
                  <th>VM</th><th>Customer</th><th>Expires</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {expiringSoon.slice(0, 6).map(v => {
                  const c = customers.find(c => c.id === v.customer);
                  return (
                    <tr key={v.id} onClick={() => openVM(v.id)}>
                      <td>
                        <div className="fw-6">{v.name}</div>
                        <div className="text-xs text-mute mono">{v.id}</div>
                      </td>
                      <td>{c?.company}</td>
                      <td><ExpiryCell date={v.expiry}/></td>
                      <td><StatusPill status={v.status}/></td>
                      <td className="right" onClick={e => e.stopPropagation()}>
                        <button className="btn sm" onClick={() => openModal('renew', { vm: v })}>Renew</button>
                      </td>
                    </tr>
                  );
                })}
                {expiringSoon.length === 0 && <tr><td colSpan="5"><div className="empty"><div className="title">Nothing expiring soon</div><div className="sub">No VMs need renewal in the next 7 days.</div></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">VM status</h2>
            </div>
            <div className="card-body">
              <div className="flex center gap-4">
                <div style={{ position: 'relative' }}>
                  <Donut segments={statusDonut} size={120} thickness={16}/>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                    <div>
                      <div className="tnum" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{vms.length}</div>
                      <div className="text-xs text-mute">total</div>
                    </div>
                  </div>
                </div>
                <div className="flex col" style={{ gap: 8, flex: 1 }}>
                  {statusDonut.map(s => (
                    <div key={s.label} className="flex center between">
                      <div className="flex center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}/>
                        <span className="text-sm">{s.label}</span>
                      </div>
                      <span className="tnum fw-6 text-sm">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2 className="card-title">Pending actions</h2></div>
            <div className="card-body" style={{ padding: '0' }}>
              {pendingKYC > 0 && (
                <div className="feed-item" style={{ padding: '12px 18px' }}>
                  <span className="dot alert"/>
                  <div className="body">
                    <span className="fw-6">{pendingKYC} KYC submission{pendingKYC > 1 ? 's' : ''}</span> awaiting review
                  </div>
                  <button className="btn sm" onClick={() => setView('kyc')}>Review</button>
                </div>
              )}
              {pendingTasks > 0 && (
                <div className="feed-item" style={{ padding: '12px 18px' }}>
                  <span className="dot task"/>
                  <div className="body">
                    <span className="fw-6">{pendingTasks} provisioning task{pendingTasks > 1 ? 's' : ''}</span> waiting to start
                  </div>
                  <button className="btn sm" onClick={() => setView('tasks')}>Open</button>
                </div>
              )}
              {overdue > 0 && (
                <div className="feed-item" style={{ padding: '12px 18px' }}>
                  <span className="dot finance"/>
                  <div className="body">
                    <span className="fw-6">{overdue} invoice{overdue > 1 ? 's' : ''}</span> overdue
                    <div className="meta">MMK {formatMMK(overdueValue)} outstanding</div>
                  </div>
                  <button className="btn sm" onClick={() => setView('finance')}>View</button>
                </div>
              )}
              {pendingKYC === 0 && pendingTasks === 0 && overdue === 0 && (
                <div className="empty"><div className="title">All caught up</div><div className="sub">No actions needed right now.</div></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-asym">
        <div className="card">
          <div className="card-head">
            <div>
              <h2 className="card-title">Revenue · last 12 months</h2>
              <div className="card-sub">Monthly recurring + new sales · MMK millions</div>
            </div>
            <div className="flex gap-2">
              <span className="pill accent"><span className="dot"></span>MRR</span>
              <span className="pill"><span className="dot"></span>New sales</span>
            </div>
          </div>
          <div className="card-body">
            <div className="flex" style={{ alignItems: 'flex-end', gap: 6, height: 180 }}>
              {[6.2, 6.8, 7.1, 7.4, 7.8, 8.2, 8.5, 9.1, 9.3, 9.8, 10.4, 11.2].map((mrrV, i) => {
                const newSales = [1.2, 1.4, 0.8, 1.9, 1.1, 2.4, 1.6, 2.1, 1.8, 2.8, 1.5, 3.1][i];
                const maxH = 12;
                return (
                  <div key={i} className="flex col gap-1" style={{ flex: 1, alignItems: 'center' }}>
                    <div className="flex" style={{ width: '100%', alignItems: 'flex-end', height: '100%', gap: 2 }}>
                      <div style={{ flex: 1, height: `${(mrrV/maxH)*100}%`, background: 'var(--accent)', borderRadius: '3px 3px 0 0' }}/>
                      <div style={{ flex: 1, height: `${(newSales/maxH)*100}%`, background: 'var(--accent-soft)', borderRadius: '3px 3px 0 0' }}/>
                    </div>
                    <div className="text-xs text-mute-2">{['J','J','A','S','O','N','D','J','F','M','A','M'][i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Recent activity</h2>
            <button className="btn ghost sm" onClick={() => setView('activity')}>All<Icon name="chevron-right" size={12}/></button>
          </div>
          <div className="card-body" style={{ padding: '6px 18px' }}>
            {activity.slice(0, 6).map((a, i) => (
              <div key={i} className="feed-item">
                <span className={`dot ${a.kind}`}/>
                <div className="body">
                  {a.text}
                  <div className="meta">{a.actor} · {a.ts.split(' ')[1] || a.ts}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
