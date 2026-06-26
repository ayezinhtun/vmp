import React from 'react'
import useVMStore from '../../store/vmStore'
import useCustomerStore from '../../store/customerStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { formatMMK } from '../ui/ui'

export const RecurringView: React.FC = () => {
  const { vms } = useVMStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const cycles = vms.filter((v: any) => v.status === 'Active').map((v: any) => {
    const c = customers.find((c: any) => c.id === v.customer)
    return {
      ...v,
      customerName: c?.company,
      nextBill: (() => { const d = new Date(v.expiry); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })(),
      autoRenew: true,
    }
  })

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Recurring billing</h1>
          <p className="page-subtitle">{cycles.length} active subscriptions · MMK {formatMMK(cycles.reduce((a: number, v: any) => a + v.priceMonth, 0))} monthly recurring</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Billing schedule exported', 'info')}><Icon name="download" size={13}/>Export schedule</button>
          <button className="btn primary" onClick={() => toast(`Generated ${cycles.length} invoices for next cycle`, 'ok')}><Icon name="refresh" size={13}/>Generate invoices</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">MRR</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.reduce((a: number, v: any) => a + v.priceMonth, 0))}</div></div>
        <div className="metric"><div className="label">ARR (projected)</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.reduce((a: number, v: any) => a + v.priceMonth, 0) * 12)}</div></div>
        <div className="metric"><div className="label">Auto-renew on</div><div className="value tnum">{cycles.length}</div><div className="trend">All subscriptions</div></div>
        <div className="metric"><div className="label">Next 7 days billing</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.filter((v: any) => { const d = (new Date(v.nextBill).getTime() - (window as any).MOCK.TODAY.getTime()) / 86400000; return d >= 0 && d <= 7; }).reduce((a: number, v: any) => a + v.priceMonth, 0))}</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Billing schedule</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>VM</th><th>Customer</th><th className="right">Monthly</th><th>Next bill</th><th>Renewal</th><th>Auto-renew</th><th></th></tr></thead>
            <tbody>
              {cycles.sort((a: any, b: any) => new Date(a.nextBill).getTime() - new Date(b.nextBill).getTime()).map((v: any) => (
                <tr key={v.id}>
                  <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                  <td className="text-sm">{v.customerName}</td>
                  <td className="right tnum">MMK {formatMMK(v.priceMonth)}</td>
                  <td className="tnum text-sm">{v.nextBill}</td>
                  <td className="tnum text-sm">{v.expiry}</td>
                  <td><span className="toggle on"/></td>
                  <td className="right"><button className="btn sm" onClick={() => toast(`Invoice generated for ${v.name}`, 'ok')}>Bill now</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
