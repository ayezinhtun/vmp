// Admin: Customer Account Management — 5 features
// 1. All customers overview/list with rich filters (uses existing CustomersView)
// 2. Customer 360° detail (lifetime value, VMs, invoices, tickets, comms in one view)
// 3. Account actions (suspend/reactivate/reset password/impersonate)
// 4. Bulk operations (bulk email, bulk KYC reminders, bulk export, bulk tag)
// 5. Customer segments / saved views

import React, { useState } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { Avatar, StatusPill, formatMMK } from '../../lib/ui'

interface CustomerAccountManagementViewProps {
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

export const CustomerAccountManagementView: React.FC<CustomerAccountManagementViewProps> = ({ openCust, openModal }) => {
  const { state, updateCustomer, toast, setKYC } = useStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [segment, setSegment] = useState('all')
  const [search, setSearch] = useState('')
  const [view360, setView360] = useState<any>(null)

  // Feature 5: Saved segments
  const segments = [
    { id: 'all', label: 'All customers', filter: () => true },
    { id: 'high-value', label: 'High value (>5M MMK)', filter: (c: any) => c.totalSpend > 5000000 },
    { id: 'at-risk', label: 'At risk (KYC issue)', filter: (c: any) => c.kyc === 'Rejected' || c.kyc === 'Pending' },
    { id: 'new-30d', label: 'New (last 30 days)', filter: (c: any) => (window.MOCK.TODAY - new Date(c.since)) / 86400000 <= 30 },
    { id: 'inactive', label: 'Inactive', filter: (c: any) => c.status === 'Inactive' || state.vms.filter((v: any) => v.customer === c.id && v.status === 'Active').length === 0 },
    { id: 'enterprise', label: 'Enterprise (>3 VMs)', filter: (c: any) => state.vms.filter((v: any) => v.customer === c.id && v.status === 'Active').length > 3 },
  ]

  const filtered = state.customers
    .filter(segments.find(s => s.id === segment)?.filter || (() => true))
    .filter((c: any) => !search || [c.name, c.company, c.email, c.id, c.phone].join(' ').toLowerCase().includes(search.toLowerCase()))

  const toggle = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  return (
    <div className="content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Customer accounts</h1>
          <p className="page-subtitle">Complete customer management · {state.customers.length} total · {state.customers.filter((c: any) => c.kyc === 'Pending').length} pending KYC · MMK {formatMMK(state.customers.reduce((a: number, c: any) => a + c.totalSpend, 0))} total lifetime value</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Customer report exported', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => openModal('newcust')}><Icon name="plus" size={13}/>Add customer</button>
        </div>
      </div>

      {/* Feature 1: KPI tiles */}
      <div className="grid-4 mb-4">
        {[
          { label: 'Total customers', value: state.customers.length, sub: `+${state.customers.filter((c: any) => (window.MOCK.TODAY - new Date(c.since))/86400000 <= 30).length} new this month`, icon: 'users', accent: 'oklch(0.6 0.13 250)' },
          { label: 'Active', value: state.customers.filter((c: any) => c.status === 'Active').length, sub: `${state.customers.filter((c: any) => c.status === 'Inactive').length} inactive`, icon: 'check', accent: 'var(--ok)' },
          { label: 'Pending KYC', value: state.customers.filter((c: any) => c.kyc === 'Pending').length, sub: 'avg 4.2h response', icon: 'shield', accent: 'oklch(0.55 0.16 75)' },
          { label: 'Lifetime value', value: `${formatMMK(Math.round(state.customers.reduce((a: number, c: any) => a + c.totalSpend, 0) / 1000000))}M`, sub: 'MMK total', icon: 'invoice', accent: 'oklch(0.55 0.18 285)' },
        ].map((m, i) => (
          <div key={i} className="metric" style={{ animation: `fadeIn ${0.2 + i*0.05}s ease-out` }}>
            <div className="label flex center gap-2">
              <div style={{ width: 22, height: 22, borderRadius: 6, background: `${m.accent}1a`, color: m.accent, display: 'grid', placeItems: 'center' }}><Icon name={m.icon} size={11}/></div>
              {m.label}
            </div>
            <div className="value tnum">{m.value}</div>
            <div className="trend">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Feature 5: Saved segments */}
      <div className="card mb-3">
        <div className="card-body" style={{ padding: '12px 18px' }}>
          <div className="flex center gap-2 wrap">
            <span className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>Segments</span>
            {segments.map(s => (
              <button key={s.id}
                className={`filter-chip ${segment === s.id ? 'active' : ''}`}
                onClick={() => setSegment(s.id)}>
                {s.label}
                <span className="ct">{state.customers.filter(s.filter).length}</span>
              </button>
            ))}
            <div style={{ flex: 1 }}/>
            <button className="btn ghost sm" onClick={() => toast('Save current filters as a new segment', 'info')}><Icon name="plus" size={11}/>Save view</button>
          </div>
        </div>
      </div>

      {/* Feature 4: Bulk actions bar */}
      {selected.size > 0 && (
        <div className="card mb-3" style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)', animation: 'slideIn 0.2s ease-out' }}>
          <div className="card-body" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="fw-7 text-sm">{selected.size} selected</span>
            <div style={{ flex: 1 }}/>
            <button className="btn sm" onClick={() => { toast(`Email sent to ${selected.size} customers`, 'ok'); setSelected(new Set()); }}><Icon name="mail" size={11}/>Bulk email</button>
            <button className="btn sm" onClick={() => { toast(`KYC reminder sent to ${[...selected].filter(id => state.customers.find((c: any) => c.id === id)?.kyc === 'Pending').length} customers`, 'ok'); setSelected(new Set()); }}><Icon name="shield" size={11}/>KYC reminder</button>
            <button className="btn sm" onClick={() => { toast(`Tagged ${selected.size} customers`, 'ok'); setSelected(new Set()); }}><Icon name="plus" size={11}/>Tag</button>
            <button className="btn sm" onClick={() => { toast(`Exported ${selected.size} customers (CSV)`, 'info'); setSelected(new Set()); }}><Icon name="download" size={11}/>Export</button>
            <button className="btn sm danger" onClick={() => { selected.forEach(id => updateCustomer(id, { status: 'Inactive' })); toast(`Suspended ${selected.size} customers`, 'warn'); setSelected(new Set()); }}><Icon name="pause" size={11}/>Suspend</button>
            <button className="btn ghost sm" onClick={() => setSelected(new Set())}><Icon name="x" size={11}/></button>
          </div>
        </div>
      )}

      {/* Customers table */}
      <div className="card">
        <div className="filter-bar">
          <div className="search" style={{ width: 280 }}>
            <Icon name="search" size={13} className="search-icon"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, company, email, phone…"/>
          </div>
          <div style={{ flex: 1 }}/>
          <span className="text-xs text-mute">{filtered.length} of {state.customers.length}</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th style={{ width: 30 }}>
              <input type="checkbox"
                checked={filtered.length > 0 && filtered.every((c: any) => selected.has(c.id))}
                onChange={e => setSelected(e.target.checked ? new Set(filtered.map((c: any) => c.id)) : new Set())}/>
            </th>
            <th>Customer</th>
            <th>Company</th>
            <th>KYC</th>
            <th>Status</th>
            <th className="right">VMs</th>
            <th className="right">Lifetime</th>
            <th>Sales</th>
            <th>Since</th>
            <th style={{ width: 80 }}></th>
          </tr></thead>
          <tbody>
            {filtered.map((c: any) => {
              const vmCount = state.vms.filter((v: any) => v.customer === c.id && v.status === 'Active').length
              return (
                <tr key={c.id} onClick={() => setView360(c)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)}/>
                  </td>
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
                  <td className="right" onClick={e => e.stopPropagation()}>
                    <button className="btn sm" onClick={() => setView360(c)}><Icon name="eye" size={11}/>360°</button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={10}><div className="empty"><div className="title">No customers in this segment</div></div></td></tr>}
          </tbody>
        </table>
      </div>

      {/* Feature 2: 360° detail panel */}
      {view360 && <Customer360 customer={view360} onClose={() => setView360(null)} openCust={openCust}/>}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

// Feature 2 & 3: Customer 360° + Account actions
interface Customer360Props {
  customer: any
  onClose: () => void
  openCust: (id: string) => void
}

const Customer360: React.FC<Customer360Props> = ({ customer, onClose, openCust }) => {
  const { state, updateCustomer, setKYC, toast } = useStore()
  const c = state.customers.find((x: any) => x.id === customer.id) || customer
  const vms = state.vms.filter((v: any) => v.customer === c.id)
  const invs = state.invoices.filter((i: any) => i.customer === c.id)
  const tickets = state.tickets.filter((t: any) => t.customer === c.id)
  const tasks = state.tasks.filter((t: any) => t.customer === c.id)

  const ltv = c.totalSpend
  const mrr = vms.filter((v: any) => v.status === 'Active').reduce((a: number, v: any) => a + v.priceMonth, 0)
  const openTickets = tickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress').length
  const overdueInv = invs.filter((i: any) => i.status === 'Overdue').length

  // Health score (0-100)
  const health = Math.round(
    (c.status === 'Active' ? 30 : 0) +
    (c.kyc === 'Approved' ? 20 : c.kyc === 'Pending' ? 10 : 0) +
    Math.min(20, vms.filter((v: any) => v.status === 'Active').length * 5) +
    (overdueInv === 0 ? 15 : 0) +
    Math.min(15, 15 - openTickets * 3)
  )
  const healthColor = health >= 70 ? 'var(--ok)' : health >= 40 ? 'var(--warn)' : 'var(--bad)'
  const healthLabel = health >= 70 ? 'Healthy' : health >= 40 ? 'At risk' : 'Critical'

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: 'min(900px, 95vw)' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
          <div className="flex center between mb-2">
            <span className="mono text-sm text-mute">{c.id}</span>
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
          </div>
          <div className="flex center gap-3">
            <Avatar name={c.name} size={56}/>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.name}</h2>
              <div className="text-sm text-mute mt-1">{c.company} · {c.email} · {c.phone}</div>
              <div className="flex gap-2 mt-2">
                <StatusPill status={c.kyc}/>
                <StatusPill status={c.status}/>
                <span className="pill"><span className="dot" style={{ background: healthColor }}/>Health: {health}/100 · {healthLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {/* 360° KPIs */}
          <div className="grid-4 mb-4">
            <div className="metric"><div className="label">Lifetime value</div><div className="value tnum" style={{ fontSize: 18 }}>MMK {formatMMK(ltv)}</div></div>
            <div className="metric"><div className="label">Monthly recurring</div><div className="value tnum" style={{ fontSize: 18 }}>MMK {formatMMK(mrr)}</div></div>
            <div className="metric"><div className="label">Active VMs</div><div className="value tnum">{vms.filter((v: any) => v.status === 'Active').length}</div><div className="trend">{vms.length} total</div></div>
            <div className="metric"><div className="label">Open issues</div><div className="value tnum" style={{ fontSize: 18, color: openTickets > 0 || overdueInv > 0 ? 'var(--bad)' : 'var(--ok)' }}>{openTickets + overdueInv}</div><div className="trend">{openTickets} tickets · {overdueInv} overdue inv</div></div>
          </div>

          {/* Feature 3: Account actions */}
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Account actions</h3></div>
            <div className="card-body">
              <div className="flex gap-2 wrap">
                <button className="btn" onClick={() => toast(`Impersonating ${c.name} — switch role to Customer to see their view`, 'info')}><Icon name="eye" size={12}/>Impersonate</button>
                <button className="btn" onClick={() => toast(`Password reset email sent to ${c.email}`, 'ok')}><Icon name="key" size={12}/>Reset password</button>
                <button className="btn" onClick={() => toast(`Welcome email re-sent to ${c.email}`, 'info')}><Icon name="mail" size={12}/>Resend welcome</button>
                {c.kyc === 'Pending' && <>
                  <button className="btn accent" onClick={() => setKYC(c.id, 'Approved')}><Icon name="check" size={12}/>Approve KYC</button>
                  <button className="btn danger" onClick={() => setKYC(c.id, 'Rejected')}><Icon name="x" size={12}/>Reject KYC</button>
                </>}
                {c.status === 'Active'
                  ? <button className="btn" onClick={() => { updateCustomer(c.id, { status: 'Inactive' }); toast(`${c.name} suspended`, 'warn'); }}><Icon name="pause" size={12}/>Suspend account</button>
                  : <button className="btn primary" onClick={() => { updateCustomer(c.id, { status: 'Active' }); toast(`${c.name} reactivated`, 'ok'); }}><Icon name="play" size={12}/>Reactivate</button>
                }
                <button className="btn" onClick={() => toast('Customer data export queued (24h)', 'info')}><Icon name="download" size={12}/>Export data (GDPR)</button>
                <button className="btn danger" onClick={() => toast('Account deletion requires Admin password confirmation', 'warn')}><Icon name="trash" size={12}/>Delete account</button>
              </div>
            </div>
          </div>

          {/* All-data tabs as collapsed lists */}
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="card">
              <div className="card-head"><h3 className="card-title">VMs ({vms.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>VM</th><th>Status</th><th>MMK/mo</th></tr></thead>
                  <tbody>
                    {vms.slice(0, 5).map((v: any) => (
                      <tr key={v.id}><td><div className="fw-6 text-xs">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td><td><StatusPill status={v.status}/></td><td className="tnum text-xs">{formatMMK(v.priceMonth)}</td></tr>
                    ))}
                    {vms.length === 0 && <tr><td colSpan={3}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No VMs</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3 className="card-title">Invoices ({invs.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Invoice</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {invs.slice(0, 5).map((i: any) => (
                      <tr key={i.id}><td className="mono text-xs">{i.id}</td><td className="tnum text-xs">MMK {formatMMK(i.amount)}</td><td><StatusPill status={i.status}/></td></tr>
                    ))}
                    {invs.length === 0 && <tr><td colSpan={3}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No invoices</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3 className="card-title">Support tickets ({tickets.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Subject</th><th>Status</th></tr></thead>
                  <tbody>
                    {tickets.slice(0, 5).map((t: any) => (
                      <tr key={t.id}><td><div className="fw-6 text-xs">{t.subject}</div><div className="text-xs text-mute mono">{t.id}</div></td><td><StatusPill status={t.status}/></td></tr>
                    ))}
                    {tickets.length === 0 && <tr><td colSpan={2}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No tickets</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3 className="card-title">Tasks / requests ({tasks.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Task</th><th>Status</th></tr></thead>
                  <tbody>
                    {tasks.slice(0, 5).map((t: any) => (
                      <tr key={t.id}><td><div className="fw-6 text-xs" style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div><div className="text-xs text-mute mono">{t.id}</div></td><td><StatusPill status={t.status}/></td></tr>
                    ))}
                    {tasks.length === 0 && <tr><td colSpan={2}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No tasks</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Open full profile link */}
          <div className="text-center mt-4">
            <button className="btn" onClick={() => { onClose(); openCust(c.id); }}>Open full profile<Icon name="external" size={11}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}
