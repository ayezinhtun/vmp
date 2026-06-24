import React, { useState } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { StatusPill, formatMMK, ExpiryCell } from '../../lib/ui'

interface FinanceViewProps {
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const FinanceView: React.FC<FinanceViewProps> = ({ openCust, openModal }) => {
  const { state, markPaid } = useStore()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)

  const filters = [
    { id: 'all', label: 'All', count: state.invoices.length },
    { id: 'Pending', label: 'Pending', count: state.invoices.filter(i => i.status === 'Pending').length },
    { id: 'Customer Transferred', label: 'Customer Transferred', count: state.invoices.filter(i => i.status === 'Customer Transferred').length },
    { id: 'Payment Received', label: 'Payment Received', count: state.invoices.filter(i => i.status === 'Payment Received').length },
    { id: 'Overdue', label: 'Overdue', count: state.invoices.filter(i => i.status === 'Overdue').length },
  ]

  const filtered = filter === 'all' ? state.invoices : state.invoices.filter(i => i.status === filter)

  const total = state.invoices.reduce((a, i) => a + i.amount, 0)
  const received = state.invoices.filter(i => i.status === 'Payment Received').reduce((a, i) => a + i.amount, 0)
  const pending = state.invoices.filter(i => i.status === 'Pending' || i.status === 'Customer Transferred').reduce((a, i) => a + i.amount, 0)
  const overdue = state.invoices.filter(i => i.status === 'Overdue').reduce((a, i) => a + i.amount, 0)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{state.invoices.length} invoices · MMK {formatMMK(total)} total billed</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Invoices CSV download started', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => openModal('newinvoice')}><Icon name="plus" size={13}/>New invoice</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Total billed (May)</div><div className="value tnum" style={{ fontSize: 22 }}>MMK {formatMMK(total)}</div></div>
        <div className="metric"><div className="label">Received</div><div className="value tnum" style={{ fontSize: 22, color: 'var(--ok)' }}>MMK {formatMMK(received)}</div></div>
        <div className="metric"><div className="label">Pending</div><div className="value tnum" style={{ fontSize: 22, color: 'oklch(0.55 0.16 75)' }}>MMK {formatMMK(pending)}</div></div>
        <div className="metric"><div className="label">Overdue</div><div className="value tnum" style={{ fontSize: 22, color: 'var(--bad)' }}>MMK {formatMMK(overdue)}</div></div>
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
            <input placeholder="Invoice #, customer…"/>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Invoice</th><th>Customer</th><th>VMs</th><th>Issued</th><th>Due</th>
              <th className="right">Amount</th><th>Status</th><th>Method</th><th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => {
              const c = state.customers.find(c => c.id === i.customer)
              return (
                <tr key={i.id} onClick={() => setSelected(i)}>
                  <td className="mono fw-6">{i.id}</td>
                  <td><div className="fw-6 text-sm">{c?.company}</div><div className="text-xs text-mute">{c?.name}</div></td>
                  <td><div className="flex gap-1 wrap">{i.vms.map(v => <span key={v} className="id-tag">{v}</span>)}</div></td>
                  <td className="tnum text-sm">{i.issued}</td>
                  <td className="tnum text-sm">{i.due}</td>
                  <td className="right tnum fw-7">MMK {formatMMK(i.amount)}</td>
                  <td><StatusPill status={i.status}/></td>
                  <td className="text-sm">{i.method}</td>
                  <td onClick={e => e.stopPropagation()} className="right">
                    {i.status !== 'Payment Received' && <button className="btn sm" onClick={() => markPaid(i.id)}><Icon name="check" size={11}/>Mark paid</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} openCust={openCust} openModal={openModal}/>}
    </div>
  )
}

interface InvoiceDrawerProps {
  invoice: any
  onClose: () => void
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const InvoiceDrawer: React.FC<InvoiceDrawerProps> = ({ invoice, onClose, openCust, openModal }) => {
  const { state, markPaid, updateInvoice } = useStore()
  const c = state.customers.find(c => c.id === invoice.customer)
  if (!c) return null
  const vms = state.vms.filter(v => invoice.vms.includes(v.id))
  const live = state.invoices.find(i => i.id === invoice.id) || invoice

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="flex center between mb-2">
            <span className="mono text-sm text-mute">{live.id}</span>
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
          </div>
          <div className="flex center between">
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>MMK {formatMMK(live.amount)}</h2>
              <div className="text-sm text-mute mt-1">
                <a onClick={() => openCust(c.id)} style={{ cursor: 'pointer', color: 'var(--accent-strong)' }}>{c.company}</a>
                {' · issued '}{live.issued}{' · due '}{live.due}
              </div>
              <div className="flex gap-2 mt-2">
                <StatusPill status={live.status}/>
                <span className="pill subtle">{live.currency}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => useStore().toast(`Downloaded ${live.id}.pdf`, 'info')}><Icon name="download" size={12}/>PDF</button>
              <button className="btn" onClick={() => openModal('email', { to: c.email, template: 'invoice' })}><Icon name="mail" size={12}/>Email</button>
              {live.status !== 'Payment Received' && <button className="btn accent" onClick={() => markPaid(live.id)}><Icon name="check" size={12}/>Mark paid</button>}
              {live.status === 'Pending' && <button className="btn" onClick={() => updateInvoice(live.id, { status: 'Customer Transferred' })}>Transfer received</button>}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Line items</h3></div>
            <div className="card-body flush">
              <table className="tbl">
                <thead><tr><th>VM</th><th>Description</th><th className="right">Months</th><th className="right">Unit</th><th className="right">Total</th></tr></thead>
                <tbody>
                  {vms.map(v => {
                    const months = vms.length === 1 ? Math.round(live.amount / v.priceMonth) : 6
                    return (
                      <tr key={v.id}>
                        <td className="mono">{v.id}</td>
                        <td>
                          <div className="fw-6 text-sm">{v.name}</div>
                          <div className="text-xs text-mute">{v.vcpu}c · {v.ram}GB · {v.storage}GB · {v.os}</div>
                        </td>
                        <td className="right tnum">{months}</td>
                        <td className="right tnum">{formatMMK(v.priceMonth)}</td>
                        <td className="right tnum fw-6">{formatMMK(v.priceMonth * months)}</td>
                      </tr>
                    )
                  })}
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <td colSpan={4} className="right fw-7">Total</td>
                    <td className="right tnum fw-7" style={{ fontSize: 14 }}>MMK {formatMMK(live.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Payment record</h3></div>
            <div className="card-body">
              <dl className="dl">
                <dt>Status</dt><dd><StatusPill status={live.status}/></dd>
                <dt>Method</dt><dd>
                  <select value={live.method} onChange={e => updateInvoice(live.id, { method: e.target.value })} style={{ padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 4, background: 'var(--surface)', fontSize: 12 }}>
                    <option>—</option><option>KBZ Pay</option><option>AYA Bank</option><option>CB Bank</option><option>Yoma Bank</option>
                  </select>
                </dd>
                <dt>Official receipt</dt><dd className="mono">{live.receipt}</dd>
                <dt>Transaction screenshot</dt><dd>
                  {live.status !== 'Pending' && live.status !== 'Overdue'
                    ? <span className="pill subtle"><Icon name="attach" size={10}/>txn-receipt.jpg</span>
                    : <button className="btn sm" onClick={() => { updateInvoice && updateInvoice(live.id, { status: 'Customer Transferred' }); useStore().toast('Transaction screenshot uploaded', 'ok'); }}><Icon name="attach" size={11}/>Upload</button>}
                </dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3 className="card-title">Audit trail</h3></div>
            <div className="card-body" style={{ padding: '6px 18px' }}>
              {[
                ['2026-05-18 09:00', 'system', 'Invoice generated'],
                ['2026-05-18 09:01', 'Su Su', 'Invoice sent to customer (email)'],
                live.status !== 'Pending' && live.status !== 'Overdue' ? ['2026-05-21 14:32', 'Su Su', 'Transaction screenshot uploaded by customer'] : null,
                live.status === 'Payment Received' ? ['2026-05-22 10:15', 'Daw Aye', 'Payment confirmed · official receipt issued'] : null,
              ].filter((a): a is [string, string, string] => Boolean(a)).map((a, i) => (
                <div key={i} className="feed-item">
                  <span className="dot finance"/>
                  <div className="body">{a[2]}<div className="meta">{a[1]} · {a[0]}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ReportsView: React.FC = () => {
  const { state } = useStore()
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Per-customer revenue · upcoming renewals · payment performance</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Report CSV download started', 'info')}><Icon name="download" size={13}/>Export all (CSV)</button>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Revenue by customer · YTD</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Customer</th><th className="right">VMs</th><th className="right">Lifetime</th><th className="right">YTD</th></tr></thead>
              <tbody>
                {[...state.customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 6).map(c => (
                  <tr key={c.id}>
                    <td><div className="fw-6 text-sm">{c.company}</div><div className="text-xs text-mute">{c.id}</div></td>
                    <td className="right tnum">{state.vms.filter(v => v.customer === c.id).length}</td>
                    <td className="right tnum">MMK {formatMMK(c.totalSpend)}</td>
                    <td className="right tnum">MMK {formatMMK(Math.round(c.totalSpend * 0.42))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Upcoming renewals · 30 days</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>VM</th><th>Customer</th><th>Expires</th><th className="right">Renewal</th></tr></thead>
              <tbody>
                {state.vms.filter(v => v.expiry !== '—' && typeof v.expiry === 'string' && (new Date(v.expiry).getTime() - new Date('2026-05-27').getTime()) / 86400000 <= 30 && (new Date(v.expiry).getTime() - new Date('2026-05-27').getTime()) / 86400000 >= 0)
                  .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()).map(v => {
                    const c = state.customers.find(c => c.id === v.customer)
                    return (
                      <tr key={v.id}>
                        <td><div className="fw-6 text-sm">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                        <td className="text-sm">{c?.company}</td>
                        <td><ExpiryCell date={v.expiry}/></td>
                        <td className="right tnum fw-6">MMK {formatMMK(v.priceMonth * 12)}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">Payment performance · last 6 months</h3></div>
        <div className="card-body">
          <div className="flex" style={{ alignItems: 'flex-end', gap: 12, height: 160 }}>
            {[['Dec', 92], ['Jan', 88], ['Feb', 94], ['Mar', 86], ['Apr', 91], ['May', 78]].map(([m, pct]) => {
              const pctNum = Number(pct)
              return (
                <div key={m} className="flex col gap-1" style={{ flex: 1, alignItems: 'center' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${pctNum}%`, background: pctNum < 85 ? 'var(--warn)' : 'var(--ok)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: -18, left: 0, right: 0, textAlign: 'center', fontSize: 11, fontWeight: 600 }}>{pctNum}%</div>
                    </div>
                  </div>
                  <div className="text-xs text-mute">{m}</div>
                </div>
              )
            })}
          </div>
          <div className="text-xs text-mute mt-3">% of invoices paid before due date · cumulative across all customers</div>
        </div>
      </div>
    </div>
  )
}

export { FinanceView, ReportsView }
