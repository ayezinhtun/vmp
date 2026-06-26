import React from 'react'
import { StatusPill } from '../ui/ui'
import { Avatar } from '../ui/ui'
import Icon from '../../lib/icons'

interface CustomerRequestsViewProps {
  myRequests: any[]
  setDetailRequest: (request: any) => void
}

export const CustomerRequestsView: React.FC<CustomerRequestsViewProps> = ({ myRequests, setDetailRequest }) => (
  <div className="content">
    <div className="page-head">
      <div>
        <h1 className="page-title">My requests</h1>
        <p className="page-subtitle">Requests you've submitted to our Sales team · {myRequests.length} total · click any row to see details</p>
      </div>
    </div>
    <div className="card">
      <div className="card-body flush">
        <table className="tbl">
          <thead><tr><th>Request</th><th>Type</th><th>Submitted</th><th>Assigned to</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {myRequests.length === 0 && <tr><td colSpan={6}><div className="empty"><div className="title">No requests yet</div><div className="sub">Click "Request VM" in the sidebar to submit your first.</div></div></td></tr>}
            {myRequests.map((t: any) => (
              <tr key={t.id} onClick={() => setDetailRequest(t)}>
                <td><div className="fw-6">{t.title}</div><div className="text-xs text-mute mono">{t.id}</div></td>
                <td><span className="pill subtle">{t.type}</span></td>
                <td className="tnum text-sm">{t.created}</td>
                <td>{t.assignee !== '—' ? <div className="flex center gap-2"><Avatar name={t.assignee} size={22}/><span className="text-sm">{t.assignee}</span></div> : <span className="text-mute text-sm">Unassigned</span>}</td>
                <td><StatusPill status={t.status}/></td>
                <td className="right"><Icon name="chevron-right" size={12} className="text-mute"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)
