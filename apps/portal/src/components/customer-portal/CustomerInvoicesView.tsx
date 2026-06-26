import React from 'react'
import { StatusPill, formatMMK } from '../ui/ui'
import Icon from '../../lib/icons'
import useUIStore from '../../store/uiStore'

interface CustomerInvoicesViewProps {
  myInvs: any[]
  setDetailInvoice: (invoice: any) => void
}

export const CustomerInvoicesView: React.FC<CustomerInvoicesViewProps> = ({ myInvs, setDetailInvoice }) => {
  const { toast } = useUIStore()
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Invoices & receipts</h1>
          <p className="page-subtitle">{myInvs.length} invoices · click any row to view full details</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Invoice</th><th>VMs</th><th>Issued</th><th>Due</th><th className="right">Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {myInvs.map((i: any) => (
                <tr key={i.id} onClick={() => setDetailInvoice(i)}>
                  <td className="mono">{i.id}</td>
                  <td><div className="flex gap-1 wrap">{i.vms.map((v: string) => <span key={v} className="id-tag">{v}</span>)}</div></td>
                  <td className="tnum text-sm">{i.issued}</td>
                  <td className="tnum text-sm">{i.due}</td>
                  <td className="right tnum fw-6">MMK {formatMMK(i.amount)}</td>
                  <td><StatusPill status={i.status}/></td>
                  <td className="right" onClick={e => e.stopPropagation()}>
                    <button className="btn sm" onClick={() => toast(`Downloaded ${i.id}.pdf`, 'info')}><Icon name="download" size={11}/>PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
