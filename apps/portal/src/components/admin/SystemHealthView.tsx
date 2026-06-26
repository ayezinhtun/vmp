import React from 'react'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'

export const SystemHealthView: React.FC = () => {
  const { toast } = useUIStore()
  const services = [
    { name: 'API Gateway', status: 'Up', uptime: '42d 14h', latency: 18, sev: 'ok' },
    { name: 'Auth Service', status: 'Up', uptime: '42d 14h', latency: 12, sev: 'ok' },
    { name: 'VM Service', status: 'Up', uptime: '42d 14h', latency: 24, sev: 'ok' },
    { name: 'Task Service', status: 'Up', uptime: '42d 14h', latency: 8, sev: 'ok' },
    { name: 'Finance Service', status: 'Up', uptime: '42d 14h', latency: 14, sev: 'ok' },
    { name: 'Notify Service', status: 'Up', uptime: '42d 14h', latency: 30, sev: 'ok' },
    { name: 'PostgreSQL', status: 'Up', uptime: '42d 14h', latency: 3, sev: 'ok' },
    { name: 'Redis', status: 'Up', uptime: '6d 02h', latency: 1, sev: 'ok' },
    { name: 'BullMQ Worker', status: 'Up', uptime: '42d 14h', latency: 0, sev: 'ok' },
    { name: 'Email Queue', status: 'Degraded', uptime: '2h 14m', latency: 240, sev: 'warn' },
    { name: 'Backup S3', status: 'Up', uptime: '42d 14h', latency: 90, sev: 'ok' },
    { name: 'Proxmox API', status: 'Up', uptime: '42d 14h', latency: 45, sev: 'ok' },
  ]
  const nodes = [
    { name: 'pve-node-01', cpu: 32, ram: 48, vms: 4, status: 'Healthy' },
    { name: 'pve-node-02', cpu: 58, ram: 72, vms: 8, status: 'Healthy' },
    { name: 'pve-node-03', cpu: 81, ram: 88, vms: 12, status: 'High load' },
    { name: 'pve-node-04', cpu: 45, ram: 62, vms: 6, status: 'Healthy' },
    { name: 'pve-node-05', cpu: 38, ram: 51, vms: 5, status: 'Healthy' },
  ]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">System health</h1>
          <p className="page-subtitle">All services · {services.filter(s => s.sev === 'ok').length}/{services.length} healthy · last check 12s ago</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Refreshed system health (12 services checked)', 'ok')}><Icon name="refresh" size={13}/>Refresh now</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Uptime (90d)</div><div className="value tnum">99.94%</div><div className="trend"><span className="up">SLA met</span></div></div>
        <div className="metric"><div className="label">P95 latency</div><div className="value tnum">142ms</div><div className="trend">Avg 38ms · last 24h</div></div>
        <div className="metric"><div className="label">Active incidents</div><div className="value tnum" style={{ color: 'oklch(0.55 0.16 75)' }}>1</div><div className="trend">Email queue degraded</div></div>
        <div className="metric"><div className="label">Open errors (24h)</div><div className="value tnum">7</div><div className="trend">Down from 14 yesterday</div></div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Services</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Service</th><th>Status</th><th>Uptime</th><th className="right">Latency</th></tr></thead>
              <tbody>
                {services.map((s: any) => (
                  <tr key={s.name}>
                    <td className="fw-6">{s.name}</td>
                    <td><span className={`pill ${s.sev}`}><span className="dot"/>{s.status}</span></td>
                    <td className="text-sm text-mute tnum">{s.uptime}</td>
                    <td className="right tnum text-sm">{s.latency}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Proxmox nodes (cluster)</h3></div>
          <div className="card-body">
            <div className="flex col gap-3">
              {nodes.map((n: any) => (
                <div key={n.name} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                  <div className="flex center between mb-2">
                    <div className="flex center gap-2">
                      <Icon name="server" size={14}/>
                      <span className="fw-6 mono">{n.name}</span>
                    </div>
                    <span className={`pill ${n.status === 'Healthy' ? 'ok' : 'warn'}`}><span className="dot"/>{n.status}</span>
                  </div>
                  <div className="grid-3" style={{ gap: 10 }}>
                    <div>
                      <div className="text-xs text-mute mb-1">CPU · {n.cpu}%</div>
                      <div className="bar"><div className={`fill ${n.cpu > 80 ? 'warn' : ''}`} style={{ width: `${n.cpu}%` }}/></div>
                    </div>
                    <div>
                      <div className="text-xs text-mute mb-1">RAM · {n.ram}%</div>
                      <div className="bar"><div className={`fill ${n.ram > 80 ? 'warn' : ''}`} style={{ width: `${n.ram}%` }}/></div>
                    </div>
                    <div>
                      <div className="text-xs text-mute mb-1">VMs · {n.vms}</div>
                      <div className="text-sm fw-6 tnum">{n.vms} running</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Recent incidents</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Time</th><th>Service</th><th>Type</th><th>Description</th><th>Resolution</th></tr></thead>
            <tbody>
              <tr><td className="tnum text-sm">2026-05-27 14:32</td><td>Email Queue</td><td><span className="pill warn"><span className="dot"/>Degraded</span></td><td>SendGrid rate limit hit · queue depth 142</td><td className="text-sm text-mute">Investigating</td></tr>
              <tr><td className="tnum text-sm">2026-05-24 09:14</td><td>Redis</td><td><span className="pill bad"><span className="dot"/>Down</span></td><td>OOM kill triggered by retention sweep</td><td className="text-sm text-mute">Resolved (6h)</td></tr>
              <tr><td className="tnum text-sm">2026-05-20 22:01</td><td>Proxmox API</td><td><span className="pill warn"><span className="dot"/>Slow</span></td><td>Single node maintenance window</td><td className="text-sm text-mute">Planned</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
