// Admin: Customer Account Management — 5 features
// 1. All customers overview/list with rich filters (uses existing CustomersView)
// 2. Customer 360° detail (lifetime value, VMs, invoices, tickets, comms in one view)
// 3. Account actions (suspend/reactivate/reset password/impersonate)
// 4. Bulk operations (bulk email, bulk KYC reminders, bulk export, bulk tag)
// 5. Customer segments / saved views
// Customer360 component extracted to components/customer folder

import React, { useState } from 'react'
import useCustomerStore from '../store/customerStore'
import useVMStore from '../store/vmStore'
import useUIStore from '../store/uiStore'
import Icon from '../lib/icons'
import { Avatar, StatusPill, formatMMK } from '../components/ui/ui'
import { Customer360 } from '../components/customer/Customer360'

interface CustomerAccountManagementViewProps {
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

export const CustomerAccountManagementView: React.FC<CustomerAccountManagementViewProps> = ({ openCust, openModal }) => {
  const { customers, updateCustomer } = useCustomerStore()
  const { vms } = useVMStore()
  const { toast } = useUIStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [segment, setSegment] = useState('all')
  const [search, setSearch] = useState('')
  const [view360, setView360] = useState<any>(null)

  // Feature 5: Saved segments
  const segments = [
    { id: 'all', label: 'All customers', filter: () => true },
    { id: 'high-value', label: 'High value (>5M MMK)', filter: (c: any) => c.totalSpend > 5000000 },
    { id: 'at-risk', label: 'At risk (KYC issue)', filter: (c: any) => c.kyc === 'Rejected' || c.kyc === 'Pending' },
    { id: 'new-30d', label: 'New (last 30 days)', filter: (c: any) => (window.MOCK.TODAY.getTime() - new Date(c.since).getTime()) / 86400000 <= 30 },
    { id: 'inactive', label: 'Inactive', filter: (c: any) => c.status === 'Inactive' || vms.filter((v: any) => v.customer === c.id && v.status === 'Active').length === 0 },
    { id: 'enterprise', label: 'Enterprise (>3 VMs)', filter: (c: any) => vms.filter((v: any) => v.customer === c.id && v.status === 'Active').length > 3 },
  ]

  const filtered = customers
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
          <p className="page-subtitle">Complete customer management · {customers.length} total · {customers.filter((c: any) => c.kyc === 'Pending').length} pending KYC · MMK {formatMMK(customers.reduce((a: number, c: any) => a + c.totalSpend, 0))} total lifetime value</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Customer report exported', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => openModal('newcust')}><Icon name="plus" size={13}/>Add customer</button>
        </div>
      </div>

      {/* Feature 1: KPI tiles */}
      <div className="grid-4 mb-4">
        {[
          { label: 'Total customers', value: customers.length, sub: `+${customers.filter((c: any) => (window.MOCK.TODAY.getTime() - new Date(c.since).getTime())/86400000 <= 30).length} new this month`, icon: 'users', accent: 'oklch(0.6 0.13 250)' },
          { label: 'Active', value: customers.filter((c: any) => c.status === 'Active').length, sub: `${customers.filter((c: any) => c.status === 'Inactive').length} inactive`, icon: 'check', accent: 'var(--ok)' },
          { label: 'Pending KYC', value: customers.filter((c: any) => c.kyc === 'Pending').length, sub: 'avg 4.2h response', icon: 'shield', accent: 'oklch(0.55 0.16 75)' },
          { label: 'Lifetime value', value: `${formatMMK(Math.round(customers.reduce((a: number, c: any) => a + c.totalSpend, 0) / 1000000))}M`, sub: 'MMK total', icon: 'invoice', accent: 'oklch(0.55 0.18 285)' },
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
                <span className="ct">{customers.filter(s.filter).length}</span>
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
            <button className="btn sm" onClick={() => { toast(`KYC reminder sent to ${[...selected].filter(id => customers.find((c: any) => c.id === id)?.kyc === 'Pending').length} customers`, 'ok'); setSelected(new Set()); }}><Icon name="shield" size={11}/>KYC reminder</button>
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
          <span className="text-xs text-mute">{filtered.length} of {customers.length}</span>
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
              const vmCount = vms.filter((v: any) => v.customer === c.id && v.status === 'Active').length
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
