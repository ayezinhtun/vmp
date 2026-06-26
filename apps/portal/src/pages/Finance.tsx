import React, { useState } from 'react'
import useInvoiceStore from '../store/invoiceStore'
import useCustomerStore from '../store/customerStore'
import useVMStore from '../store/vmStore'
import useUIStore from '../store/uiStore'
import Icon from '../lib/icons'
import { StatusPill, formatMMK } from '../components/ui/ui'
import { InvoiceDrawer } from '../components/finance/InvoiceDrawer'
import { ReportsView } from '../components/finance/ReportsView'

interface FinanceViewProps {
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const FinanceView: React.FC<FinanceViewProps> = ({ openCust, openModal }) => {
  const { invoices, markPaid } = useInvoiceStore()
  const { customers } = useCustomerStore()
  const { vms } = useVMStore()
  const { toast } = useUIStore()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)

  const filters = [
    { id: 'all', label: 'All', count: invoices.length },
    { id: 'Pending', label: 'Pending', count: invoices.filter(i => i.status === 'Pending').length },
    { id: 'Customer Transferred', label: 'Customer Transferred', count: invoices.filter(i => i.status === 'Customer Transferred').length },
    { id: 'Payment Received', label: 'Payment Received', count: invoices.filter(i => i.status === 'Payment Received').length },
    { id: 'Overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'Overdue').length },
  ]

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)

  const total = invoices.reduce((a, i) => a + i.amount, 0)
  const received = invoices.filter(i => i.status === 'Payment Received').reduce((a, i) => a + i.amount, 0)
  const pending = invoices.filter(i => i.status === 'Pending' || i.status === 'Customer Transferred').reduce((a, i) => a + i.amount, 0)
  const overdue = invoices.filter(i => i.status === 'Overdue').reduce((a, i) => a + i.amount, 0)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{invoices.length} invoices · MMK {formatMMK(total)} total billed</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Invoices CSV download started', 'info')}><Icon name="download" size={13}/>Export</button>
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
              const c = customers.find(c => c.id === i.customer)
              return (
                <tr key={i.id} onClick={() => setSelected(i)}>
                  <td className="mono fw-6">{i.id}</td>
                  <td><div className="fw-6 text-sm">{c?.company}</div><div className="text-xs text-mute">{c?.name}</div></td>
                  <td>
                    <div className="flex gap-1 wrap">
                      {i.vms.map((vmId: string) => {
                        const vm = vms.find(v => v.id === vmId)
                        return vm ? (
                          <span key={vmId} className="id-tag" title={`${vm.vcpu}c · ${vm.ram}GB · ${vm.storage}GB`}>
                            {vmId}
                          </span>
                        ) : (
                          <span key={vmId} className="id-tag">{vmId}</span>
                        )
                      })}
                    </div>
                  </td>
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

export { FinanceView, ReportsView }
