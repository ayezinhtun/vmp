import React, { useState } from 'react'
import Icon from '../../lib/icons'
import { Avatar } from '../ui/ui'
import { NewTicketForm } from './NewTicketForm'

interface CustomerTicketsViewProps {
  me: any
  myTickets: any[]
  setOpenTicket: (ticket: any) => void
}

export const CustomerTicketsView: React.FC<CustomerTicketsViewProps> = ({ me, myTickets, setOpenTicket }) => {
  const [composing, setComposing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('updated')

  const statusConfig: any = {
    'Open': { color: 'oklch(0.62 0.15 230)', bg: 'var(--info-soft)', icon: 'mail', desc: 'Awaiting first response' },
    'In Progress': { color: 'oklch(0.55 0.16 75)', bg: 'var(--warn-soft)', icon: 'refresh', desc: 'Our team is working on it' },
    'Resolved': { color: 'var(--ok)', bg: 'var(--ok-soft)', icon: 'check', desc: 'Issue resolved · ready to close' },
    'Closed': { color: 'var(--ink-3)', bg: 'var(--surface-3)', icon: 'lock', desc: 'Conversation archived' },
  }

  const stats = ['Open', 'In Progress', 'Resolved', 'Closed'].map((s: string) => ({
    status: s,
    count: myTickets.filter((t: any) => t.status === s).length,
    ...statusConfig[s],
  }))

  let list = filter === 'all' ? myTickets : myTickets.filter((t: any) => t.status === filter)
  list = [...list].sort((a: any, b: any) => sort === 'updated'
    ? b.updated.localeCompare(a.updated)
    : a.priority === 'Urgent' ? -1 : 1)

  return (
    <div className="content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Support tickets</h1>
          <p className="page-subtitle">{myTickets.length} total · responses within 4 hours during business hours</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setComposing(true)}><Icon name="plus" size={13}/>New ticket</button>
        </div>
      </div>

      {/* Stat cards — IaaS style */}
      <div className="grid-4 mb-4">
        {stats.map((s: any) => {
          const active = filter === s.status
          return (
            <button
              key={s.status}
              onClick={() => setFilter(filter === s.status ? 'all' : s.status)}
              style={{
                textAlign: 'left',
                padding: 16,
                background: active ? s.bg : 'var(--surface)',
                border: '1.5px solid',
                borderColor: active ? s.color : 'var(--line)',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: 'inherit', color: 'var(--ink)',
                transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
                boxShadow: active ? `0 0 0 3px ${s.bg}` : 'none',
              }}
            >
              <div className="flex center between mb-2">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${s.color}1a`, color: s.color,
                  display: 'grid', placeItems: 'center',
                }}><Icon name={s.icon} size={14}/></div>
                {active && <Icon name="check" size={14} style={{ color: s.color }}/>}
              </div>
              <div className="tnum fw-7" style={{ fontSize: 24, lineHeight: 1.1 }}>{s.count}</div>
              <div className="fw-6 text-sm mt-1" style={{ color: s.color }}>{s.status}</div>
              <div className="text-xs text-mute mt-1">{s.desc}</div>
            </button>
          )
        })}
      </div>

      {composing && (
        <NewTicketForm me={me} onClose={() => setComposing(false)} onCreated={() => setComposing(false)}/>
      )}

      {/* Filter bar */}
      <div className="flex center between mb-3">
        <div className="flex gap-2 wrap">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All<span className="ct">{myTickets.length}</span></button>
          {['Open', 'In Progress', 'Resolved', 'Closed'].map((s: string) => (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}<span className="ct">{stats.find((x: any) => x.status === s).count}</span>
            </button>
          ))}
        </div>
        <div className="flex center gap-2">
          <span className="text-xs text-mute">Sort by</span>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12 }}>
            <option value="updated">Recently updated</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Ticket cards — IaaS style */}
      {list.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="title">No tickets {filter !== 'all' ? `in ${filter}` : 'yet'}</div>
            <div className="sub">Click "New ticket" to open one.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {list.map((t: any) => {
            const cfg = statusConfig[t.status]
            return (
              <button
                key={t.id}
                onClick={() => setOpenTicket(t)}
                style={{
                  textAlign: 'left',
                  padding: 18,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderLeft: `4px solid ${cfg.color}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: 'inherit', color: 'var(--ink)',
                  transition: 'border-color 0.15s, transform 0.1s, box-shadow 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.borderLeftColor = cfg.color; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.borderLeftColor = cfg.color; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="flex center between">
                  <div className="flex center gap-2">
                    <span className="mono text-xs text-mute">{t.id}</span>
                    <span className="pill subtle" style={{ fontSize: 10 }}>{(t.replies || []).length} {(t.replies || []).length === 1 ? 'reply' : 'replies'}</span>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 999,
                    background: cfg.bg, color: cfg.color,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color }}/>
                    {t.status}
                  </div>
                </div>
                <div>
                  <div className="fw-7 text-sm" style={{ lineHeight: 1.4 }}>{t.subject}</div>
                  <div className="text-xs text-mute mt-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{t.body}</div>
                </div>
                <div className="flex center between" style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <div className="flex center gap-2">
                    <span className={`pill ${t.priority === 'Urgent' ? 'bad' : t.priority === 'Low' ? 'subtle' : 'warn'}`} style={{ fontSize: 10 }}>
                      <span className="dot"/>{t.priority}
                    </span>
                    {t.assignee !== '—' && (
                      <div className="flex center gap-1">
                        <Avatar name={t.assignee} size={18}/>
                        <span className="text-xs">{t.assignee}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-mute">{t.updated.slice(5, 16).replace(' ', ' · ')}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
