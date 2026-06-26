import React, { useState } from 'react'
import useVMStore from '../../store/vmStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'

export const BackupCenterView: React.FC = () => {
  const { vms } = useVMStore()
  const { toast } = useUIStore()
  const [tab, setTab] = useState('snapshots')
  const allSnapshots = vms.filter((v: any) => v.backup && v.backup !== 'None').flatMap((v: any) =>
    [1, 2, 3, 4].map((i: number) => ({
      id: `snap-${v.id.slice(3)}-${i}`,
      vm: v,
      created: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      size: (3 + Math.random() * 2).toFixed(1),
      type: i === 1 ? 'Daily' : i === 2 ? 'Daily' : i === 3 ? 'Daily' : 'Weekly',
    }))
  ).slice(0, 24)
  const totalSize = allSnapshots.reduce((a: number, s: any) => a + +s.size, 0)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Backup & restore</h1>
          <p className="page-subtitle">{allSnapshots.length} snapshots across {new Set(allSnapshots.map((s: any) => s.vm.id)).size} VMs · {totalSize.toFixed(1)} GB total</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Backup job queued for all VMs', 'info')}><Icon name="refresh" size={13}/>Run backup now</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Backups today</div><div className="value tnum">{vms.filter((v: any) => v.backup && v.backup !== 'None').length}</div><div className="trend">All successful</div></div>
        <div className="metric"><div className="label">Storage used</div><div className="value tnum">2.4 TB</div><div className="trend">of 10 TB</div></div>
        <div className="metric"><div className="label">Avg size</div><div className="value tnum">4.2 GB</div><div className="trend">per snapshot</div></div>
        <div className="metric"><div className="label">RPO target</div><div className="value tnum">24h</div><div className="trend">Met across all VMs</div></div>
      </div>

      <div className="card">
        <div className="tabs">
          <button className={`tab ${tab === 'snapshots' ? 'active' : ''}`} onClick={() => setTab('snapshots')}>Snapshots<span className="count">{allSnapshots.length}</span></button>
          <button className={`tab ${tab === 'schedules' ? 'active' : ''}`} onClick={() => setTab('schedules')}>Schedules</button>
          <button className={`tab ${tab === 'restore' ? 'active' : ''}`} onClick={() => setTab('restore')}>Restore history</button>
        </div>
        {tab === 'snapshots' && (
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Snapshot ID</th><th>VM</th><th>Created</th><th className="right">Size</th><th>Type</th><th></th></tr></thead>
              <tbody>
                {allSnapshots.map((s: any) => (
                  <tr key={s.id}>
                    <td className="mono text-xs">{s.id}</td>
                    <td><div className="fw-6">{s.vm.name}</div><div className="text-xs text-mute mono">{s.vm.id}</div></td>
                    <td className="tnum text-sm">{s.created}</td>
                    <td className="right tnum text-sm">{s.size} GB</td>
                    <td><span className="pill subtle">{s.type}</span></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => toast(`Restoring ${s.id}…`, 'info')}>Restore</button>
                      <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => toast('Snapshot deleted', 'bad')}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'schedules' && (
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>VM</th><th>Schedule</th><th>Retention</th><th>Next run</th><th></th></tr></thead>
              <tbody>
                {vms.filter((v: any) => v.backup && v.backup !== 'None').map((v: any) => (
                  <tr key={v.id}>
                    <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                    <td className="text-sm">{v.backup}</td>
                    <td className="text-sm text-mute">7-30 days</td>
                    <td className="tnum text-sm">Tomorrow 02:00</td>
                    <td className="right"><button className="btn sm" onClick={() => toast('Schedule editor opened', 'info')}><Icon name="edit" size={11}/>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'restore' && (
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Snapshot</th><th>VM</th><th>Restored by</th><th>Result</th></tr></thead>
              <tbody>
                <tr><td className="tnum text-sm">2026-05-24 09:20</td><td className="mono text-xs">snap-2087-3</td><td className="fw-6">mlc-erp-prod-01</td><td className="text-sm">Ko Thein</td><td><span className="pill ok"><span className="dot"/>Success</span></td></tr>
                <tr><td className="tnum text-sm">2026-04-30 14:08</td><td className="mono text-xs">snap-2091-1</td><td className="fw-6">yfg-app-01</td><td className="text-sm">Ko Thein</td><td><span className="pill ok"><span className="dot"/>Success</span></td></tr>
                <tr><td className="tnum text-sm">2026-04-18 08:42</td><td className="mono text-xs">snap-2095-2</td><td className="fw-6">npd-staging</td><td className="text-sm">Aye Chan</td><td><span className="pill ok"><span className="dot"/>Success</span></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
