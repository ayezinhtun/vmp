import React, { useState } from 'react'
import useTicketStore from '../../store/ticketStore'
import Icon from '../../lib/icons'
import { IaaSCard } from './VMHelperComponents'

interface NewTicketFormProps {
  me: any
  onClose: () => void
  onCreated: () => void
}

export const NewTicketForm: React.FC<NewTicketFormProps> = ({ me, onClose, onCreated }) => {
  const { addTicket } = useTicketStore()
  const [f, setF] = useState({ subject: '', priority: 'Normal', body: '', category: 'general' })
  const submit = () => {
    if (!f.subject || !f.body) return
    addTicket({ ...f, customer: me.id, status: 'Open', assignee: '—' })
    onCreated()
  }

  const categories = [
    { id: 'general', label: 'General question', icon: 'mail', accent: 'oklch(0.6 0.13 250)' },
    { id: 'technical', label: 'Technical issue', icon: 'cpu', accent: 'oklch(0.55 0.18 285)' },
    { id: 'billing', label: 'Billing', icon: 'invoice', accent: 'oklch(0.55 0.16 155)' },
    { id: 'urgent', label: 'Service outage', icon: 'alert', accent: 'oklch(0.55 0.18 25)' },
  ]

  const priorities = [
    { id: 'Low', desc: 'Within 1 business day', color: 'var(--ink-3)' },
    { id: 'Normal', desc: 'Within 4 hours', color: 'oklch(0.55 0.16 75)' },
    { id: 'Urgent', desc: 'ASAP · within 1 hour', color: 'var(--bad)' },
  ]

  return (
    <div className="card mb-4" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      <div className="card-head">
        <div>
          <h3 className="card-title">New support ticket</h3>
          <div className="text-xs text-mute mt-1">Our team will respond based on the priority you select</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div className="card-body">
        <div className="flex col gap-4">
          <div>
            <label style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {categories.map(c => (
                <IaaSCard key={c.id} selected={f.category === c.id} onClick={() => setF({...f, category: c.id})} padding={12 as any}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.accent}1a`, color: c.accent, display: 'grid', placeItems: 'center' }}>
                      <Icon name={c.icon} size={15}/>
                    </div>
                    <div className="fw-6 text-xs">{c.label}</div>
                  </div>
                </IaaSCard>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Subject</label>
            <input value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} placeholder="Brief summary of the issue"/>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Priority</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {priorities.map(p => (
                <IaaSCard key={p.id} selected={f.priority === p.id} onClick={() => setF({...f, priority: p.id})} padding={12 as any}>
                  <div className="flex center between">
                    <div>
                      <div className="fw-7 text-sm" style={{ color: f.priority === p.id ? p.color : 'var(--ink)' }}>{p.id}</div>
                      <div className="text-xs text-mute mt-1">{p.desc}</div>
                    </div>
                    {f.priority === p.id && <Icon name="check" size={14} style={{ color: p.color }}/>}
                  </div>
                </IaaSCard>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Describe the issue</label>
            <textarea rows="6" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} placeholder="Include VM IDs, error messages, and any steps already tried…"/>
            <div className="hint">Tip: include the VM ID and the exact error message for fastest resolution.</div>
          </div>

          <div className="flex gap-2" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <div style={{ flex: 1 }}/>
            <button className="btn" onClick={() => { onClose() }}>Save as draft</button>
            <button className="btn accent" disabled={!f.subject || !f.body} onClick={submit}><Icon name="check" size={12}/>Submit ticket</button>
          </div>
        </div>
      </div>
    </div>
  )
}
