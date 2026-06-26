import React, { useState, useMemo } from 'react'
import useUIStore from '../../store/uiStore'
import useActivityStore from '../../store/activityStore'
import Icon from '../../lib/icons'
import { Avatar } from '../ui/ui'

export const AuditLogView: React.FC = () => {
  const { activity } = useActivityStore()
  const { toast } = useUIStore()
  const [actor, setActor] = useState('All')
  const [action, setAction] = useState('All')
  const [search, setSearch] = useState('')

  const auditData = useMemo(() => {
    const ev = [
      ...activity,
      { ts: '2026-05-27 08:12', actor: 'Min Khant', kind: 'auth', text: 'Admin login from 203.81.64.10' },
      { ts: '2026-05-27 07:55', actor: 'Daw Aye', kind: 'auth', text: 'Login from new device (Chrome/Mac)' },
      { ts: '2026-05-26 18:42', actor: 'Ko Thein', kind: 'creds', text: 'Revealed credentials for VM-2087 (root)' },
      { ts: '2026-05-26 11:30', actor: 'Min Khant', kind: 'role', text: 'Changed role of U-03 from Engineer → Sales' },
      { ts: '2026-05-25 22:14', actor: 'system', kind: 'auth', text: 'Failed login attempt #3 for kothein@vpsmm.co — IP blocked 1h' },
      { ts: '2026-05-25 14:00', actor: 'Min Khant', kind: 'settings', text: 'Updated SMTP host: smtp-old → smtp.sendgrid.net' },
      { ts: '2026-05-24 16:18', actor: 'Su Su', kind: 'export', text: 'Exported customers.csv (10 records)' },
    ]
    return ev
  }, [activity])

  const actors = ['All', ...new Set(auditData.map((a: any) => a.actor))]
  const actions = ['All', 'vm', 'finance', 'customer', 'task', 'alert', 'auth', 'creds', 'role', 'settings', 'export']

  const filtered = auditData.filter((a: any) => {
    if (actor !== 'All' && a.actor !== actor) return false
    if (action !== 'All' && a.kind !== action) return false
    if (search && !a.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Audit log</h1>
          <p className="page-subtitle">Every action across the system, including auth events and credential access. Retained 90 days.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Audit log exported (CSV)', 'info')}><Icon name="download" size={13}/>Export (CSV)</button>
        </div>
      </div>
      <div className="card">
        <div className="filter-bar">
          <select value={actor} onChange={e => setActor(e.target.value)} style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12 }}>
            {actors.map((a: any) => <option key={a}>{a}</option>)}
          </select>
          <select value={action} onChange={e => setAction(e.target.value)} style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12 }}>
            {actions.map((a: any) => <option key={a}>{a}</option>)}
          </select>
          <div style={{ flex: 1 }}/>
          <div className="search" style={{ width: 240 }}>
            <Icon name="search" size={13} className="search-icon"/>
            <input placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Timestamp</th><th>Actor</th><th>Type</th><th>Event</th></tr></thead>
            <tbody>
              {filtered.map((a: any, i: number) => (
                <tr key={i}>
                  <td className="tnum text-sm" style={{ whiteSpace: 'nowrap' }}>{a.ts}</td>
                  <td>
                    <div className="flex center gap-2">
                      {a.actor !== 'system' && a.actor !== 'cron' && <Avatar name={a.actor} size={22}/>}
                      <span className="fw-6 text-sm">{a.actor}</span>
                    </div>
                  </td>
                  <td><span className="pill subtle" style={{ textTransform: 'capitalize' }}>{a.kind}</span></td>
                  <td className="text-sm">{a.text}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4}><div className="empty"><div className="sub">No matching events.</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
