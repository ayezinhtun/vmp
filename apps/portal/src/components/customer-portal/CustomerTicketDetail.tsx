import React, { useState, useEffect } from 'react'
import useTicketStore from '../../store/ticketStore'
import useCustomerStore from '../../store/customerStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { Avatar, StatusPill } from '../ui/ui'

interface CustomerTicketDetailProps {
  ticket: any
  onClose: () => void
}

export const CustomerTicketDetail: React.FC<CustomerTicketDetailProps> = ({ ticket: initial, onClose }) => {
  const { tickets, updateTicket, deleteTicket } = useTicketStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const ticket = tickets.find((t: any) => t.id === initial.id) || initial
  const [reply, setReply] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ subject: ticket.subject, body: ticket.body, priority: ticket.priority })

  useEffect(() => {
    setDraft({ subject: ticket.subject, body: ticket.body, priority: ticket.priority })
  }, [ticket.id])

  const sendReply = () => {
    if (!reply.trim()) return
    const customerName = customers.find((c: any) => c.id === ticket.customer)?.name || 'You'
    updateTicket(ticket.id, { replies: [...(ticket.replies || []), { who: customerName, when: new Date().toISOString().slice(0, 10), body: reply }] })
    toast('Reply sent', 'ok')
    setReply('')
  }

  const setTicketStatus = (id: string, status: string) => {
    updateTicket(id, { status })
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to tickets</button>
            <span className="mono text-xs text-mute">{ticket.id}</span>
          </div>
          {editing ? (
            <input value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} style={{ fontSize: 22, fontWeight: 700, padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 6, width: 540 }}/>
          ) : <h1 className="page-title">{ticket.subject}</h1>}
          <div className="flex gap-2 mt-2">
            <StatusPill status={ticket.status}/>
            <span className={`pill ${ticket.priority === 'Urgent' ? 'bad' : ticket.priority === 'Low' ? 'subtle' : 'warn'}`}><span className="dot"/>{ticket.priority}</span>
            <span className="pill subtle">Opened {ticket.created}</span>
            {ticket.assignee !== '—' && <span className="pill subtle">Assigned: {ticket.assignee}</span>}
          </div>
        </div>
        <div className="page-actions">
          {!editing && <button className="btn" onClick={() => setEditing(true)}><Icon name="edit" size={12}/>Edit</button>}
          {editing && <><button className="btn ghost" onClick={() => { setDraft({ subject: ticket.subject, body: ticket.body, priority: ticket.priority }); setEditing(false) }}>Cancel</button><button className="btn accent" onClick={() => { updateTicket(ticket.id, draft); setEditing(false); toast('Ticket updated', 'ok') }}><Icon name="check" size={12}/>Save</button></>}
          {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Resolved')}><Icon name="check" size={12}/>Mark resolved</button>}
          {ticket.status === 'Resolved' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Closed')}>Close ticket</button>}
          <button className="btn danger" onClick={() => { if (confirm('Delete this ticket?')) { deleteTicket(ticket.id); onClose() } }}><Icon name="trash" size={12}/></button>
        </div>
      </div>

      <div className="grid-asym">
        {/* Conversation */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Conversation</h3>
            <span className="text-xs text-mute">{(ticket.replies || []).length + 1} message{(ticket.replies || []).length === 0 ? '' : 's'}</span>
          </div>
          <div className="card-body">
            {/* Original */}
            <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
              <div className="flex center gap-2 mb-2">
                <Avatar name={customers.find((c: any) => c.id === ticket.customer)?.name || 'Customer'} size={28}/>
                <div style={{ flex: 1 }}>
                  <div className="fw-6 text-sm">{customers.find((c: any) => c.id === ticket.customer)?.name || 'You'}</div>
                  <div className="text-xs text-mute">{ticket.created}</div>
                </div>
                <span className="pill subtle">Original</span>
              </div>
              {editing
                ? <textarea value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} rows={4} style={{ width: '100%' }}/>
                : <div className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{ticket.body}</div>
              }
            </div>

            {/* Replies */}
            {(ticket.replies || []).map((r: any, i: number) => (
              <div key={i} style={{ padding: '12px 14px', background: r.who.includes(customers.find((c: any) => c.id === ticket.customer)?.name?.split(' ')[0] || 'xxxxxxx') ? 'var(--surface-2)' : 'var(--accent-soft)', borderRadius: 8, marginBottom: 10 }}>
                <div className="flex center gap-2 mb-2">
                  <Avatar name={r.who} size={24}/>
                  <div style={{ flex: 1 }}>
                    <div className="fw-6 text-sm">{r.who}</div>
                    <div className="text-xs text-mute">{r.when}</div>
                  </div>
                </div>
                <div className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{r.body}</div>
              </div>
            ))}

            {/* Reply box */}
            {ticket.status !== 'Closed' && (
              <div style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Add reply</div>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Type your reply…" style={{ width: '100%' }}/>
                <div className="flex gap-2 mt-2">
                  <button className="btn"><Icon name="attach" size={12}/>Attach file</button>
                  <div style={{ flex: 1 }}/>
                  <button className="btn accent" disabled={!reply.trim()} onClick={sendReply}><Icon name="mail" size={12}/>Send reply</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="flex col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Ticket info</h3></div>
            <div className="card-body">
              <dl className="dl">
                <dt>Ticket ID</dt><dd className="mono">{ticket.id}</dd>
                <dt>Status</dt><dd>
                  {editing ? (
                    <select value={ticket.status} onChange={e => setTicketStatus(ticket.id, e.target.value)} style={{ padding: '3px 6px' as any, border: '1px solid var(--line)', borderRadius: 4, background: 'var(--surface)' }}>
                      <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                    </select>
                  ) : <StatusPill status={ticket.status}/>}
                </dd>
                <dt>Priority</dt><dd>
                  {editing ? (
                    <select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })} style={{ padding: '3px 6px' as any, border: '1px solid var(--line)', borderRadius: 4, background: 'var(--surface)' }}>
                      <option>Low</option><option>Normal</option><option>Urgent</option>
                    </select>
                  ) : <span className={`pill ${ticket.priority === 'Urgent' ? 'bad' : ticket.priority === 'Low' ? 'subtle' : 'warn'}`}><span className="dot"/>{ticket.priority}</span>}
                </dd>
                <dt>Assignee</dt><dd>{ticket.assignee !== '—' ? ticket.assignee : <span className="text-mute">Unassigned</span>}</dd>
                <dt>Created</dt><dd className="tnum">{ticket.created}</dd>
                <dt>Updated</dt><dd className="tnum">{ticket.updated}</dd>
              </dl>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Actions</h3></div>
            <div className="card-body">
              <div className="flex col gap-2">
                {ticket.status === 'Open' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'In Progress')}>Mark in progress</button>}
                {ticket.status === 'In Progress' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Resolved')}>Mark resolved</button>}
                {ticket.status === 'Resolved' && <><button className="btn" onClick={() => setTicketStatus(ticket.id, 'Closed')}>Close ticket</button><button className="btn ghost" onClick={() => setTicketStatus(ticket.id, 'Open')}>Reopen</button></>}
                {ticket.status === 'Closed' && <button className="btn" onClick={() => setTicketStatus(ticket.id, 'Open')}>Reopen ticket</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
