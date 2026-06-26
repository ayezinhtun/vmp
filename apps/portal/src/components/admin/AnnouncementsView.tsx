import React, { useState } from 'react'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { StatusPill } from '../ui/ui'

export const AnnouncementsView: React.FC = () => {
  const { toast } = useUIStore()
  const [list, setList] = useState([
    { id: 'A-001', title: 'Scheduled maintenance window — Sun 2 Jun', body: 'pve-node-03 will be down for kernel upgrade between 02:00–04:00 ICT. Affected VMs will be live-migrated.', audience: 'All customers', sent: '2026-05-25', status: 'Sent', open: 92 },
    { id: 'A-002', title: 'KBZ Pay integration update', body: 'New direct deposit reference codes required. Update your payment workflow.', audience: 'Sales + Finance', sent: '2026-05-20', status: 'Sent', open: 100 },
    { id: 'A-003', title: 'Q3 pricing review draft', body: 'Per-VM monthly rate adjustment proposal attached. Please review by Friday.', audience: 'Admin only', sent: '—', status: 'Draft', open: 0 },
  ])
  const [composing, setComposing] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', audience: 'All staff' })

  const submit = (status: string) => {
    const newId = `A-${String(list.length + 1).padStart(3, '0')}`
    setList([{ id: newId, ...form, sent: status === 'Sent' ? new Date().toISOString().slice(0,10) : '—', status, open: 0 }, ...list])
    toast(status === 'Sent' ? 'Announcement sent' : 'Draft saved', 'ok')
    setComposing(false)
    setForm({ title: '', body: '', audience: 'All staff' })
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Broadcast messages to staff or customers. {list.filter((l: any) => l.status === 'Sent').length} sent · {list.filter((l: any) => l.status === 'Draft').length} draft</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setComposing(true)}><Icon name="plus" size={13}/>New announcement</button>
        </div>
      </div>

      {composing && (
        <div className="card mb-4">
          <div className="card-head">
            <h3 className="card-title">New announcement</h3>
            <button className="icon-btn" onClick={() => setComposing(false)}><Icon name="x" size={14}/></button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="field"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
              <div className="field"><label>Audience</label>
                <select value={form.audience} onChange={e => setForm({...form, audience: e.target.value})}>
                  <option>All staff</option><option>All customers</option><option>Admin only</option>
                  <option>Sales</option><option>Engineer</option><option>Finance</option><option>Sales + Finance</option>
                </select>
              </div>
              <div className="field"><label>Body</label><textarea rows={5} value={form.body} onChange={e => setForm({...form, body: e.target.value})}/></div>
              <div className="flex gap-2 mt-1">
                <button className="btn" onClick={() => submit('Draft')}>Save draft</button>
                <button className="btn accent" disabled={!form.title || !form.body} onClick={() => submit('Sent')}><Icon name="mail" size={12}/>Send now</button>
                <div style={{ flex: 1 }}/>
                <button className="btn ghost" onClick={() => setComposing(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Title</th><th>Audience</th><th>Status</th><th>Sent</th><th className="right">Open rate</th></tr></thead>
            <tbody>
              {list.map((a: any) => (
                <tr key={a.id}>
                  <td><div className="fw-6">{a.title}</div><div className="text-xs text-mute" style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.body}</div></td>
                  <td><span className="pill subtle">{a.audience}</span></td>
                  <td><StatusPill status={a.status === 'Sent' ? 'Payment Received' : 'Pending'}/></td>
                  <td className="tnum text-sm">{a.sent}</td>
                  <td className="right tnum">{a.status === 'Sent' ? `${a.open}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
