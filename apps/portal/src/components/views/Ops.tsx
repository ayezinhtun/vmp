import React, { useState } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { StatusPill, Avatar } from '../../lib/ui'

interface TasksViewProps {
  openVM: (id: string) => void
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const TasksView: React.FC<TasksViewProps> = ({ openModal }) => {
  const { state, moveTask, deleteTask } = useStore()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [_openTask, setOpenTask] = useState<string | null>(null)

  const cols = [
    { id: 'Pending', label: 'Pending', accent: 'var(--ink-3)' },
    { id: 'In Progress', label: 'In Progress', accent: 'oklch(0.72 0.14 75)' },
    { id: 'Blocked', label: 'Blocked', accent: 'var(--bad)' },
    { id: 'Done', label: 'Done', accent: 'var(--ok)' },
  ]

  let tasks = state.tasks
  if (filter === 'urgent') tasks = tasks.filter(t => t.priority === 'Urgent')
  else if (filter === 'mine') tasks = tasks.filter(t => t.assignee === 'Ko Thein')
  else if (filter !== 'all') tasks = tasks.filter(t => t.type === filter)

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
  const onDragEnd = () => { setDragId(null); setOverCol(null) }
  const onDragOver = (e: React.DragEvent, colId: string) => { e.preventDefault(); setOverCol(colId) }
  const onDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    if (dragId) moveTask(dragId, colId)
    onDragEnd()
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Provisioning</h1>
          <p className="page-subtitle">{state.tasks.length} tasks · {state.tasks.filter(t => t.status === 'Blocked').length} blocked · {state.tasks.filter(t => t.priority === 'Urgent').length} urgent · drag cards between columns</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => openModal('newtask')}><Icon name="plus" size={13}/>New task</button>
        </div>
      </div>

      <div className="flex gap-2 mb-3 wrap">
        {[
          { id: 'all', label: 'All tasks' },
          { id: 'urgent', label: 'Urgent only' },
          { id: 'mine', label: 'Assigned to me' },
          { id: 'New', label: 'New' },
          { id: 'Renewal', label: 'Renewal' },
          { id: 'Upgrade', label: 'Upgrade' },
          { id: 'Terminate', label: 'Terminate' },
        ].map(f => (
          <button key={f.id} className={`filter-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="kanban">
        {cols.map(col => {
          const items = tasks.filter(t => t.status === col.id)
          return (
            <div key={col.id} className="kcol"
              onDragOver={e => onDragOver(e, col.id)}
              onDrop={e => onDrop(e, col.id)}
              style={{
                background: overCol === col.id ? 'var(--accent-soft)' : 'var(--surface-2)',
                borderColor: overCol === col.id ? 'var(--accent)' : 'var(--line)',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              <div className="kcol-head">
                <span className="title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: col.accent }}/>
                  {col.label}
                </span>
                <span className="count">{items.length}</span>
                <div style={{ flex: 1 }}/>
                <button className="icon-btn" title="Add task in this column" onClick={() => openModal('newtask', { status: col.id })}>
                  <Icon name="plus" size={13}/>
                </button>
              </div>
              <div className="kcol-body">
                {items.map(t => {
                  const c = state.customers.find(c => c.id === t.customer)
                  return (
                    <div key={t.id}
                      className="kcard"
                      draggable
                      onDragStart={e => onDragStart(e, t.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => setOpenTask(t.id)}
                      style={{
                        opacity: dragId === t.id ? 0.4 : 1,
                        cursor: 'grab',
                      }}>
                      <div className="flex center gap-2 mb-2">
                        <span className="id-tag">{t.id}</span>
                        {t.priority === 'Urgent' && <span className="pill bad"><span className="dot"/>Urgent</span>}
                        <span className="pill subtle">{t.type}</span>
                        {(t.notes || '').includes('Customer-initiated') && <span className="pill accent"><span className="dot"/>From customer</span>}
                        <div style={{ flex: 1 }}/>
                        <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={e => { e.stopPropagation(); deleteTask(t.id); }} title="Delete">
                          <Icon name="trash" size={11}/>
                        </button>
                      </div>
                      <div className="ttl">{t.title}</div>
                      <div className="meta">
                        <span><Icon name="building" size={11}/> {c?.company}</span>
                        {t.subscription && t.subscription !== '—' && <span><Icon name="clock" size={11}/> {t.subscription}</span>}
                      </div>
                      <div className="flex center between mt-2" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                        <div className="flex center gap-2">
                          {t.assignee !== '—'
                            ? <><Avatar name={t.assignee} size={20}/><span className="text-xs">{t.assignee}</span></>
                            : <span className="text-xs text-mute">Unassigned</span>}
                        </div>
                        <span className="text-xs text-mute">{t.team}</span>
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => openModal('newtask', { status: col.id })}
                  style={{
                    padding: '10px',
                    border: '1px dashed var(--line-strong)',
                    background: 'transparent',
                    borderRadius: 8,
                    color: 'var(--ink-3)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  <Icon name="plus" size={12}/>Add card
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ActivityView: React.FC = () => {
  const { state, toast } = useStore()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const kinds = ['All', 'VM', 'Finance', 'Task', 'Alert', 'Customer']
  const map: Record<string, string> = { 'VM': 'vm', 'Finance': 'finance', 'Task': 'task', 'Alert': 'alert', 'Customer': 'customer' }
  const kindIcon: Record<string, string> = { vm: 'server', finance: 'invoice', task: 'tasks', alert: 'bell', customer: 'users' }
  const kindColor: Record<string, string> = { vm: 'var(--accent)', finance: 'var(--ok)', task: 'var(--info)', alert: 'var(--warn)', customer: 'oklch(0.55 0.17 285)' }

  const filtered = state.activity.filter(a => {
    if (filter !== 'All' && a.kind !== map[filter]) return false
    if (search && ![a.text, a.actor, a.kind].join(' ').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Activity log</h1>
          <p className="page-subtitle">{state.activity.length} events · who, what, when across the system</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Activity log exported', 'info')}><Icon name="download" size={13}/>Export</button>
        </div>
      </div>
      <div className="grid-asym">
        <div className="card">
          <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
            {kinds.map(f => {
              const cnt = f === 'All' ? state.activity.length : state.activity.filter(a => a.kind === map[f]).length
              return (
                <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f}<span className="ct">{cnt}</span>
                </button>
              )
            })}
            <div style={{ flex: 1 }}/>
            <div className="search" style={{ width: 220 }}>
              <Icon name="search" size={13} className="search-icon"/>
              <input placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>
          <div className="card-body" style={{ padding: '6px 22px' }}>
            {filtered.map((a, i) => (
              <div key={i} onClick={() => setSelected({ ...a, _i: i })} style={{
                cursor: 'pointer',
                borderRadius: 8,
                background: selected && selected._i === i ? 'var(--accent-soft)' : 'transparent',
                transition: 'background 0.12s',
                margin: '0 -10px', padding: '0 10px',
              }}>
                <div className="feed-item">
                  <span className={`dot ${a.kind}`}/>
                  <div className="body">
                    {a.text}
                    <div className="meta">
                      <span className="fw-6">{a.actor}</span>
                      <span> · </span>
                      <span className="tnum">{a.ts}</span>
                      <span> · </span>
                      <span style={{ textTransform: 'capitalize' }}>{a.kind}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty"><div className="sub">No events for this filter.</div></div>}
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
          {selected ? (
            <>
              <div className="card-head">
                <h3 className="card-title">Event detail</h3>
                <button className="icon-btn" onClick={() => setSelected(null)}><Icon name="x" size={14}/></button>
              </div>
              <div className="card-body">
                <div className="flex center gap-3 mb-3">
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${kindColor[selected.kind]}1a`, color: kindColor[selected.kind], display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={kindIcon[selected.kind] || 'activity'} size={20}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-7" style={{ fontSize: 13.5, lineHeight: 1.4 }}>{selected.text}</div>
                  </div>
                </div>
                <div className="divider"/>
                <dl className="dl">
                  <dt>Actor</dt><dd><div className="flex center gap-2"><Avatar name={selected.actor === 'system' || selected.actor === 'cron' ? 'SY' : selected.actor} size={22}/>{selected.actor}</div></dd>
                  <dt>Category</dt><dd><span className="pill" style={{ background: `${kindColor[selected.kind]}1a`, color: kindColor[selected.kind] }}><span className="dot" style={{ background: kindColor[selected.kind] }}/><span style={{ textTransform: 'capitalize' }}>{selected.kind}</span></span></dd>
                  <dt>Timestamp</dt><dd className="tnum">{selected.ts}</dd>
                  <dt>Source</dt><dd>{selected.actor === 'cron' || selected.actor === 'system' ? 'Automated' : 'Manual action'}</dd>
                </dl>
                <div className="divider"/>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Event payload</div>
                <pre className="code" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify({ actor: selected.actor, kind: selected.kind, ts: selected.ts, message: selected.text }, null, 2)}</pre>
                <div className="divider"/>
                <div className="flex gap-2 wrap">
                  <button className="btn sm" onClick={() => toast('Opened related record', 'info')}><Icon name="external" size={11}/>View related</button>
                  <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(`${selected.ts} · ${selected.actor} · ${selected.text}`); toast('Event copied', 'ok'); }}><Icon name="file" size={11}/>Copy</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-head"><h3 className="card-title">Event categories</h3></div>
              <div className="card-body">
                <div className="flex col gap-2">
                  {['vm', 'finance', 'task', 'alert', 'customer'].map(k => (
                    <div key={k} className="flex center between" style={{ padding: '6px 0' }}>
                      <span className="flex center gap-2 text-sm">
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: `${kindColor[k]}1a`, color: kindColor[k], display: 'grid', placeItems: 'center' }}><Icon name={kindIcon[k]} size={13}/></span>
                        <span style={{ textTransform: 'capitalize' }}>{k}</span>
                      </span>
                      <span className="tnum fw-6 text-sm">{state.activity.filter(a => a.kind === k).length}</span>
                    </div>
                  ))}
                </div>
                <div className="divider"/>
                <div className="text-xs text-mute" style={{ textAlign: 'center' }}>Select an event to see details</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const AlertsView: React.FC = () => {
  const { state, markAlertRead, markAllAlertsRead, toast } = useStore()
  const [filter, setFilter] = useState('All')
  const [sev, setSev] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ d30: true, d7: true, d1: true, d0: true, grace: false, email: true, inapp: true, teams: false })
  const togglePref = (k: string) => setPrefs(p => ({ ...p, [k]: !p[k] }))
  const sevColor: Record<string, string> = { urgent: 'var(--bad)', warn: 'var(--warn)', info: 'var(--info)' }
  const sevLabel: Record<string, string> = { urgent: 'Urgent', warn: 'Warning', info: 'Info' }
  const typeIcon: Record<string, string> = { expiry: 'clock', kyc: 'shield', finance: 'invoice', task: 'tasks', system: 'settings', vm: 'server' }

  const filtered = state.alerts.filter(a => {
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
          <p className="page-subtitle">{state.alerts.filter(a => !a.read).length} unread · {state.alerts.filter(a => a.sev === 'urgent').length} urgent · {state.alerts.length} total</p>
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
              const cnt = f === 'All' ? state.alerts.length : f === 'Unread' ? state.alerts.filter(a => !a.read).length : state.alerts.filter(a => a.type === f.toLowerCase()).length
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

interface NetworkViewProps {
  openVM: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const NetworkView: React.FC<NetworkViewProps> = ({ openVM, openModal }) => {
  const { state } = useStore()
  const withIp = state.vms.filter(v => v.publicIp && v.publicIp !== '—' && v.publicIp !== 'pending')
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
          <button className="btn" onClick={() => useStore().toast('IP allocation sheet exported', 'info')}><Icon name="download" size={13}/>Export sheet</button>
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
                const c = state.customers.find(c => c.id === v.customer)
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

export { TasksView, ActivityView, AlertsView, NetworkView }
