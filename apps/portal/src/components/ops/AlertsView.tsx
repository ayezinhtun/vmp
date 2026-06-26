import React, { useState } from 'react'
import useAlertStore from '../../store/alertStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'

export const AlertsView: React.FC = () => {
  const { alerts, markAlertRead, markAllAlertsRead } = useAlertStore()
  const { toast } = useUIStore()
  const [filter, setFilter] = useState('All')
  const [sev, setSev] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ d30: true, d7: true, d1: true, d0: true, grace: false, email: true, inapp: true, teams: false })
  const togglePref = (k: string) => setPrefs(p => ({ ...p, [k]: !p[k] }))
  const sevColor: Record<string, string> = { urgent: 'var(--bad)', warn: 'var(--warn)', info: 'var(--info)' }
  const sevLabel: Record<string, string> = { urgent: 'Urgent', warn: 'Warning', info: 'Info' }
  const typeIcon: Record<string, string> = { expiry: 'clock', kyc: 'shield', finance: 'invoice', task: 'tasks', system: 'settings', vm: 'server' }

  const filtered = alerts.filter(a => {
    if (filter === 'Unread' && a.read) return false
    if (filter !== 'All' && filter !== 'Unread' && a.type !== filter.toLowerCase()) return false
    if (sev !== 'All' && a.sev !== sev) return false
    if (search && ![a.title, a.body, a.type].join(' ').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const open = (a: any) => { markAlertRead(a.id); setSelected(a) }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{alerts.filter(a => !a.read).length} unread · {alerts.filter(a => a.sev === 'urgent').length} urgent · {alerts.length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={markAllAlertsRead}><Icon name="check" size={13}/>Mark all read</button>
          <button className="btn" onClick={() => toast('Notification settings opened', 'info')}><Icon name="settings" size={13}/>Settings</button>
        </div>
      </div>

      <div className="grid-asym">
        <div className="card">
          <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
            {['All', 'Unread', 'Expiry', 'Kyc', 'Finance', 'Task'].map(f => {
              const cnt = f === 'All' ? alerts.length : f === 'Unread' ? alerts.filter(a => !a.read).length : alerts.filter(a => a.type === f.toLowerCase()).length
              return (
                <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'Kyc' ? 'KYC' : f}<span className="ct">{cnt}</span>
                </button>
              )
            })}
            <div style={{ flex: 1 }}/>
            <div className="search" style={{ width: 200 }}>
              <Icon name="search" size={13} className="search-icon"/>
              <input placeholder="Search notifications…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>
          <div className="filter-bar" style={{ paddingTop: 8, paddingBottom: 8, gap: 6 }}>
            <span className="text-xs text-mute fw-6" style={{ letterSpacing: '0.04em', textTransform: 'uppercase', marginRight: 4 }}>Severity</span>
            {['All', 'urgent', 'warn', 'info'].map(s => (
              <button key={s} className={`filter-chip ${sev === s ? 'active' : ''}`} onClick={() => setSev(s)}>
                {s !== 'All' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: sevColor[s] }}/>}
                {s === 'All' ? 'All' : sevLabel[s]}
              </button>
            ))}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {filtered.map(a => (
              <div key={a.id} onClick={() => open(a)} style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                gap: 12,
                background: selected?.id === a.id ? 'var(--accent-soft)' : !a.read ? 'var(--surface-2)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `${sevColor[a.sev]}1a`, color: sevColor[a.sev],
                  display: 'grid', placeItems: 'center', marginTop: 1,
                }}>
                  <Icon name={typeIcon[a.type] || 'bell'} size={14}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex center between">
                    <span className="fw-6 text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                    <span className="text-xs text-mute" style={{ flexShrink: 0, marginLeft: 8 }}>{a.ts}</span>
                  </div>
                  <div className="text-sm text-mute mt-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.body}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="pill subtle" style={{ textTransform: 'capitalize' }}>{a.type}</span>
                    <span className="pill" style={{ background: `${sevColor[a.sev]}1a`, color: sevColor[a.sev] }}><span className="dot" style={{ background: sevColor[a.sev] }}/>{sevLabel[a.sev]}</span>
                    {!a.read && <span className="pill accent"><span className="dot"/>Unread</span>}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty"><div className="title">All clear</div><div className="sub">No notifications match these filters.</div></div>}
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
          {selected ? (
            <>
              <div className="card-head">
                <h3 className="card-title">Notification detail</h3>
                <button className="icon-btn" onClick={() => setSelected(null)}><Icon name="x" size={14}/></button>
              </div>
              <div className="card-body">
                <div className="flex center gap-3 mb-3">
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${sevColor[selected.sev]}1a`, color: sevColor[selected.sev], display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={typeIcon[selected.type] || 'bell'} size={20}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-7" style={{ fontSize: 14, lineHeight: 1.3 }}>{selected.title}</div>
                    <div className="text-xs text-mute mt-1">{selected.ts}</div>
                  </div>
                </div>
                <div className="text-sm" style={{ lineHeight: 1.6 }}>{selected.body}</div>
                <div className="divider"/>
                <dl className="dl">
                  <dt>Severity</dt><dd><span className="pill" style={{ background: `${sevColor[selected.sev]}1a`, color: sevColor[selected.sev] }}><span className="dot" style={{ background: sevColor[selected.sev] }}/>{sevLabel[selected.sev]}</span></dd>
                  <dt>Category</dt><dd style={{ textTransform: 'capitalize' }}>{selected.type}</dd>
                  <dt>Received</dt><dd>{selected.ts}</dd>
                  <dt>Status</dt><dd><span className="pill ok"><span className="dot"/>Read</span></dd>
                </dl>
                <div className="divider"/>
                <div className="flex gap-2 wrap">
                  <button className="btn sm" onClick={() => toast('Opened related record', 'info')}><Icon name="external" size={11}/>View related</button>
                  <button className="btn sm" onClick={() => toast('Snoozed for 1 day', 'info')}><Icon name="clock" size={11}/>Snooze</button>
                  <button className="btn sm" onClick={() => { setSelected(null); toast('Dismissed', 'info'); }}><Icon name="check" size={11}/>Dismiss</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-head"><h3 className="card-title">Notification preferences</h3></div>
              <div className="card-body">
                <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Expiry alerts</div>
                <div className="mt-3 flex col gap-2">
                  {[['d30', '30 days before'], ['d7', '7 days before'], ['d1', '1 day before'], ['d0', 'On expiry day'], ['grace', 'After expiry (grace)']].map(([k, l]) => (
                    <div key={k} className="flex center between"><span className="text-sm">{l}</span><span className={`toggle ${prefs[k] ? 'on' : ''}`} onClick={() => togglePref(k)}/></div>
                  ))}
                </div>
                <div className="divider"/>
                <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Delivery</div>
                <div className="mt-3 flex col gap-2">
                  {[['email', 'Email'], ['inapp', 'In-app'], ['teams', 'MS Teams webhook']].map(([k, l]) => (
                    <div key={k} className="flex center between"><span className="text-sm">{l}</span><span className={`toggle ${prefs[k] ? 'on' : ''}`} onClick={() => togglePref(k)}/></div>
                  ))}
                </div>
                <div className="divider"/>
                <div className="text-xs text-mute" style={{ textAlign: 'center' }}>Select a notification to see details</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
