import React from 'react'
import useInvoiceStore from '../../store/invoiceStore'
import useCustomerStore from '../../store/customerStore'
import useVMStore from '../../store/vmStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { StatusPill, formatMMK } from '../ui/ui'

interface InvoiceDrawerProps {
  invoice: any
  onClose: () => void
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

export const InvoiceDrawer: React.FC<InvoiceDrawerProps> = ({ invoice, onClose, openCust, openModal }) => {
  const { invoices, markPaid, updateInvoice } = useInvoiceStore()
  const { customers } = useCustomerStore()
  const { vms } = useVMStore()
  const { toast } = useUIStore()
  const c = customers.find(c => c.id === invoice.customer)
  if (!c) return null
  const live = invoices.find(i => i.id === invoice.id) || invoice

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
              <button className="btn" onClick={() => toast(`Downloaded ${live.id}.pdf`, 'info')}><Icon name="download" size={12}/>PDF</button>
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
                    : <button className="btn sm" onClick={() => { updateInvoice && updateInvoice(live.id, { status: 'Customer Transferred' }); toast('Transaction screenshot uploaded', 'ok'); }}><Icon name="attach" size={11}/>Upload</button>}
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
