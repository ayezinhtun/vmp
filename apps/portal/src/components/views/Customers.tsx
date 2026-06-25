import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { StatusPill, formatMMK, Avatar } from '../../lib/ui'

interface CustomersViewProps {
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const CustomersView: React.FC<CustomersViewProps> = ({ openCust, openModal }) => {
  const { state, updateCustomer } = useStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [menu, setMenu] = useState<string | null>(null)

  const filters = [
    { id: 'all', label: 'All customers', count: state.customers.length },
    { id: 'Active', label: 'Active', count: state.customers.filter(c => c.status === 'Active').length },
    { id: 'Pending', label: 'KYC pending', count: state.customers.filter(c => c.kyc === 'Pending').length },
    { id: 'Rejected', label: 'KYC rejected', count: state.customers.filter(c => c.kyc === 'Rejected').length },
    { id: 'Inactive', label: 'Inactive', count: state.customers.filter(c => c.status === 'Inactive').length },
  ]

  const filtered = state.customers.filter(c => {
    if (filter === 'all') return true
    if (filter === 'Pending' || filter === 'Rejected') return c.kyc === filter
    return c.status === filter
  }).filter(c => {
    if (!search) return true
    return [c.id, c.name, c.company, c.email, c.phone].join(' ').toLowerCase().includes(search.toLowerCase())
  })

  useEffect(() => {
    const close = () => setMenu(null)
    if (menu) { window.addEventListener('click', close); return () => window.removeEventListener('click', close) }
  }, [menu])

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
              const vmCount = state.vms.filter(v => v.customer === c.id && v.status === 'Active').length
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CustomerDrawer: React.FC<{ custId: string; onClose: () => void; openVM: (id: string) => void; openModal: (kind: string, props?: any) => void }> = ({ custId, onClose, openVM, openModal }) => {
  const { state, updateCustomer } = useStore()
  const c = state.customers.find((cust: any) => cust.id === custId)
  if (!c) return null
  const vms = state.vms.filter((v: any) => v.customer === custId)
  const invs = state.invoices.filter((i: any) => i.customer === custId)
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(c)

  useEffect(() => { setDraft(c) }, [custId])

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
                <div className="metric"><div className="label">Active VMs</div><div className="value tnum" style={{ fontSize: 22 }}>{vms.filter((v: any) => v.status === 'Active').length}</div></div>
                <div className="metric"><div className="label">Open invoices</div><div className="value tnum" style={{ fontSize: 22 }}>{invs.filter((i: any) => i.status !== 'Payment Received').length}</div></div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Account details</h3>
                  {!editing
                    ? <button className="btn sm" onClick={() => setEditing(true)}><Icon name="edit" size={11}/>Edit</button>
                    : <div className="flex gap-2">
                        <button className="btn sm ghost" onClick={() => { setDraft(c); setEditing(false) }}>Cancel</button>
                        <button className="btn sm accent" onClick={() => { updateCustomer(c.id, draft); setEditing(false) }}><Icon name="check" size={11}/>Save</button>
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
                          {state.team.filter((t: any) => t.role === 'Sales').map((t: any) => <option key={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Internal notes</h3></div>
                <div className="card-body">
                  <textarea rows={3} defaultValue={c.notes} placeholder="Notes only visible to admin team…" onBlur={e => updateCustomer(c.id, { notes: e.target.value })}/>
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
                    {vms.map((v: any) => (
                      <tr key={v.id} onClick={() => openVM(v.id)}>
                        <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                        <td><StatusPill status={v.status}/></td>
                        <td className="mono text-xs">{v.vcpu}c · {v.ram}GB · {v.storage}GB</td>
                        <td>{v.expiry}</td>
                      </tr>
                    ))}
                    {vms.length === 0 && <tr><td colSpan={4}><div className="empty"><div className="sub">No VMs yet for this customer.</div></div></td></tr>}
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
                      <button className="btn accent" onClick={() => openModal('kycdocs', { customer: c })}><Icon name="check" size={12}/>Approve</button>
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
                    {invs.map((i: any) => (
                      <tr key={i.id}>
                        <td className="mono">{i.id}</td>
                        <td className="tnum text-sm">{i.issued}</td>
                        <td className="right tnum fw-6">MMK {formatMMK(i.amount)}</td>
                        <td><StatusPill status={i.status}/></td>
                      </tr>
                    ))}
                    {invs.length === 0 && <tr><td colSpan={4}><div className="empty"><div className="sub">No invoices yet.</div></div></td></tr>}
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
                ].map((a: any, i: number) => (
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
  )
}

export { CustomerDrawer }
export default CustomersView
