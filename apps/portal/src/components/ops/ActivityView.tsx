import React, { useState } from 'react'
import useActivityStore from '../../store/activityStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { Avatar } from '../ui/ui'

export const ActivityView: React.FC = () => {
  const { activity } = useActivityStore()
  const { toast } = useUIStore()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const kinds = ['All', 'VM', 'Finance', 'Task', 'Alert', 'Customer']
  const map: Record<string, string> = { 'VM': 'vm', 'Finance': 'finance', 'Task': 'task', 'Alert': 'alert', 'Customer': 'customer' }
  const kindIcon: Record<string, string> = { vm: 'server', finance: 'invoice', task: 'tasks', alert: 'bell', customer: 'users' }
  const kindColor: Record<string, string> = { vm: 'var(--accent)', finance: 'var(--ok)', task: 'var(--info)', alert: 'var(--warn)', customer: 'oklch(0.55 0.17 285)' }

  const filtered = activity.filter(a => {
    if (filter !== 'All' && a.kind !== map[filter]) return false
    if (search && ![a.text, a.actor, a.kind].join(' ').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Activity log</h1>
          <p className="page-subtitle">{activity.length} events · who, what, when across the system</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Activity log exported', 'info')}><Icon name="download" size={13}/>Export</button>
        </div>
      </div>
      <div className="grid-asym">
        <div className="card">
          <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
            {kinds.map(f => {
              const cnt = f === 'All' ? activity.length : activity.filter(a => a.kind === map[f]).length
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
                      <span className="tnum fw-6 text-sm">{activity.filter(a => a.kind === k).length}</span>
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
