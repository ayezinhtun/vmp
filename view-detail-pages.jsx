// My Request detail page (customer side) + Invoice detail page (customer side)
// + Sales-side provisioning detail with disabled customer fields

// ── Customer: My Request detail ───────────────────────────────────────────
const CustomerRequestDetail = ({ request: initial, onClose }) => {
  const { state, toast } = useStore();
  const t = state.tasks.find(x => x.id === initial.id) || initial;
  const c = state.customers.find(c => c.id === t.customer);

  // Parse notes block into key-value pairs
  const notesLines = (t.notes || '').split('\n').filter(Boolean);
  const meta = {};
  notesLines.forEach(l => {
    const m = l.match(/^(\w[\w\s]*?):\s*(.+)$/);
    if (m) meta[m[1].trim()] = m[2].trim();
  });

  const timeline = [
    { ts: t.created, who: c?.name || 'You', event: 'Request submitted', kind: 'customer' },
    t.assignee !== '—' ? { ts: t.created, who: 'System', event: `Assigned to ${t.assignee}`, kind: 'task' } : null,
    t.status === 'In Progress' ? { ts: t.created, who: t.assignee, event: 'Moved to In Progress', kind: 'task' } : null,
    t.status === 'Done' ? { ts: t.created, who: t.assignee, event: 'Completed', kind: 'task' } : null,
    t.status === 'Blocked' ? { ts: t.created, who: t.assignee, event: 'Blocked — additional info needed', kind: 'alert' } : null,
  ].filter(Boolean);

  return (
    <div className="content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to requests</button>
            <span className="mono text-xs text-mute">{t.id}</span>
          </div>
          <h1 className="page-title">{t.title}</h1>
          <div className="flex gap-2 mt-2">
            <StatusPill status={t.status}/>
            <span className="pill subtle">{t.type}</span>
            {t.priority === 'Urgent' && <span className="pill bad"><span className="dot"/>Urgent</span>}
            <span className="pill accent"><span className="dot"/>Submitted {t.created}</span>
          </div>
        </div>
      </div>

      <div className="grid-asym" style={{ gap: 24 }}>
        <div className="flex col" style={{ gap: 16 }}>
          {/* Configuration submitted */}
          <div className="card">
            <div className="card-head"><h3 className="card-title">Configuration submitted</h3></div>
            <div className="card-body">
              <dl className="dl">
                {Object.entries(meta).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt>{k}</dt>
                    <dd className={/Hostname|Spec|Plan|OS|Region/i.test(k) ? 'mono' : ''}>{v}</dd>
                  </React.Fragment>
                ))}
                {Object.keys(meta).length === 0 && <>
                  <dt>Notes</dt><dd className="text-mute">{t.notes || 'No additional notes.'}</dd>
                </>}
              </dl>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-head"><h3 className="card-title">Timeline</h3></div>
            <div className="card-body" style={{ padding: '6px 18px' }}>
              {timeline.map((e, i) => (
                <div key={i} className="feed-item">
                  <span className={`dot ${e.kind}`}/>
                  <div className="body">
                    <span className="fw-6">{e.event}</span>
                    <div className="meta">{e.who} · {e.ts}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation thread (synced with sales) */}
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Conversation with {t.assignee !== '—' ? t.assignee : 'Sales'}</h3>
              <span className="pill subtle"><Icon name="mail" size={10}/>Synced</span>
            </div>
            <div className="card-body">
              <div className="text-sm text-mute" style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 8 }}>
                Use the <strong>Support tickets</strong> section to start a thread about this request, or contact <strong>{t.assignee !== '—' ? t.assignee : c?.salesperson}</strong> directly.
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn primary" onClick={() => toast('Open Support tickets to start a conversation', 'info')}><Icon name="mail" size={12}/>Message {t.assignee !== '—' ? t.assignee : 'Sales'}</button>
                <button className="btn" onClick={() => toast('Email sent', 'info')}><Icon name="mail" size={12}/>Email</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Status</h3></div>
            <div className="card-body">
              <div style={{ padding: 14, background: t.status === 'Done' ? 'var(--ok-soft)' : t.status === 'Blocked' ? 'var(--bad-soft)' : 'var(--accent-soft)', borderRadius: 8 }}>
                <div className="fw-7" style={{ color: t.status === 'Done' ? 'var(--ok)' : t.status === 'Blocked' ? 'var(--bad)' : 'var(--accent-strong)' }}>{t.status}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>
                  {t.status === 'Pending' && 'Awaiting review by Sales. Typical response: within 1 business day.'}
                  {t.status === 'In Progress' && 'Sales is working on your request. They\'ll reach out shortly.'}
                  {t.status === 'Blocked' && 'We need more info — check your email or Support tickets.'}
                  {t.status === 'Done' && 'Your request was completed. Check My VMs.'}
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Account manager</h3></div>
            <div className="card-body">
              {t.assignee !== '—' ? (
                <>
                  <div className="flex center gap-3">
                    <Avatar name={t.assignee} size={42}/>
                    <div>
                      <div className="fw-7">{t.assignee}</div>
                      <div className="text-xs text-mute">{t.team}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="btn sm w-full" onClick={() => toast('Calling…', 'info')}><Icon name="external" size={11}/>Call</button>
                    <button className="btn sm w-full" onClick={() => toast('Email composer opened', 'info')}><Icon name="mail" size={11}/>Email</button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-mute">No account manager assigned yet — Sales will assign one shortly.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

// ── Customer: Invoice detail ──────────────────────────────────────────────
const CustomerInvoiceDetail = ({ invoice: initial, onClose }) => {
  const { state, toast } = useStore();
  const inv = state.invoices.find(i => i.id === initial.id) || initial;
  const c = state.customers.find(c => c.id === inv.customer);
  const vms = state.vms.filter(v => inv.vms.includes(v.id));
  const baseMonthly = vms.reduce((a, v) => a + v.priceMonth, 0);
  const months = baseMonthly > 0 ? Math.max(1, Math.round(inv.amount / baseMonthly)) : 1;

  return (
    <div className="content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to invoices</button>
            <span className="mono text-xs text-mute">{inv.id}</span>
          </div>
          <h1 className="page-title">Invoice {inv.id}</h1>
          <div className="flex gap-2 mt-2">
            <StatusPill status={inv.status}/>
            <span className="pill subtle">Issued {inv.issued}</span>
            <span className="pill subtle">Due {inv.due}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast(`Downloaded ${inv.id}.pdf`, 'info')}><Icon name="download" size={12}/>PDF</button>
          <button className="btn" onClick={() => window.print && window.print()}><Icon name="file" size={12}/>Print</button>
          {inv.status !== 'Payment Received' && (
            <button className="btn accent" onClick={() => toast('Payment instructions emailed', 'ok')}><Icon name="check" size={12}/>Pay now</button>
          )}
        </div>
      </div>

      <div className="grid-asym" style={{ gap: 24 }}>
        <div className="flex col" style={{ gap: 16 }}>
          {/* Invoice paper */}
          <div className="card">
            <div className="card-body" style={{ padding: 28 }}>
              <div className="flex between mb-4">
                <div>
                  <div className="brand-mark" style={{ width: 40, height: 40, fontSize: 18, marginBottom: 8 }}>V</div>
                  <div className="fw-7" style={{ fontSize: 14 }}>VPS Myanmar Co., Ltd</div>
                  <div className="text-xs text-mute">No. 142, Strand Road, Yangon</div>
                  <div className="text-xs text-mute">accounts@vpsmm.co · +95 1 2345 678</div>
                </div>
                <div className="right">
                  <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Invoice</div>
                  <div className="mono fw-7" style={{ fontSize: 14 }}>{inv.id}</div>
                  <div className="text-xs text-mute mt-2">Currency: {inv.currency}</div>
                </div>
              </div>

              <div className="grid-2 mb-4" style={{ gap: 16 }}>
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 6 }}>
                  <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Billed to</div>
                  <div className="fw-7 text-sm">{c?.company}</div>
                  <div className="text-xs text-mute">{c?.name}</div>
                  <div className="text-xs text-mute">{c?.email}</div>
                  <div className="text-xs text-mute mono">{c?.id}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 6 }}>
                  <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Payment terms</div>
                  <div className="text-sm"><span className="text-mute">Issued:</span> <span className="fw-6 tnum">{inv.issued}</span></div>
                  <div className="text-sm"><span className="text-mute">Due date:</span> <span className="fw-6 tnum">{inv.due}</span></div>
                  <div className="text-sm"><span className="text-mute">Method:</span> <span className="fw-6">{inv.method}</span></div>
                  {inv.receipt !== '—' && <div className="text-sm"><span className="text-mute">Receipt #:</span> <span className="mono fw-6">{inv.receipt}</span></div>}
                </div>
              </div>

              <table className="tbl" style={{ marginBottom: 16 }}>
                <thead>
                  <tr><th>Service</th><th>VM</th><th className="right">Months</th><th className="right">Unit / mo</th><th className="right">Total</th></tr>
                </thead>
                <tbody>
                  {vms.map(v => (
                    <tr key={v.id}>
                      <td>
                        <div className="fw-6">{v.name}</div>
                        <div className="text-xs text-mute">{v.vcpu} vCPU · {v.ram}GB RAM · {v.storage}GB SSD · {v.os}</div>
                      </td>
                      <td className="mono text-xs">{v.id}</td>
                      <td className="right tnum">{months}</td>
                      <td className="right tnum">MMK {formatMMK(v.priceMonth)}</td>
                      <td className="right tnum fw-6">MMK {formatMMK(v.priceMonth * months)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex" style={{ justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 280 }}>
                  <div className="flex between" style={{ padding: '6px 0' }}>
                    <span className="text-mute">Subtotal</span>
                    <span className="tnum">MMK {formatMMK(inv.amount)}</span>
                  </div>
                  <div className="flex between" style={{ padding: '6px 0' }}>
                    <span className="text-mute">Tax (commercial)</span>
                    <span className="tnum text-mute">MMK 0</span>
                  </div>
                  <div className="divider" style={{ margin: '6px 0' }}/>
                  <div className="flex between" style={{ padding: '6px 0' }}>
                    <span className="fw-7">Amount due</span>
                    <span className="tnum fw-7" style={{ fontSize: 18 }}>MMK {formatMMK(inv.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="divider"/>
              <div className="text-xs text-mute">
                <strong>Payment methods:</strong> KBZ Pay (09 7710 12345), AYA Bank (00 220 11 22 33), CB Bank (00 451 22 33 44), Yoma Bank (00 510 99 88 77). Please include invoice number in the transfer reference.
              </div>
              <div className="text-xs text-mute mt-2">
                <strong>Notes:</strong> Service continues uninterrupted upon payment confirmation. Late payments may result in service suspension after 7 days grace period.
              </div>
            </div>
          </div>
        </div>

        <div className="flex col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Payment status</h3></div>
            <div className="card-body">
              <div style={{ padding: 14, background: inv.status === 'Payment Received' ? 'var(--ok-soft)' : inv.status === 'Overdue' ? 'var(--bad-soft)' : 'var(--warn-soft)', borderRadius: 8 }}>
                <div className="fw-7" style={{ color: inv.status === 'Payment Received' ? 'var(--ok)' : inv.status === 'Overdue' ? 'var(--bad)' : 'oklch(0.5 0.14 75)' }}>{inv.status}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>
                  {inv.status === 'Payment Received' && `Receipt: ${inv.receipt}`}
                  {inv.status === 'Pending' && 'Awaiting your transfer'}
                  {inv.status === 'Customer Transferred' && 'Confirming with bank'}
                  {inv.status === 'Overdue' && 'Past due — please pay urgently'}
                </div>
              </div>
              {inv.status !== 'Payment Received' && (
                <button className="btn primary w-full mt-3" onClick={() => toast('Upload screenshot dialog', 'info')}>
                  <Icon name="attach" size={12}/>Upload payment proof
                </button>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Quick actions</h3></div>
            <div className="card-body">
              <div className="flex col gap-2">
                <button className="btn" onClick={() => toast(`Downloaded ${inv.id}.pdf`, 'info')}><Icon name="download" size={12}/>Download PDF</button>
                <button className="btn" onClick={() => toast('Forwarded to your accountant', 'info')}><Icon name="mail" size={12}/>Forward to accountant</button>
                <button className="btn" onClick={() => toast('Dispute opened with billing', 'warn')}><Icon name="alert" size={12}/>Dispute invoice</button>
              </div>
            </div>
          </div>
          {vms.length > 0 && (
            <div className="card">
              <div className="card-head"><h3 className="card-title">Linked VMs</h3></div>
              <div className="card-body" style={{ padding: '6px 14px' }}>
                {vms.map(v => (
                  <div key={v.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                    <div className="fw-6 text-sm">{v.name}</div>
                    <div className="text-xs text-mute mono">{v.id} · {v.publicIp}</div>
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

// ── Sales-side Provisioning Detail (customer data DISABLED) ───────────────
const ProvisioningRequestDetail = ({ taskId, onClose }) => {
  const { state, updateTask, toast, advanceProvision } = useStore();
  const t = state.tasks.find(x => x.id === taskId);
  if (!t) return null;
  const c = state.customers.find(c => c.id === t.customer);

  const [salesData, setSalesData] = React.useState({
    assignee: t.assignee || '—',
    priority: t.priority || 'Normal',
    status: t.status,
    salesNotes: t.salesNotes || '',
    eta: t.eta || '',
    internalNotes: t.internalNotes || '',
  });

  // Parse customer-submitted notes block
  const customerNotes = (t.notes || '').split('\n').filter(Boolean);
  const meta = {};
  customerNotes.forEach(l => {
    const m = l.match(/^(\w[\w\s]*?):\s*(.+)$/);
    if (m) meta[m[1].trim()] = m[2].trim();
  });

  const save = () => {
    updateTask(t.id, salesData);
    toast(`${t.id} updated · customer notified`, 'ok');
  };

  const isCustomerSubmitted = (t.notes || '').includes('Customer-initiated');

  // ── Build a VM spec object from the customer's submitted config ──────────
  const buildVMSpec = () => {
    const specStr = meta['Spec'] || '';
    const vcpu = parseInt((specStr.match(/(\d+)\s*vCPU/i) || [])[1]) || 2;
    const ram = parseInt((specStr.match(/(\d+)\s*GB\s*RAM/i) || [])[1]) || 4;
    const storage = parseInt((specStr.match(/(\d+)\s*GB\s*(SSD|storage)/i) || [])[1]) || 50;
    const pub = /yes/i.test(meta['Public access'] || '');
    return {
      name: meta['Hostname'] || `${(c?.company || 'vm').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 12)}-01`,
      customer: t.customer,
      type: (t.subscription || '').includes('trial') ? 'Trial' : 'Paid',
      status: 'Pending', powerState: 'Stopped',
      vcpu, ram, storage, bandwidth: '1 Gbps',
      os: meta['OS'] || 'Ubuntu 22.04 LTS',
      publicAccess: pub, interconnect: [], portForward: pub ? '443→443' : '—',
      publicIp: pub ? `203.81.64.${100 + Math.floor(Math.random() * 100)}` : '—',
      vlan: `VLAN-${200 + Math.floor(Math.random() * 50)}`,
      datacenter: meta['Region'] || 'Yangon DC1', node: 'pve-node-02',
      start: new Date().toISOString().slice(0, 10),
      expiry: window.MOCK.daysFromNow(365),
      firewallPolicy: 'pending', backup: 'Daily 02:00, 7d retention',
      proxmoxFlag: '', security: false, tags: [],
      notes: `Provisioned from ${t.id} (${c?.company})`,
      subscription: t.subscription || '1 year', priceMonth: vcpu * 20000 + ram * 6000 + storage * 200,
    };
  };

  // ── Workflow stages (Phase 1) ────────────────────────────────────────────
  const WF = [
    { label: 'Submitted', team: 'Customer', icon: 'mail', desc: 'Request received via portal' },
    { label: 'Sales review & KYC', team: 'Sales', icon: 'shield', desc: 'Verify customer & documents' },
    { label: 'KYC approved → notify Eng', team: 'VPS Portal', icon: 'check', desc: 'Provisioning task created' },
    { label: 'System: provision VM', team: 'Engineering', icon: 'server', desc: 'Build VM per specs' },
    { label: 'Network: firewall rules', team: 'Network', icon: 'shield', desc: 'Configure firewall & ports' },
    { label: 'KT: test & credentials', team: 'Engineering', icon: 'key', desc: 'Test VM, upload credentials' },
    { label: 'VM Ready ✓', team: 'Customer', icon: 'check', desc: 'Customer notified & can access' },
  ];
  const wfStage = t.wfStage || 0;
  const teamColor = { Customer: 'var(--info)', Sales: 'oklch(0.6 0.16 30)', 'VPS Portal': 'var(--accent)', Engineering: 'var(--ok)', Network: 'oklch(0.55 0.17 285)' };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: 'min(860px, 95vw)' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="flex center between mb-2">
            <div className="flex center gap-2">
              <span className="mono text-sm text-mute">{t.id}</span>
              {isCustomerSubmitted && <span className="pill accent"><span className="dot"/>Customer-submitted</span>}
            </div>
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.title}</h2>
          <div className="flex gap-2 mt-2">
            <StatusPill status={salesData.status}/>
            <span className="pill subtle">{t.type}</span>
            <span className={`pill ${salesData.priority === 'Urgent' ? 'bad' : 'subtle'}`}>{salesData.priority}</span>
            <span className="pill subtle"><Icon name="building" size={10}/>{c?.company}</span>
            <span className="pill subtle">Created {t.created}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {/* ── Workflow stage tracker ── */}
          {(isCustomerSubmitted || t.type === 'New') && (
            <div className="card mb-4">
              <div className="card-head">
                <h3 className="card-title">Provisioning workflow</h3>
                <span className="pill accent"><span className="dot"/>Step {Math.min(wfStage + 1, WF.length)} of {WF.length}</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {WF.map((s, i) => {
                    const done = i < wfStage;
                    const active = i === wfStage;
                    const color = teamColor[s.team] || 'var(--accent)';
                    return (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: done ? 'var(--ok)' : active ? color : 'var(--surface-3)',
                            color: done || active ? 'white' : 'var(--ink-3)',
                            display: 'grid', placeItems: 'center',
                            border: active ? `2px solid ${color}` : 'none',
                            boxShadow: active ? `0 0 0 4px ${color}22` : 'none',
                            transition: 'all 0.25s',
                          }}>
                            {done ? <Icon name="check" size={14}/> : <Icon name={s.icon} size={13}/>}
                          </div>
                          {i < WF.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 22, background: done ? 'var(--ok)' : 'var(--line)', transition: 'background 0.25s' }}/>}
                        </div>
                        <div style={{ flex: 1, paddingBottom: 14 }}>
                          <div className="flex center gap-2">
                            <span className="fw-6 text-sm" style={{ color: active ? 'var(--ink)' : done ? 'var(--ink)' : 'var(--ink-3)' }}>{s.label}</span>
                            <span className="pill subtle" style={{ fontSize: 9.5, background: `${color}1a`, color }}>{s.team}</span>
                            {active && <span className="pill warn" style={{ fontSize: 9.5 }}>Current</span>}
                          </div>
                          <div className="text-xs text-mute mt-1">{s.desc}</div>
                          {active && i > 0 && (
                            <button className="btn sm accent mt-2" onClick={() => advanceProvision(t.id, buildVMSpec())}>
                              <Icon name="check" size={11}/>
                              {i === WF.length - 1 ? 'Complete — notify customer' : `Mark done → ${WF[i + 1].team}`}
                            </button>
                          )}
                          {active && i === 0 && (
                            <button className="btn sm accent mt-2" onClick={() => advanceProvision(t.id, buildVMSpec())}>
                              <Icon name="play" size={11}/>Start Sales review
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {wfStage >= WF.length - 1 && (
                  <div style={{ padding: 12, background: 'var(--ok-soft)', borderRadius: 8, fontSize: 12, display: 'flex', gap: 8, marginTop: 4, color: 'var(--ok)' }}>
                    <Icon name="check" size={14} style={{ flexShrink: 0 }}/>
                    <div>VM provisioned and active. The customer can now access it in their portal under <strong>My VMs</strong>.</div>
                  </div>
                )}
                {t.createdVmId && (
                  <div className="text-xs text-mute mt-2">Linked VM: <span className="id-tag accent">{t.createdVmId}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Customer-submitted block — DISABLED */}
          <div className="card mb-4" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
            <div className="card-head">
              <div className="flex center gap-2">
                <Icon name="lock" size={13} className="text-mute"/>
                <h3 className="card-title">Customer-submitted (read-only)</h3>
              </div>
              <span className="pill subtle"><Icon name="lock" size={10}/>Locked</span>
            </div>
            <div className="card-body">
              <div className="grid-2" style={{ gap: 16 }}>
                <div>
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Customer</div>
                  <dl className="dl">
                    <dt>Customer</dt><dd>{c?.company}</dd>
                    <dt>Contact</dt><dd>{c?.name}</dd>
                    <dt>Email</dt><dd className="mono text-sm">{c?.email}</dd>
                  </dl>
                </div>
                <div>
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Request type</div>
                  <dl className="dl">
                    <dt>Type</dt><dd>{t.type}</dd>
                    <dt>Subscription</dt><dd>{t.subscription || '—'}</dd>
                    <dt>Submitted</dt><dd className="tnum">{t.created}</dd>
                  </dl>
                </div>
              </div>
              {Object.keys(meta).length > 0 && (
                <>
                  <div className="divider"/>
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Configuration submitted by customer</div>
                  <dl className="dl">
                    {Object.entries(meta).map(([k, v]) => (
                      <React.Fragment key={k}>
                        <dt>{k}</dt>
                        <dd>
                          <input
                            value={v}
                            disabled
                            readOnly
                            style={{
                              width: '100%', padding: '4px 8px',
                              border: '1px solid var(--line)', borderRadius: 4,
                              background: 'var(--surface-3)', color: 'var(--ink-2)',
                              fontFamily: /Hostname|Spec|OS|Plan/i.test(k) ? 'var(--mono)' : 'inherit',
                              fontSize: 12, cursor: 'not-allowed',
                            }}
                          />
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </>
              )}
            </div>
          </div>

          {/* Sales workspace — EDITABLE */}
          <div className="card mb-4">
            <div className="card-head">
              <h3 className="card-title">Sales workspace</h3>
              <button className="btn sm accent" onClick={save}><Icon name="check" size={11}/>Save changes</button>
            </div>
            <div className="card-body">
              <div className="flex col gap-3">
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Assigned person</label>
                    <select value={salesData.assignee} onChange={e => setSalesData({...salesData, assignee: e.target.value})}>
                      <option value="—">— Unassigned —</option>
                      {state.team.map(m => <option key={m.id} value={m.name}>{m.name} · {m.role}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Priority</label>
                    <div className="flex gap-2">
                      {['Low', 'Normal', 'Urgent'].map(p => (
                        <button key={p}
                          className={`filter-chip ${salesData.priority === p ? 'active' : ''}`}
                          onClick={() => setSalesData({...salesData, priority: p})}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>Status</label>
                  <div className="flex gap-2 wrap">
                    {['Pending', 'In Progress', 'Blocked', 'Done'].map(s => (
                      <button key={s}
                        className={`filter-chip ${salesData.status === s ? 'active' : ''}`}
                        onClick={() => setSalesData({...salesData, status: s})}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Quote / ETA</label>
                    <input value={salesData.eta} onChange={e => setSalesData({...salesData, eta: e.target.value})} placeholder="e.g. MMK 540,000 · ready by 31 May"/>
                  </div>
                  <div className="field">
                    <label>Customer-facing notes</label>
                    <input value={salesData.salesNotes} onChange={e => setSalesData({...salesData, salesNotes: e.target.value})} placeholder="Will be shown to customer"/>
                  </div>
                </div>
                <div className="field">
                  <label>Internal notes (not visible to customer)</label>
                  <textarea rows="3" value={salesData.internalNotes} onChange={e => setSalesData({...salesData, internalNotes: e.target.value})} placeholder="Migration risks, pricing context, engineering hand-off…"/>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-head"><h3 className="card-title">Quick actions</h3></div>
            <div className="card-body">
              <div className="flex gap-2 wrap">
                <button className="btn" onClick={() => toast(`Email sent to ${c?.email}`, 'ok')}><Icon name="mail" size={12}/>Email customer</button>
                <button className="btn" onClick={() => toast('Quote PDF generated', 'ok')}><Icon name="invoice" size={12}/>Generate quote</button>
                <button className="btn" onClick={() => { setSalesData({...salesData, status: 'In Progress'}); updateTask(t.id, { status: 'In Progress' }); toast('Task moved to In Progress', 'info'); }}><Icon name="play" size={12}/>Start work</button>
                <button className="btn" onClick={() => toast('Customer notified — request needs more info', 'warn')}><Icon name="alert" size={12}/>Request more info</button>
                <button className="btn accent" onClick={() => { updateTask(t.id, { status: 'Done' }); toast('Marked done · customer notified', 'ok'); }}><Icon name="check" size={12}/>Mark done</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CustomerRequestDetail, CustomerInvoiceDetail, ProvisioningRequestDetail });
