import React, { useState } from 'react'
import useCustomerStore from '../../store/customerStore'
import useUIStore from '../../store/uiStore'
import { Avatar, StatusPill } from '../ui/ui'
import Icon from '../../lib/icons'

interface CustomerAccountViewProps {
  me: any
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({ me }) => {
  const { updateCustomer } = useCustomerStore()
  const { toast } = useUIStore()
  const [profile, setProfile] = useState({ name: me.name, email: me.email, phone: me.phone, company: me.company })
  const [security, setSecurity] = useState({ twoFA: true, emailNotif: true, renewalReminders: true })

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Account</h1>
          <p className="page-subtitle">Manage your profile and security settings</p>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <div className="flex center gap-3">
            <Avatar name={profile.name} size={56}/>
            <div style={{ flex: 1 }}>
              <div className="fw-7" style={{ fontSize: 17 }}>{profile.name}</div>
              <div className="text-sm text-mute">{profile.company} · {me.id}</div>
              <div className="flex gap-2 mt-2">
                <StatusPill status={me.kyc}/>
                <StatusPill status={me.status}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Profile</h3>
            <button className="btn sm accent" onClick={() => { updateCustomer(me.id, profile); toast('Profile saved', 'ok') }}><Icon name="check" size={11}/>Save</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="field"><label>Contact name</label><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}/></div>
              <div className="field"><label>Company</label><input value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })}/></div>
              <div className="field"><label>Email</label><input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}/></div>
              <div className="field"><label>Phone</label><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={{ fontFamily: 'var(--mono)' }}/></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Security & notifications</h3>
            <button className="btn sm accent" onClick={() => toast('Settings saved', 'ok')}><Icon name="check" size={11}/>Save</button>
          </div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="flex center between"><span className="text-sm">Two-factor auth</span><span className={`toggle ${security.twoFA ? 'on' : ''}`} onClick={() => setSecurity({ ...security, twoFA: !security.twoFA })}/></div>
              <div className="flex center between"><span className="text-sm">Email notifications</span><span className={`toggle ${security.emailNotif ? 'on' : ''}`} onClick={() => setSecurity({ ...security, emailNotif: !security.emailNotif })}/></div>
              <div className="flex center between"><span className="text-sm">Renewal reminders (30/7/1 day)</span><span className={`toggle ${security.renewalReminders ? 'on' : ''}`} onClick={() => setSecurity({ ...security, renewalReminders: !security.renewalReminders })}/></div>
              <div className="divider"/>
              <button className="btn" onClick={() => toast('Password reset email sent', 'info')}><Icon name="key" size={12}/>Change password</button>
              <button className="btn" onClick={() => toast('Account data export queued', 'info')}><Icon name="download" size={12}/>Download my data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
