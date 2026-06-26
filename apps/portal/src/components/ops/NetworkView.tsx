import React from 'react'
import useVMStore from '../../store/vmStore'
import useCustomerStore from '../../store/customerStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { StatusPill } from '../ui/ui'

interface NetworkViewProps {
  openVM: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

export const NetworkView: React.FC<NetworkViewProps> = ({ openVM, openModal }) => {
  const { vms } = useVMStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const withIp = vms.filter(v => v.publicIp && v.publicIp !== '—' && v.publicIp !== 'pending')
  const ranges = [
    { range: '203.81.64.0/24', total: 256, used: withIp.length + 18, vlan: 'mixed' },
    { range: '203.81.65.0/24', total: 256, used: 32, vlan: 'reserve' },
    { range: '10.10.0.0/16', total: 65536, used: 412, vlan: 'private' },
  ]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Network & IPs</h1>
          <p className="page-subtitle">Public IP and VLAN allocation across all VMs</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('IP allocation sheet exported', 'info')}><Icon name="download" size={13}/>Export sheet</button>
          <button className="btn primary" onClick={() => openModal('reserveip')}><Icon name="plus" size={13}/>Reserve IP</button>
        </div>
      </div>

      <div className="grid-3 mb-4">
        {ranges.map(r => (
          <div className="card" key={r.range}>
            <div className="card-body">
              <div className="flex center between mb-2">
                <span className="mono fw-6">{r.range}</span>
                <span className="pill subtle">{r.vlan}</span>
              </div>
              <div className="bar"><div className="fill" style={{ width: `${(r.used / r.total) * 100}%` }}/></div>
              <div className="flex between mt-2 text-xs">
                <span className="text-mute"><span className="tnum">{r.used}</span> used</span>
                <span className="text-mute"><span className="tnum">{r.total - r.used}</span> free</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">IP & VLAN allocations</h3>
          <div className="search" style={{ width: 220 }}>
            <Icon name="search" size={13} className="search-icon"/>
            <input placeholder="IP, VM, customer…"/>
          </div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Public IP</th><th>VLAN</th><th>VM</th><th>Customer</th><th>Port forward</th><th>Firewall policy</th><th>Status</th></tr></thead>
            <tbody>
              {withIp.map(v => {
                const c = customers.find(c => c.id === v.customer)
                return (
                  <tr key={v.id} onClick={() => openVM(v.id)}>
                    <td className="mono fw-6">{v.publicIp}</td>
                    <td className="mono">{v.vlan}</td>
                    <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                    <td className="text-sm">{c?.company}</td>
                    <td className="mono text-xs">{v.portForward}</td>
                    <td className="mono text-xs">{v.firewallPolicy}</td>
                    <td><StatusPill status={v.status}/></td>
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
