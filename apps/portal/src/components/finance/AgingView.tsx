import React from 'react'
import useInvoiceStore from '../../store/invoiceStore'
import useCustomerStore from '../../store/customerStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { StatusPill, formatMMK } from '../ui/ui'

export const AgingView: React.FC = () => {
  const { invoices, markPaid } = useInvoiceStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const TODAY = (window as any).MOCK.TODAY
  const buckets: Record<string, any[]> = { current: [], '0-30': [], '31-60': [], '61-90': [], '90+': [] }
  invoices.filter((i: any) => i.status !== 'Payment Received').forEach((i: any) => {
    const days = Math.ceil((TODAY.getTime() - new Date(i.due).getTime()) / 86400000)
    if (days < 0) buckets.current.push({ ...i, days })
    else if (days <= 30) buckets['0-30'].push({ ...i, days })
    else if (days <= 60) buckets['31-60'].push({ ...i, days })
    else if (days <= 90) buckets['61-90'].push({ ...i, days })
    else buckets['90+'].push({ ...i, days })
  })
  const total = (b: any[]) => b.reduce((a: number, i: any) => a + i.amount, 0)
  const all = [...buckets.current, ...buckets['0-30'], ...buckets['31-60'], ...buckets['61-90'], ...buckets['90+']]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Aging receivables</h1>
          <p className="page-subtitle">{all.length} unpaid invoices · MMK {formatMMK(total(all))} outstanding</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Aging report exported', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => toast(`Sent ${all.length} payment reminders`, 'ok')}><Icon name="mail" size={13}/>Bulk reminder</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Current</div><div className="value tnum" style={{ fontSize: 18, color: 'var(--ok)' }}>MMK {formatMMK(total(buckets.current))}</div><div className="trend">{buckets.current.length} invoices</div></div>
        <div className="metric"><div className="label">0–30 days</div><div className="value tnum" style={{ fontSize: 18, color: 'oklch(0.55 0.16 75)' }}>MMK {formatMMK(total(buckets['0-30']))}</div><div className="trend">{buckets['0-30'].length} invoices</div></div>
        <div className="metric"><div className="label">31–60 days</div><div className="value tnum" style={{ fontSize: 18, color: 'oklch(0.55 0.16 35)' }}>MMK {formatMMK(total(buckets['31-60']))}</div><div className="trend">{buckets['31-60'].length} invoices</div></div>
        <div className="metric"><div className="label">90+ days</div><div className="value tnum" style={{ fontSize: 18, color: 'var(--bad)' }}>MMK {formatMMK(total(buckets['90+']) + total(buckets['61-90']))}</div><div className="trend">{buckets['90+'].length + buckets['61-90'].length} invoices</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">All unpaid invoices</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th>Age</th><th className="right">Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {all.map((i: any) => {
                const c = customers.find((c: any) => c.id === i.customer)
                const bucket = i.days < 0 ? 'Current' : i.days <= 30 ? '0-30d' : i.days <= 60 ? '31-60d' : i.days <= 90 ? '61-90d' : '90+d'
                const color = i.days < 0 ? 'ok' : i.days <= 30 ? 'warn' : 'bad'
                return (
                  <tr key={i.id}>
                    <td className="mono fw-6">{i.id}</td>
                    <td><div className="fw-6 text-sm">{c?.company}</div></td>
                    <td className="tnum text-sm">{i.due}</td>
                    <td><span className={`pill ${color}`}><span className="dot"/>{bucket}</span></td>
                    <td className="right tnum fw-6">MMK {formatMMK(i.amount)}</td>
                    <td><StatusPill status={i.status}/></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => toast(`Reminder sent to ${c?.company}`, 'info')}>Remind</button>
                      <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => markPaid(i.id)}>Mark paid</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
