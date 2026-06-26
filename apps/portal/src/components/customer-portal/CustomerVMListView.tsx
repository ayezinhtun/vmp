import React from 'react'
import { StatusPill, ExpiryCell } from '../ui/ui'
import Icon from '../../lib/icons'

interface CustomerVMListViewProps {
  myVMs: any[]
  setDetailVm: (vm: any) => void
  setRenewVm: (vm: any) => void
}

export const CustomerVMListView: React.FC<CustomerVMListViewProps> = ({ myVMs, setDetailVm, setRenewVm }) => (
  <div className="content">
    <div className="page-head">
      <div>
        <h1 className="page-title">My VMs</h1>
        <p className="page-subtitle">{myVMs.length} virtual machines · click any row to see details and control</p>
      </div>
    </div>
    <div className="grid-3 mb-4">
      <div className="metric"><div className="label">Active</div><div className="value tnum">{myVMs.filter((v: any) => v.status === 'Active').length}</div></div>
      <div className="metric"><div className="label">Total vCPU</div><div className="value tnum">{myVMs.reduce((a: number, v: any) => a + (v.status === 'Active' ? v.vcpu : 0), 0)}</div></div>
      <div className="metric"><div className="label">Total RAM</div><div className="value tnum">{myVMs.reduce((a: number, v: any) => a + (v.status === 'Active' ? v.ram : 0), 0)} <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>GB</span></div></div>
    </div>
    <div className="card">
      <div className="card-body flush">
        <table className="tbl">
          <thead><tr><th>VM</th><th>Status</th><th>Power</th><th>Spec</th><th>Public IP</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {myVMs.map((v: any) => (
              <tr key={v.id} onClick={() => setDetailVm(v)}>
                <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                <td><StatusPill status={v.status}/></td>
                <td><span className="pill"><Icon name={v.powerState === 'Running' ? 'play' : 'pause'} size={10}/>{v.powerState}</span></td>
                <td className="mono text-xs">{v.vcpu}c · {v.ram}GB · {v.storage}GB</td>
                <td className="mono">{v.publicIp}</td>
                <td><ExpiryCell date={v.expiry}/></td>
                <td className="right" onClick={e => e.stopPropagation()}>
                  <button className="btn sm" onClick={() => setRenewVm(v)}><Icon name="refresh" size={11}/>Renew</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)
