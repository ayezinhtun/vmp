// Team & roles + Settings + Customer portal — store-wired with renewal request

const TeamView = ({ openModal }) => {
  const { state, removeMember, updateMember, toast } = useStore();
  const [menu, setMenu] = React.useState(null);

  React.useEffect(() => {
    const close = () => setMenu(null);
    if (menu) { window.addEventListener('click', close); return () => window.removeEventListener('click', close); }
  }, [menu]);

  const ROLES = {
    Admin: { label: 'Admin', perms: ['Full system access', 'KYC approval', 'User management', 'All financial data', 'Manual VM ops', 'System settings'] },
    Sales: { label: 'Sales', perms: ['Customer profiles', 'Provisioning tasks', 'Invoices (view + send)', 'KYC submissions', 'Renewal reminders'] },
    Engineer: { label: 'Engineer', perms: ['Assigned tasks', 'VM records (assigned)', 'Network configuration', 'Credentials (assigned VMs)', 'Backup management'] },
    Finance: { label: 'Finance', perms: ['Invoices (full)', 'Payment records', 'Reports & exports', 'Customer financials', 'Receipt management'] },
    Customer: { label: 'Customer', perms: ['Own VMs (read-only)', 'Own invoices & receipts', 'Own subscription details', 'Renewal requests', 'No edit access'] },
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Team & roles</h1>
          <p className="page-subtitle">{state.team.length} active users · {Object.keys(ROLES).length} roles defined</p>
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
                {state.team.map(u => (
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
                  <span className="text-xs text-mute tnum">{state.team.filter(u => u.role === k).length} {state.team.filter(u => u.role === k).length === 1 ? 'member' : 'members'}</span>
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
  );
};

const SecurityCol = ({ title, items }) => {
  const [vals, setVals] = React.useState(items.map(i => i[1]));
  return (
    <div>
      <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</div>
      <div className="flex col gap-2 text-sm">
        {items.map(([l, _], i) => (
          <div key={l} className="flex center between">
            <span>{l}</span>
            <span className={`toggle ${vals[i] ? 'on' : ''}`} onClick={() => setVals(v => v.map((x, idx) => idx === i ? !x : x))}/>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView = () => {
  const { toast } = useStore();
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
              <div className="field">
                <label>Logo</label>
                <div style={{ padding: '14px 12px', border: '1px dashed var(--line-strong)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="brand-mark" style={{ width: 36, height: 36, fontSize: 16 }}>V</div>
                  <div className="text-sm"><div className="fw-6">vpsmm-logo.svg</div><div className="text-xs text-mute">120 × 32 · 4 KB</div></div>
                  <div style={{ flex: 1 }}/>
                  <button className="btn sm">Change</button>
                </div>
              </div>
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
              <div className="field"><label>Email template editor</label>
                <pre className="code">{`Subject: Your VM {{vm.name}} expires in {{days}} days

Hi {{customer.firstName}},

Your subscription for {{vm.name}} ({{vm.spec}})
will expire on {{vm.expiry}}.

To renew, reply to this email or visit the portal.

— VPS Myanmar Team`}</pre>
              </div>
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
                    <Icon name={icon} size={16}/>
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
              <div className="divider"/>
              <div>
                <div className="fw-6 text-sm mb-2">Database</div>
                <pre className="code">{`Host:     db-primary.vpsmm.local
Version:  PostgreSQL 16.2
Size:     2.4 GB
Tables:   34
Uptime:   42 days`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TeamView, SettingsView });
