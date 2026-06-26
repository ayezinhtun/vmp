import React from 'react'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'

export const SettingsView: React.FC = () => {
  const { toast } = useUIStore()
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">System settings</h1>
          <p className="page-subtitle">Company info · alerts · integrations · data export</p>
        </div>
      </div>
      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Company</h3><button className="btn sm accent" onClick={() => toast('Company settings saved', 'ok')}>Save</button></div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="field"><label>Company name</label><input defaultValue="VPS Myanmar Co., Ltd"/></div>
              <div className="field"><label>Default currency</label><select defaultValue="MMK"><option>MMK</option><option>USD</option><option>SGD</option></select></div>
              <div className="field"><label>Timezone</label><select defaultValue="Asia/Yangon"><option>Asia/Yangon</option><option>Asia/Bangkok</option><option>UTC</option></select></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 className="card-title">Alerts & email</h3><button className="btn sm accent" onClick={() => toast('Alert settings saved', 'ok')}>Save</button></div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="grid-3" style={{ gap: 10 }}>
                <div className="field"><label>Alert: 1st</label><input defaultValue="30" type="number"/><div className="hint">days before</div></div>
                <div className="field"><label>Alert: 2nd</label><input defaultValue="7" type="number"/><div className="hint">days before</div></div>
                <div className="field"><label>Alert: 3rd</label><input defaultValue="1" type="number"/><div className="hint">days before</div></div>
              </div>
              <div className="field"><label>SMTP host</label><input defaultValue="smtp.sendgrid.net"/></div>
              <div className="field"><label>Sender</label><input defaultValue="noreply@vpsmm.co"/></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Integrations</h3></div>
          <div className="card-body">
            <div className="flex col gap-3">
              {[
                ['Proxmox API', 'Connected', 'ok', 'pve.vpsmm.co · 14 nodes', 'server'],
                ['Firewall (FortiGate)', 'Connected', 'ok', 'fg.vpsmm.co · 3 policies synced', 'shield'],
                ['SendGrid SMTP', 'Connected', 'ok', '1,243 emails sent · 99.2% delivered', 'mail'],
                ['Google Forms (KYC intake)', 'Connected', 'ok', 'Webhook · 2 new submissions today', 'file'],
                ['MS Teams webhook', 'Disconnected', 'warn', 'Click to configure', 'mail'],
                ['Backup storage (S3)', 'Connected', 'ok', 'sg-region · 2.4 TB used', 'database'],
              ].map(([name, status, sev, sub, icon]) => (
                <div key={name} style={{ padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: 'var(--surface-2)', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
                    <Icon name={icon as string} size={16}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-6 text-sm">{name}</div>
                    <div className="text-xs text-mute">{sub}</div>
                  </div>
                  <span className={`pill ${sev === 'ok' ? 'ok' : 'warn'}`}><span className="dot"/>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 className="card-title">Data & backups</h3></div>
          <div className="card-body">
            <div className="flex col gap-3">
              <div className="flex center between">
                <div><div className="fw-6 text-sm">PostgreSQL backup</div><div className="text-xs text-mute">Daily at 02:00 ICT · last: 2026-05-27 02:00:14</div></div>
                <span className="pill ok"><span className="dot"/>Healthy</span>
              </div>
              <div className="flex center between">
                <div><div className="fw-6 text-sm">Redis snapshot</div><div className="text-xs text-mute">Every 6 hours · 18.4 MB</div></div>
                <span className="pill ok"><span className="dot"/>Healthy</span>
              </div>
              <div className="divider"/>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Export</div>
              <div className="grid-2" style={{ gap: 8 }}>
                <button className="btn" onClick={() => toast('Customers CSV download started', 'info')}><Icon name="download" size={12}/>Customers</button>
                <button className="btn" onClick={() => toast('VMs CSV download started', 'info')}><Icon name="download" size={12}/>VMs</button>
                <button className="btn" onClick={() => toast('Invoices CSV download started', 'info')}><Icon name="download" size={12}/>Invoices</button>
                <button className="btn" onClick={() => toast('Full DB dump queued', 'info')}><Icon name="download" size={12}/>Full DB dump</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
