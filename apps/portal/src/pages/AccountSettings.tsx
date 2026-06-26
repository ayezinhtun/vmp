// Account Settings — editable user profile with save (write)

import React, { useState, useEffect } from 'react'
import useTeamStore from '../store/teamStore'
import useUIStore from '../store/uiStore'
import Icon from '../lib/icons'
import { Avatar } from '../components/ui/ui'

interface AccountSettingsViewProps {
  role: string
  setView: (view: string) => void
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({ role }) => {
  const { team, updateMember } = useTeamStore()
  const { toast } = useUIStore()

  // Map current role to a team member identity
  const meByRole: Record<string, any> = {
    'Admin': team.find((t: any) => t.role === 'Admin'),
    'Sales': team.find((t: any) => t.role === 'Sales'),
    'Engineer': team.find((t: any) => t.role === 'Engineer'),
    'Finance': team.find((t: any) => t.role === 'Finance'),
  }
  const me = meByRole[role] || team[0]

  const [profile, setProfile] = useState({
    name: me.name,
    email: me.email,
    phone: '+95 9 9988 1122',
    title: role === 'Admin' ? 'Operations Lead' : role === 'Sales' ? 'Senior Account Manager' : role === 'Engineer' ? 'Senior Engineer' : 'Finance Manager',
    timezone: 'Asia/Yangon',
    language: 'English',
  })
  const [security, setSecurity] = useState({
    twoFA: true, sessionTimeout: 30, currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [notif, setNotif] = useState({
    emailExpiry: true, emailInvoice: true, emailTask: true, emailKYC: role === 'Admin',
    inappAll: true, weeklyDigest: false,
  })
  const [prefs, setPrefs] = useState({
    densityCompact: false, showOnboarding: false, defaultLanding: 'dashboard',
  })

  useEffect(() => { setProfile(p => ({ ...p, name: me.name, email: me.email })); }, [me.id])

  const saveProfile = () => {
    updateMember(me.id, { name: profile.name, email: profile.email })
    toast('Profile updated', 'ok')
  }
  const savePassword = () => {
    if (!security.currentPassword) return toast('Enter current password', 'warn')
    if (security.newPassword.length < 8) return toast('Password must be at least 8 characters', 'warn')
    if (security.newPassword !== security.confirmPassword) return toast('Passwords do not match', 'bad')
    setSecurity(s => ({ ...s, currentPassword: '', newPassword: '', confirmPassword: '' }))
    toast('Password changed · email confirmation sent', 'ok')
  }
  const saveSecurity = () => toast('Security settings saved', 'ok')
  const saveNotif = () => toast('Notification preferences saved', 'ok')
  const savePrefs = () => toast('Preferences saved', 'ok')

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Account settings</h1>
          <p className="page-subtitle">Manage your profile, security, and notification preferences</p>
        </div>
      </div>

      {/* Identity header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="flex center gap-3">
            <Avatar name={profile.name} size={64}/>
            <div style={{ flex: 1 }}>
              <div className="fw-7" style={{ fontSize: 18 }}>{profile.name}</div>
              <div className="text-sm text-mute">{profile.title} · {role}</div>
              <div className="text-xs text-mute mt-1">{profile.email}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => toast('Avatar upload opened', 'info')}><Icon name="edit" size={12}/>Change avatar</button>
              <button className="btn danger" onClick={() => toast('Signed out', 'info')}><Icon name="logout" size={12}/>Sign out</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        {/* Profile */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Profile</h3>
            <button className="btn sm accent" onClick={saveProfile}><Icon name="check" size={11}/>Save profile</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field"><label>Full name</label><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}/></div>
                <div className="field"><label>Job title</label><input value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })}/></div>
              </div>
              <div className="field"><label>Work email</label><input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}/></div>
              <div className="field"><label>Phone</label><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={{ fontFamily: 'var(--mono)' }}/></div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field"><label>Timezone</label><select value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}><option>Asia/Yangon</option><option>Asia/Bangkok</option><option>Asia/Singapore</option><option>UTC</option></select></div>
                <div className="field"><label>Language</label><select value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })}><option>English</option><option>မြန်မာ (Burmese)</option></select></div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Security</h3>
            <button className="btn sm accent" onClick={saveSecurity}><Icon name="check" size={11}/>Save</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="flex center between">
                <div>
                  <div className="fw-6 text-sm">Two-factor auth</div>
                  <div className="text-xs text-mute">Authenticator app required at login</div>
                </div>
                <span className={`toggle ${security.twoFA ? 'on' : ''}`} onClick={() => setSecurity({ ...security, twoFA: !security.twoFA })}/>
              </div>
              <div className="field">
                <label>Auto-logout (minutes)</label>
                <input type="number" value={security.sessionTimeout} onChange={e => setSecurity({ ...security, sessionTimeout: +e.target.value })} min="5" max="240"/>
              </div>
              <div className="divider"/>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Change password</div>
              <div className="field"><label>Current password</label><input type="password" value={security.currentPassword} onChange={e => setSecurity({ ...security, currentPassword: e.target.value })} placeholder="••••••••"/></div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field"><label>New password</label><input type="password" value={security.newPassword} onChange={e => setSecurity({ ...security, newPassword: e.target.value })} placeholder="At least 8 characters"/></div>
                <div className="field"><label>Confirm new</label><input type="password" value={security.confirmPassword} onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}/></div>
              </div>
              <button className="btn" onClick={savePassword}><Icon name="key" size={12}/>Update password</button>
              <div className="divider"/>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active sessions</div>
              <div className="flex center between text-sm">
                <div>
                  <div className="fw-6">Chrome · macOS · Yangon</div>
                  <div className="text-xs text-mute">Current session · 203.81.64.10</div>
                </div>
                <span className="pill ok"><span className="dot"/>This device</span>
              </div>
              <div className="flex center between text-sm">
                <div>
                  <div className="fw-6">Safari · iPhone</div>
                  <div className="text-xs text-mute">2 days ago · 203.81.64.42</div>
                </div>
                <button className="btn sm danger" onClick={() => toast('Session revoked', 'bad')}>Revoke</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Notifications */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Notification preferences</h3>
            <button className="btn sm accent" onClick={saveNotif}><Icon name="check" size={11}/>Save</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email me when</div>
              {[
                ['emailExpiry', 'A VM is expiring within 7 days'],
                ['emailInvoice', 'An invoice becomes overdue'],
                ['emailTask', 'A task is assigned to me'],
                ['emailKYC', 'A new KYC submission arrives'],
              ].map(([key, label]) => (
                <div key={key} className="flex center between">
                  <span className="text-sm">{label}</span>
                  <span className={`toggle ${(notif as any)[key] ? 'on' : ''}`} onClick={() => setNotif({ ...notif, [key]: !(notif as any)[key] })}/>
                </div>
              ))}
              <div className="divider"/>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>In-app</div>
              <div className="flex center between"><span className="text-sm">Show all in-app notifications</span><span className={`toggle ${notif.inappAll ? 'on' : ''}`} onClick={() => setNotif({ ...notif, inappAll: !notif.inappAll })}/></div>
              <div className="flex center between"><span className="text-sm">Weekly digest email (Mondays)</span><span className={`toggle ${notif.weeklyDigest ? 'on' : ''}`} onClick={() => setNotif({ ...notif, weeklyDigest: !notif.weeklyDigest })}/></div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Preferences</h3>
            <button className="btn sm accent" onClick={savePrefs}><Icon name="check" size={11}/>Save</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="flex center between">
                <div><div className="fw-6 text-sm">Compact density</div><div className="text-xs text-mute">Tighter table rows and cards</div></div>
                <span className={`toggle ${prefs.densityCompact ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, densityCompact: !prefs.densityCompact })}/>
              </div>
              <div className="flex center between">
                <div><div className="fw-6 text-sm">Show onboarding tips</div><div className="text-xs text-mute">Tooltips and feature highlights</div></div>
                <span className={`toggle ${prefs.showOnboarding ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, showOnboarding: !prefs.showOnboarding })}/>
              </div>
              <div className="field">
                <label>Default landing page</label>
                <select value={prefs.defaultLanding} onChange={e => setPrefs({ ...prefs, defaultLanding: e.target.value })}>
                  <option value="dashboard">Dashboard</option>
                  <option value="vms">VM records</option>
                  <option value="tasks">Provisioning</option>
                  <option value="customers">Customers</option>
                  <option value="finance">Invoices</option>
                </select>
              </div>
              <div className="divider"/>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Data</div>
              <button className="btn" onClick={() => toast('Account export queued · email link will arrive shortly', 'info')}><Icon name="download" size={12}/>Download my data</button>
              <button className="btn danger" onClick={() => toast('Account deletion request submitted to admin', 'bad')}><Icon name="trash" size={12}/>Delete account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
