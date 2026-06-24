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

export default CustomersView
