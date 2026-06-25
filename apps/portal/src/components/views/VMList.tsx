import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { StatusPill, ExpiryCell, formatMMK, SecCheck, Bars } from '../../lib/ui'

interface VMListProps {
  openVM: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const VMList: React.FC<VMListProps> = ({ openVM, openModal }) => {
  const { state, bulkAction, setVMStatus, toast } = useStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [menu, setMenu] = useState<string | null>(null)

  const filters = [
    { id: 'all', label: 'All', count: state.vms.length },
    { id: 'Active', label: 'Active', count: state.vms.filter(v => v.status === 'Active').length },
    { id: 'Pending', label: 'Pending', count: state.vms.filter(v => v.status === 'Pending').length },
    { id: 'Suspended', label: 'Suspended', count: state.vms.filter(v => v.status === 'Suspended').length },
    { id: 'Expired', label: 'Expired', count: state.vms.filter(v => v.status === 'Expired').length },
    { id: 'Trial', label: 'Trial', count: state.vms.filter(v => v.type === 'Trial').length },
    { id: 'expiring', label: 'Expiring ≤ 7d', count: state.vms.filter(v => v.expiry !== '—' && (new Date(v.expiry).getTime() - new Date('2026-05-27').getTime()) / 86400000 <= 7 && (new Date(v.expiry).getTime() - new Date('2026-05-27').getTime()) / 86400000 >= 0).length },
  ]

  const filtered = state.vms.filter(v => {
    if (filter === 'all') return true
    if (filter === 'Trial') return v.type === 'Trial'
    if (filter === 'expiring') {
      if (v.expiry === '—') return false
      const d = (new Date(v.expiry).getTime() - new Date('2026-05-27').getTime()) / 86400000
      return d >= 0 && d <= 7
    }
    return v.status === filter
  }).filter(v => {
    if (!search) return true
    const c = state.customers.find(c => c.id === v.customer)
    return [v.name, v.id, v.publicIp, v.vlan, c?.company, c?.name].join(' ').toLowerCase().includes(search.toLowerCase())
  })

  const toggle = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  useEffect(() => {
    const close = () => setMenu(null)
    if (menu) {
      window.addEventListener('click', close)
      return () => window.removeEventListener('click', close)
    }
  }, [menu])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">VM records</h1>
          <p className="page-subtitle">{state.vms.length} virtual machines · {state.vms.filter(v => v.status === 'Active').length} running</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('VMs CSV download started', 'info')}><Icon name="download" size={13}/>Export CSV</button>
          <button className="btn primary" onClick={() => openModal('newvm')}><Icon name="plus" size={13}/>New VM</button>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          {filters.map(f => (
            <button key={f.id}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}>
              {f.label}<span className="ct">{f.count}</span>
            </button>
          ))}
          <div style={{ flex: 1 }}/>
          <div className="search" style={{ width: 220 }}>
            <Icon name="search" size={13} className="search-icon"/>
            <input placeholder="Name, IP, customer…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        {selected.size > 0 && (
          <div style={{ padding: '10px 18px', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="fw-6 text-sm">{selected.size} selected</span>
            <button className="btn sm" onClick={() => { bulkAction([...selected], 'suspend'); setSelected(new Set()); }}>Suspend</button>
            <button className="btn sm" onClick={() => { bulkAction([...selected], 'activate'); setSelected(new Set()); }}>Activate</button>
            <button className="btn sm" onClick={() => { bulkAction([...selected], 'renew'); setSelected(new Set()); }}>Renew 1 year</button>
            <button className="btn sm" onClick={() => { toast(`${selected.size} VMs exported to CSV`, 'info'); }}>Export selected</button>
            <button className="btn sm danger" onClick={() => { bulkAction([...selected], 'terminate'); setSelected(new Set()); }}>Terminate</button>
            <div style={{ flex: 1 }}/>
            <button className="btn ghost sm" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 30 }}><input type="checkbox" checked={filtered.length > 0 && filtered.every(v => selected.has(v.id))} onChange={e => setSelected(e.target.checked ? new Set(filtered.map(v => v.id)) : new Set())}/></th>
              <th>VM</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Type</th>
              <th>Spec</th>
              <th>Public IP / VLAN</th>
              <th>Expires</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const c = state.customers.find(c => c.id === v.customer)
              return (
                <tr key={v.id} onClick={() => openVM(v.id)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggle(v.id)}/>
                  </td>
                  <td>
                    <div className="flex center gap-2">
                      <span className="id-tag accent">{v.proxmoxFlag || '·'}</span>
                      <div>
                        <div className="fw-6">{v.name}</div>
                        <div className="text-xs text-mute mono">{v.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-6 text-sm">{c?.company}</div>
                    <div className="text-xs text-mute">{c?.name}</div>
                  </td>
                  <td><StatusPill status={v.status}/></td>
                  <td><StatusPill status={v.type}/></td>
                  <td className="mono text-xs">
                    {v.vcpu}c · {v.ram}GB · {v.storage}GB
                  </td>
                  <td className="mono text-xs">
                    {v.publicIp === '—' || v.publicIp === 'pending' ? <span className="text-mute">{v.publicIp}</span> : v.publicIp}
                    <div className="text-mute">{v.vlan}</div>
                  </td>
                  <td><ExpiryCell date={v.expiry}/></td>
                  <td onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setMenu(menu === v.id ? null : v.id); }}>
                      <Icon name="more"/>
                    </button>
                    {menu === v.id && (
                      <div onClick={e => e.stopPropagation()} style={{
                        position: 'absolute', right: 14, top: 36, zIndex: 20,
                        background: 'var(--surface)', border: '1px solid var(--line)',
                        borderRadius: 8, boxShadow: 'var(--shadow)',
                        minWidth: 180, padding: 4,
                      }}>
                        <button className="nav-item" onClick={() => { openVM(v.id); setMenu(null); }}><Icon name="eye" size={13}/>View details</button>
                        <button className="nav-item" onClick={() => { openModal('renew', { vm: v }); setMenu(null); }}><Icon name="refresh" size={13}/>Renew</button>
                        <button className="nav-item" onClick={() => { openModal('spec', { vm: v }); setMenu(null); }}><Icon name="sliders" size={13}/>Change spec</button>
                        {v.status === 'Active'
                          ? <button className="nav-item" onClick={() => { setVMStatus(v.id, 'Suspended', 'Stopped'); setMenu(null); }}><Icon name="pause" size={13}/>Suspend</button>
                          : <button className="nav-item" onClick={() => { setVMStatus(v.id, 'Active', 'Running'); setMenu(null); }}><Icon name="play" size={13}/>Activate</button>}
                        <button className="nav-item" onClick={() => { setMenu(null); }}><Icon name="refresh" size={13}/>Restart</button>
                        <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }}/>
                        <button className="nav-item" style={{ color: 'var(--bad)' }} onClick={() => { openModal('terminate', { vm: v }); setMenu(null); }}><Icon name="trash" size={13}/>Terminate</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty"><div className="title">No VMs match these filters</div><div className="sub">Try a different status or clear the search.</div></div>}
      </div>
    </div>
  )
}

interface VMDrawerProps {
  vmId: string
  onClose: () => void
  openCust: (id: string) => void
  openModal: (kind: string, props?: any) => void
}

const VMDrawer: React.FC<VMDrawerProps> = ({ vmId, onClose, openCust, openModal }) => {
  const { state, setVMStatus, updateVM, logActivity } = useStore()
  const v = state.vms.find((x: any) => x.id === vmId)
  if (!v) return null
  const c = state.customers.find((c: any) => c.id === v.customer)
  if (!c) return null
  const [tab, setTab] = useState('overview')

  const vmInvoices = state.invoices.filter((i: any) => i.vms.includes(vmId))

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="flex center between mb-2">
            <div className="flex center gap-2 text-sm text-mute">
              <span className="mono">{v.id}</span>
              <span>·</span>
              <a onClick={() => openCust(c.id)} style={{ cursor: 'pointer', color: 'var(--accent-strong)' }}>{c.company}</a>
            </div>
            <div className="flex gap-2">
              <button className="icon-btn" title="Open in Proxmox"><Icon name="external" size={14}/></button>
              <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
            </div>
          </div>
          <div className="flex center between">
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{v.name}</h2>
              <div className="flex gap-2 mt-2">
                <StatusPill status={v.status}/>
                <StatusPill status={v.type}/>
                <span className="pill"><Icon name={v.powerState === 'Running' ? 'play' : 'pause'} size={10}/>{v.powerState}</span>
                <SecCheck on={v.security}/>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => openModal('renew', { vm: v })}><Icon name="refresh" size={12}/>Renew</button>
              <button className="btn" onClick={() => openModal('spec', { vm: v })}><Icon name="sliders" size={12}/>Spec</button>
              {v.status === 'Active'
                ? <button className="btn" onClick={() => setVMStatus(v.id, 'Suspended', 'Stopped')}><Icon name="pause" size={12}/>Suspend</button>
                : <button className="btn primary" onClick={() => setVMStatus(v.id, 'Active', 'Running')}><Icon name="play" size={12}/>Activate</button>}
              <button className="btn danger" onClick={() => openModal('terminate', { vm: v })}><Icon name="trash" size={12}/></button>
            </div>
          </div>
        </div>

        <div className="tabs">
          {['overview','network','creds','billing','activity','backups'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Overview' : t === 'network' ? 'Network' : t === 'creds' ? 'Credentials' : t === 'billing' ? 'Billing' : t === 'activity' ? 'Activity' : 'Backups'}
              {t === 'billing' && <span className="count">{vmInvoices.length}</span>}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {tab === 'overview' && (
            <div className="flex col gap-4">
              <div className="card">
                <div className="card-body">
                  <div className="grid-2" style={{ gap: 18 }}>
                    <div>
                      <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Specification</div>
                      <dl className="dl mt-3">
                        <dt>vCPU</dt><dd className="tnum">{v.vcpu} cores</dd>
                        <dt>RAM</dt><dd className="tnum">{v.ram} GB</dd>
                        <dt>Storage</dt><dd className="tnum">{v.storage} GB SSD</dd>
                        <dt>Bandwidth</dt><dd>{v.bandwidth}</dd>
                        <dt>OS</dt><dd>{v.os}</dd>
                        <dt>Datacenter</dt><dd>{v.datacenter} <span className="text-mute">· {v.node}</span></dd>
                      </dl>
                    </div>
                    <div>
                      <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Subscription</div>
                      <dl className="dl mt-3">
                        <dt>Type</dt><dd>{v.type}</dd>
                        <dt>Period</dt><dd>{v.subscription}</dd>
                        <dt>Start</dt><dd className="tnum">{v.start}</dd>
                        <dt>Expiry</dt><dd><ExpiryCell date={v.expiry}/></dd>
                        <dt>Monthly</dt><dd className="tnum">MMK {formatMMK(v.priceMonth)}</dd>
                        <dt>Auto-renew</dt><dd><span className="toggle on"/></dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Utilization · last 24h</h3>
                  <span className="text-xs text-mute">live · synced 2 min ago</span>
                </div>
                <div className="card-body">
                  <div className="grid-3">
                    <div>
                      <div className="flex center between mb-2">
                        <span className="text-sm fw-6"><Icon name="cpu" size={12}/> CPU</span>
                        <span className="tnum text-sm">42%</span>
                      </div>
                      <Bars data={[20,22,28,35,30,42,48,45,50,55,52,58,62,70,65,60,55,48,42,38,35,40,42,38]}/>
                    </div>
                    <div>
                      <div className="flex center between mb-2">
                        <span className="text-sm fw-6"><Icon name="database" size={12}/> RAM</span>
                        <span className="tnum text-sm">68%</span>
                      </div>
                      <Bars data={[55,58,60,62,65,67,68,70,71,72,71,70,68,67,65,64,63,62,61,60,62,65,66,68]} color="var(--info)"/>
                    </div>
                    <div>
                      <div className="flex center between mb-2">
                        <span className="text-sm fw-6"><Icon name="network" size={12}/> Net</span>
                        <span className="tnum text-sm">128 Mbps</span>
                      </div>
                      <Bars data={[30,45,60,80,90,120,140,160,180,150,130,100,80,60,50,40,55,70,90,110,128,118,100,85]} color="var(--ok)"/>
                    </div>
                  </div>
                </div>
              </div>

              {v.notes && <div className="card"><div className="card-head"><h3 className="card-title">Internal notes</h3></div><div className="card-body"><textarea rows={3} defaultValue={v.notes} onBlur={e => updateVM(v.id, { notes: e.target.value })} style={{ width: '100%' }}/></div></div>}
            </div>
          )}

          {tab === 'network' && (
            <div className="flex col gap-4">
              <div className="card"><div className="card-body">
                <dl className="dl">
                  <dt>Public access</dt><dd>{v.publicAccess ? <span className="pill ok"><span className="dot"/>Enabled</span> : <span className="pill"><span className="dot"/>Disabled</span>}</dd>
                  <dt>Public IPv4</dt><dd className="mono">{v.publicIp}</dd>
                  <dt>VLAN</dt><dd className="mono">{v.vlan}</dd>
                  <dt>Port forwarding</dt><dd className="mono text-sm">{v.portForward}</dd>
                  <dt>Interconnect</dt><dd>{v.interconnect.length ? v.interconnect.map((id: string) => <span key={id} className="id-tag" style={{marginRight:4}}>{id}</span>) : <span className="text-mute">none</span>}</dd>
                  <dt>Firewall policy</dt><dd className="mono">{v.firewallPolicy}</dd>
                </dl>
              </div></div>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Firewall rules</h3><button className="btn sm" onClick={() => logActivity('Open Firewall rules editor from the sidebar', 'info')}><Icon name="edit" size={11}/>Edit</button></div>
                <div className="card-body flush">
                  <table className="tbl">
                    <thead><tr><th>Action</th><th>Source</th><th>Destination</th><th>Port</th><th>Protocol</th></tr></thead>
                    <tbody>
                      <tr><td><span className="pill ok"><span className="dot"/>Allow</span></td><td className="mono">any</td><td className="mono">{v.publicIp}</td><td className="mono">443</td><td className="mono">TCP</td></tr>
                      <tr><td><span className="pill ok"><span className="dot"/>Allow</span></td><td className="mono">any</td><td className="mono">{v.publicIp}</td><td className="mono">80</td><td className="mono">TCP</td></tr>
                      <tr><td><span className="pill ok"><span className="dot"/>Allow</span></td><td className="mono">trusted-admin</td><td className="mono">{v.publicIp}</td><td className="mono">22</td><td className="mono">TCP</td></tr>
                      <tr><td><span className="pill bad"><span className="dot"/>Deny</span></td><td className="mono">any</td><td className="mono">{v.publicIp}</td><td className="mono">*</td><td className="mono">*</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'creds' && (
            <div className="flex col gap-4">
              <div className="card">
                <div className="card-head"><h3 className="card-title">Stored credentials</h3><SecCheck on={v.security}/></div>
                <div className="card-body">
                  <div style={{ padding: 12, background: 'var(--warn-soft)', borderRadius: 6, fontSize: 12, color: 'oklch(0.4 0.12 75)', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14 }}>
                    <Icon name="lock" size={14}/>
                    <div>Credentials are encrypted at rest (AES-256). Access requires 2FA and is logged.</div>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Type</th><th>Username</th><th>Password</th><th>Last accessed</th><th></th></tr></thead>
                    <tbody>
                      <tr><td>root</td><td className="mono">root</td><td className="mono">••••••••••••</td><td className="text-mute text-sm">2 days ago · Ko Thein</td><td className="right"><button className="btn sm"><Icon name="eye" size={11}/>Reveal</button></td></tr>
                      <tr><td>app user</td><td className="mono">{v.name.split('-')[0]}-admin</td><td className="mono">••••••••••••</td><td className="text-mute text-sm">5 days ago</td><td className="right"><button className="btn sm"><Icon name="eye" size={11}/>Reveal</button></td></tr>
                      <tr><td>SSH key</td><td className="mono">id_ed25519</td><td className="mono">SHA256:••••••••••••</td><td className="text-mute text-sm">1 week ago</td><td className="right"><button className="btn sm"><Icon name="download" size={11}/>RAR</button></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Security compliance</h3></div>
                <div className="card-body">
                  <div className="flex col gap-2 text-sm">
                    {[
                      ['Root login disabled (SSH)', true],
                      ['Firewall policy applied', true],
                      ['Daily backups configured', !!v.backup && v.backup !== 'None'],
                      ['Latest OS security patches', true],
                      ['Fail2ban / brute-force protection', v.security],
                      ['TLS certificate valid', v.publicAccess ? true : null],
                    ].filter(([_, x]) => x !== null).map(([label, ok], i) => (
                      <div key={i} className="flex center gap-2">
                        <span style={{ color: ok ? 'var(--ok)' : 'var(--warn)' }}><Icon name={ok ? 'check' : 'alert'} size={14}/></span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="card">
              <div className="card-head"><h3 className="card-title">Invoices for this VM</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Invoice</th><th>Issued</th><th>Due</th><th className="right">Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {vmInvoices.length === 0 && <tr><td colSpan={5}><div className="empty"><div className="sub">No invoices yet.</div></div></td></tr>}
                    {vmInvoices.map((inv: any) => (
                      <tr key={inv.id}>
                        <td className="mono">{inv.id}</td>
                        <td className="tnum text-sm">{inv.issued}</td>
                        <td className="tnum text-sm">{inv.due}</td>
                        <td className="right tnum fw-6">MMK {formatMMK(inv.amount)}</td>
                        <td><StatusPill status={inv.status}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="card">
              <div className="card-body">
                {state.activity.filter((a: any) => a.text.includes(v.name) || a.text.includes(v.id)).map((a: any, i: number) => (
                  <div key={i} className="feed-item">
                    <span className={`dot ${a.kind}`}/>
                    <div className="body">{a.text}<div className="meta">{a.actor} · {a.ts}</div></div>
                  </div>
                ))}
                {state.activity.filter((a: any) => a.text.includes(v.name) || a.text.includes(v.id)).length === 0 && <div className="empty"><div className="sub">No activity yet.</div></div>}
              </div>
            </div>
          )}

          {tab === 'backups' && (
            <div className="flex col gap-4">
              <div className="card">
                <div className="card-head"><h3 className="card-title">Backup policy</h3></div>
                <div className="card-body">
                  <dl className="dl">
                    <dt>Schedule</dt><dd>{v.backup}</dd>
                    <dt>Total snapshots</dt><dd className="tnum">14</dd>
                    <dt>Storage used</dt><dd className="tnum">42.8 GB</dd>
                    <dt>Last successful</dt><dd className="tnum">2026-05-27 02:14</dd>
                  </dl>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Recent snapshots</h3></div>
                <div className="card-body flush">
                  <table className="tbl">
                    <thead><tr><th>Snapshot ID</th><th>Created</th><th className="right">Size</th><th>Type</th><th></th></tr></thead>
                    <tbody>
                      {[
                        ['snap-2026-0527-0214', '2026-05-27 02:14', '4.2 GB', 'Daily'],
                        ['snap-2026-0526-0214', '2026-05-26 02:14', '4.1 GB', 'Daily'],
                        ['snap-2026-0525-0214', '2026-05-25 02:14', '4.1 GB', 'Daily'],
                        ['snap-2026-0501-0200', '2026-05-01 02:00', '38.2 GB', 'Monthly'],
                      ].map((s: any) => (
                        <tr key={s[0]}><td className="mono text-xs">{s[0]}</td><td className="tnum text-sm">{s[1]}</td><td className="right tnum text-sm">{s[2]}</td><td><span className="pill subtle">{s[3]}</span></td><td className="right"><button className="btn sm">Restore</button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { VMDrawer }
export default VMList
