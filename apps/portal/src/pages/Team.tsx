import React, { useState, useEffect } from 'react'
import useTeamStore from '../store/teamStore'
import useUIStore from '../store/uiStore'
import Icon from '../lib/icons'
import { Avatar } from '../components/ui/ui'
import { SecurityCol } from '../components/team/SecurityCol'
import { SettingsView } from '../components/team/SettingsView'

interface TeamViewProps {
  openModal: (kind: string, props?: any) => void
}

const TeamView: React.FC<TeamViewProps> = ({ openModal }) => {
  const { team, removeMember, updateMember } = useTeamStore()
  const { toast } = useUIStore()
  const [menu, setMenu] = useState<string | null>(null)

  useEffect(() => {
    const close = () => setMenu(null)
    if (menu) { window.addEventListener('click', close); return () => window.removeEventListener('click', close) }
  }, [menu])

  const ROLES = {
    Admin: { label: 'Admin', perms: ['Full system access', 'KYC approval', 'User management', 'All financial data', 'Manual VM ops', 'System settings'] },
    Sales: { label: 'Sales', perms: ['Customer profiles', 'Provisioning tasks', 'Invoices (view + send)', 'KYC submissions', 'Renewal reminders'] },
    Engineer: { label: 'Engineer', perms: ['Assigned tasks', 'VM records (assigned)', 'Network configuration', 'Credentials (assigned VMs)', 'Backup management'] },
    Finance: { label: 'Finance', perms: ['Invoices (full)', 'Payment records', 'Reports & exports', 'Customer financials', 'Receipt management'] },
    Customer: { label: 'Customer', perms: ['Own VMs (read-only)', 'Own invoices & receipts', 'Own subscription details', 'Renewal requests', 'No edit access'] },
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Team & roles</h1>
          <p className="page-subtitle">{team.length} active users · {Object.keys(ROLES).length} roles defined</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => openModal('invite')}><Icon name="plus" size={13}/>Invite member</button>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Team members</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>User</th><th>Role</th><th>Team</th><th>Last active</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>
                {team.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex center gap-2">
                        <Avatar name={u.name} size={28}/>
                        <div><div className="fw-6">{u.name}</div><div className="text-xs text-mute">{u.email}</div></div>
                      </div>
                    </td>
                    <td>
                      <select value={u.role} onChange={e => { updateMember(u.id, { role: e.target.value }); toast(`${u.name} → ${e.target.value}`, 'info'); }} style={{ padding: '3px 6px', fontSize: 11, border: '1px solid var(--line)', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent-strong)', fontWeight: 600 }}>
                        {Object.keys(ROLES).filter(r => r !== 'Customer').map(r => <option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="text-sm">{u.team}</td>
                    <td className="text-sm text-mute">{u.last}</td>
                    <td style={{ position: 'relative' }}>
                      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setMenu(menu === u.id ? null : u.id); }}><Icon name="more"/></button>
                      {menu === u.id && (
                        <div onClick={e => e.stopPropagation()} style={{
                          position: 'absolute', right: 14, top: 36, zIndex: 20,
                          background: 'var(--surface)', border: '1px solid var(--line)',
                          borderRadius: 8, boxShadow: 'var(--shadow)', minWidth: 160, padding: 4,
                        }}>
                          <button className="nav-item" onClick={() => { toast('Password reset email sent', 'info'); setMenu(null); }}><Icon name="key" size={13}/>Reset password</button>
                          <button className="nav-item" onClick={() => { toast('2FA reset', 'info'); setMenu(null); }}><Icon name="shield" size={13}/>Reset 2FA</button>
                          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }}/>
                          <button className="nav-item" style={{ color: 'var(--bad)' }} onClick={() => { removeMember(u.id); setMenu(null); }}><Icon name="trash" size={13}/>Remove user</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 className="card-title">Role permissions (RBAC)</h3></div>
          <div className="card-body" style={{ padding: '12px 0' }}>
            {Object.entries(ROLES).map(([k, r]) => (
              <div key={k} style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)' }}>
                <div className="flex center between mb-2">
                  <span className="fw-6">{r.label}</span>
                  <span className="text-xs text-mute tnum">{team.filter(u => u.role === k).length} {team.filter(u => u.role === k).length === 1 ? 'member' : 'members'}</span>
                </div>
                <div className="flex wrap gap-1">
                  {r.perms.map(p => <span key={p} className="pill subtle" style={{ fontSize: 10.5 }}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Auth & security</h3></div>
        <div className="card-body">
          <div className="grid-3" style={{ gap: 20 }}>
            <SecurityCol title="Login policy" items={[
              ['Email + password (all roles)', true],
              ['Two-factor auth (2FA)', true],
              ['Session auto-logout (30 min)', true],
              ['Brute-force block (5 attempts)', true],
            ]}/>
            <SecurityCol title="Admin access" items={[
              ['IP whitelist (admin only)', true],
              ['Password reset via email', true],
              ['Audit access logs (90 days)', true],
            ]}/>
            <SecurityCol title="Customer portal" items={[
              ['Separate portal URL', true],
              ['Block portal when KYC pending', true],
              ['Read-only VM view', true],
              ['Self-serve renewal request', true],
            ]}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TeamView, SettingsView }
