import React from 'react'
import useCustomerStore from '../../store/customerStore'
import useVMStore from '../../store/vmStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { formatMMK, ExpiryCell } from '../ui/ui'

export const ReportsView: React.FC = () => {
  const { customers } = useCustomerStore()
  const { vms } = useVMStore()
  const { toast } = useUIStore()
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Per-customer revenue · upcoming renewals · payment performance</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Report CSV download started', 'info')}><Icon name="download" size={13}/>Export all (CSV)</button>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Revenue by customer · YTD</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Customer</th><th className="right">VMs</th><th className="right">Lifetime</th><th className="right">YTD</th></tr></thead>
              <tbody>
                {[...customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 6).map(c => (
                  <tr key={c.id}>
                    <td><div className="fw-6 text-sm">{c.company}</div><div className="text-xs text-mute">{c.id}</div></td>
                    <td className="right tnum">{vms.filter(v => v.customer === c.id).length}</td>
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
                {vms.filter(v => v.expiry !== '—' && typeof v.expiry === 'string' && (new Date(v.expiry).getTime() - new Date('2026-05-27').getTime()) / 86400000 <= 30 && (new Date(v.expiry).getTime() - new Date('2026-05-27').getTime()) / 86400000 >= 0)
                  .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()).map(v => {
                    const c = customers.find(c => c.id === v.customer)
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
