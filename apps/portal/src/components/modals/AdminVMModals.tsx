// Admin VM action modals — New VM, Renew, Change Spec (matching original UI)

import React, { useState } from 'react'
import useVMStore from '../../store/vmStore'
import useCustomerStore from '../../store/customerStore'
import useTaskStore from '../../store/taskStore'
import useInvoiceStore from '../../store/invoiceStore'
import useTeamStore from '../../store/teamStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { formatMMK, StatusPill, Avatar } from '../ui/ui'

interface VM {
  id: string
  name: string
  customer: string
  priceMonth: number
  expiry: string
  vcpu: number
  ram: number
  storage: number
  bandwidth: string
  os: string
  datacenter: string
  node: string
  type: string
  status: string
}

// ── New VM Modal ────────────────────────────────────────────────────────
interface NewVMModalProps {
  onClose: () => void
}

const NewVMModal: React.FC<NewVMModalProps> = ({ onClose }) => {
  const { addVM } = useVMStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const [step, setStep] = useState(1)
  const [f, setF] = useState({
    customer: customers.find((c: any) => c.kyc === 'Approved')?.id || '',
    name: '',
    environment: 'Production',
    label: '',
    purpose: '',
    adminContact: '',
    type: 'Paid',
    subscription: '1 year',
    autoRenew: true,
    priceMonth: 180000,
    vcpu: 4, ram: 16, storage: 200, bandwidth: '1 Gbps',
    osFamily: 'ubuntu', os: 'Ubuntu 22.04 LTS',
    sshKey: '',
    publicAccess: true,
    portForward: '443→443, 22→2222',
    vlan: '',
    publicIp: '',
    datacenter: 'Yangon DC1',
    node: 'pve-node-02',
    firewallPolicy: '',
    backup: 'Daily 02:00, 7d retention',
    security: true,
    notes: '',
    powerState: 'Running',
    proxmoxFlag: 'P',
    interconnect: [],
    start: new Date().toISOString().slice(0,10),
    expiry: '',
  })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))

  const approvedCustomers = customers.filter((c: any) => c.kyc === 'Approved')
  const cust = approvedCustomers.find((c: any) => c.id === f.customer)
  const osCatalog = [
    { id: 'ubuntu', name: 'Ubuntu', logo: 'U', accent: 'oklch(0.6 0.17 30)', kind: 'Linux', versions: ['24.04 LTS', '22.04 LTS', '20.04 LTS'] },
    { id: 'debian', name: 'Debian', logo: 'D', accent: 'oklch(0.55 0.18 0)', kind: 'Linux', versions: ['12 (Bookworm)', '11 (Bullseye)'] },
    { id: 'rocky', name: 'Rocky Linux', logo: 'R', accent: 'oklch(0.58 0.16 155)', kind: 'Linux', versions: ['9.3', '8.9'] },
    { id: 'alma', name: 'AlmaLinux', logo: 'A', accent: 'oklch(0.6 0.15 25)', kind: 'Linux', versions: ['9.3', '8.9'] },
    { id: 'centos', name: 'CentOS Stream', logo: 'C', accent: 'oklch(0.55 0.17 285)', kind: 'Linux', versions: ['9', '8'] },
    { id: 'fedora', name: 'Fedora Server', logo: 'F', accent: 'oklch(0.5 0.16 250)', kind: 'Linux', versions: ['40', '39'] },
    { id: 'alpine', name: 'Alpine', logo: 'Al', accent: 'oklch(0.55 0.15 230)', kind: 'Linux', versions: ['3.19', '3.18'] },
    { id: 'windows', name: 'Windows Server', logo: 'W', accent: 'oklch(0.5 0.14 245)', kind: 'Windows', versions: ['2022', '2019'] },
    { id: 'freebsd', name: 'FreeBSD', logo: 'B', accent: 'oklch(0.55 0.18 15)', kind: 'BSD', versions: ['14.0', '13.3'] },
    { id: 'docker', name: 'Docker (Ubuntu)', logo: '◧', accent: 'oklch(0.55 0.13 230)', kind: 'App template', versions: ['Ubuntu 22.04 + Docker 26'] },
    { id: 'wordpress', name: 'WordPress', logo: 'Wp', accent: 'oklch(0.5 0.12 250)', kind: 'App template', versions: ['LAMP + WP 6.5'] },
    { id: 'cpanel', name: 'cPanel / WHM', logo: 'cP', accent: 'oklch(0.58 0.15 40)', kind: 'App template', versions: ['AlmaLinux 9 + cPanel'] },
  ]
  const selOS = osCatalog.find((o: any) => o.id === f.osFamily) || osCatalog[0]

  const cpuSteps = [1, 2, 4, 6, 8, 12, 16, 24, 32]
  const ramSteps = [1, 2, 4, 8, 16, 24, 32, 48, 64, 128]
  const storageSteps = [25, 50, 100, 200, 400, 500, 1000, 2000]

  const computedPrice = f.vcpu * 20000 + f.ram * 6000 + f.storage * 200 + (f.bandwidth === '1 Gbps' ? 30000 : f.bandwidth === '500 Mbps' ? 10000 : 0)

  const submit = () => {
    const expiry = new Date()
    const months: Record<string, number> = { '14-day trial': 0.5, '6 months': 6, '1 year': 12, '2 years': 24 }
    expiry.setMonth(expiry.getMonth() + (months[f.subscription] || 12))
    addVM({
      ...f,
      status: 'Active',
      priceMonth: f.priceMonth || computedPrice,
      expiry: expiry.toISOString().slice(0,10),
      firewallPolicy: f.firewallPolicy || `fw-${f.name || 'vm'}`,
      vlan: f.vlan || `VLAN-${200 + Math.floor(Math.random() * 50)}`,
      publicIp: f.publicAccess ? (f.publicIp || `203.81.64.${100 + Math.floor(Math.random()*100)}`) : '—',
      tags: f.label ? [f.label.toLowerCase()] : [],
      notes: f.notes || (f.purpose ? `Purpose: ${f.purpose}` : ''),
    })
    toast(`VM ${f.name} created and queued for provisioning`, 'ok')
    onClose()
  }

  const stepLabels = ['Customer & details', 'OS template', 'Specification', 'Network', 'Review']
  const totalSteps = stepLabels.length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Provision new VM</h3>
            <div className="text-xs text-mute mt-1">Step {step} of {totalSteps} — {stepLabels[step-1]}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        <div className="modal-body">
          {/* Stepper */}
          <div className="flex gap-1 mb-4" style={{ alignItems: 'center' }}>
            {stepLabels.map((l, i) => (
              <React.Fragment key={l}>
                <div className="flex center gap-2" style={{ opacity: i + 1 <= step ? 1 : 0.5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: i + 1 < step ? 'var(--ok)' : i + 1 === step ? 'var(--accent)' : 'var(--surface-3)', color: i + 1 <= step ? '#fff' : 'var(--ink-3)', display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 700 }}>
                    {i + 1 < step ? <Icon name="check" size={11}/> : i + 1}
                  </div>
                  <span className="text-xs fw-6" style={{ whiteSpace: 'nowrap', color: i + 1 === step ? 'var(--ink)' : 'var(--ink-3)' }}>{l}</span>
                </div>
                {i < stepLabels.length - 1 && <div style={{ flex: 1, height: 2, background: i + 1 < step ? 'var(--ok)' : 'var(--surface-3)' }}/>}
              </React.Fragment>
            ))}
          </div>
          {/* Step 1: Customer & details */}
          {step === 1 && (
            <div className="flex col gap-3">
              <div className="field">
                <label>Customer</label>
                <select value={f.customer} onChange={e => set('customer', e.target.value)}>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.company} — {c.name}</option>
                  ))}
                </select>
                <div className="hint">Only KYC-approved customers can have new VMs provisioned.</div>
              </div>
              {cust && (
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={cust.name} size={32}/>
                  <div style={{ flex: 1 }}>
                    <div className="fw-6 text-sm">{cust.company}</div>
                    <div className="text-xs text-mute">{cust.id} · {cust.email} · {cust.phone}</div>
                  </div>
                  <StatusPill status={cust.kyc}/>
                </div>
              )}
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field">
                  <label>VM name (hostname)</label>
                  <input value={f.name} onChange={e => set('name', e.target.value.replace(/\s/g, '-').toLowerCase())} placeholder="mlc-app-prod-02" style={{ fontFamily: 'var(--mono)' }}/>
                </div>
                <div className="field">
                  <label>Label / tag</label>
                  <input value={f.label} onChange={e => set('label', e.target.value)} placeholder="e.g. erp, web, db"/>
                </div>
              </div>
              <div className="field">
                <label>Environment</label>
                <div className="flex gap-2">
                  {['Production', 'Staging', 'Development'].map(en => (
                    <button key={en} type="button" className={`filter-chip ${f.environment === en ? 'active' : ''}`} onClick={() => set('environment', en)}>{en}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Purpose / workload</label>
                <input value={f.purpose} onChange={e => set('purpose', e.target.value)} placeholder="e.g. ERP production database, internal web app"/>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field">
                  <label>Type</label>
                  <select value={f.type} onChange={e => set('type', e.target.value)}>
                    <option>Paid</option><option>Trial</option>
                  </select>
                </div>
                <div className="field">
                  <label>Subscription period</label>
                  <select value={f.subscription} onChange={e => set('subscription', e.target.value)}>
                    {f.type === 'Trial'
                      ? <option>14-day trial</option>
                      : <><option>6 months</option><option>1 year</option><option>2 years</option></>}
                  </select>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field">
                  <label>Start date</label>
                  <input type="date" value={f.start} onChange={e => set('start', e.target.value)}/>
                </div>
                <div className="field">
                  <label>Technical contact (email)</label>
                  <input value={f.adminContact} onChange={e => set('adminContact', e.target.value)} placeholder={cust?.email || 'admin@customer.com'}/>
                </div>
              </div>
              <div className="flex center between" style={{ padding: '4px 2px' }}>
                <div><div className="fw-6 text-sm">Auto-renew</div><div className="text-xs text-mute">Renew automatically before expiry</div></div>
                <span className={`toggle ${f.autoRenew ? 'on' : ''}`} onClick={() => set('autoRenew', !f.autoRenew)}/>
              </div>
            </div>
          )}

          {/* Step 2: OS template */}
          {step === 2 && (
            <div className="flex col gap-3">
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Choose an OS template</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {osCatalog.map((o: any) => {
                  const sel = f.osFamily === o.id
                  return (
                    <button key={o.id} type="button"
                      onClick={() => { set('osFamily', o.id); set('os', `${o.name} ${o.versions[0]}`); }}
                      style={{
                        textAlign: 'left', padding: 11, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                        background: sel ? 'var(--accent-soft)' : 'var(--surface)', border: '1.5px solid', borderColor: sel ? 'var(--accent)' : 'var(--line)',
                        boxShadow: sel ? '0 0 0 3px var(--accent-soft)' : 'none', transition: 'all 0.15s',
                      }}
                    >
                      <div className="flex center gap-2 mb-1">
                        <span style={{ width: 30, height: 30, borderRadius: 7, background: `${o.accent}1a`, color: o.accent, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{o.logo}</span>
                        {sel && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)', marginLeft: 'auto' }}/>}
                      </div>
                      <div className="fw-7" style={{ fontSize: 12 }}>{o.name}</div>
                      <div className="text-xs text-mute">{o.kind} · {o.versions.length} ver.</div>
                    </button>
                  )
                })}
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field">
                  <label>Version</label>
                  <select value={f.os.replace(`${selOS.name} `, '')} onChange={e => set('os', `${selOS.name} ${e.target.value}`)}>
                    {selOS.versions.map((v: string) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Architecture</label>
                  <select defaultValue="x86_64"><option>x86_64</option><option>aarch64</option></select>
                </div>
              </div>
              <div className="field">
                <label>SSH public key (optional)</label>
                <textarea rows={2} value={f.sshKey} onChange={e => set('sshKey', e.target.value)} placeholder="ssh-ed25519 AAAA… (leave blank to auto-generate root password)" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}/>
              </div>
              <div style={{ padding: 12, background: 'var(--info-soft)', borderRadius: 8, fontSize: 12, display: 'flex', gap: 8, color: 'var(--info)' }}>
                <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: 1 }}/>
                <div>Selected image: <strong>{f.os}</strong>. The same OS catalog is offered to customers in the self-service Request VM flow.</div>
              </div>
            </div>
          )}

          {/* Step 3: Specification */}
          {step === 3 && (
            <div className="flex col gap-4">
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Custom configuration — size every resource</div>
              {[
                { label: 'vCPU cores', icon: 'cpu', steps: cpuSteps, val: f.vcpu, k: 'vcpu', unit: '' },
                { label: 'Memory', icon: 'database', steps: ramSteps, val: f.ram, k: 'ram', unit: ' GB' },
                { label: 'Storage (SSD)', icon: 'box', steps: storageSteps, val: f.storage, k: 'storage', unit: ' GB' },
              ].map((row: any) => (
                <div key={row.k}>
                  <div className="flex center between mb-2">
                    <span className="fw-6 text-sm flex center gap-2"><Icon name={row.icon} size={13}/>{row.label}</span>
                    <span className="tnum fw-7" style={{ fontSize: 15, color: 'var(--accent-strong)' }}>{row.val}{row.unit}</span>
                  </div>
                  <div className="flex gap-1 wrap">
                    {row.steps.map((s: number) => (
                      <button key={s} type="button" className={`filter-chip ${row.val === s ? 'active' : ''}`} onClick={() => set(row.k, s)} style={{ minWidth: 48, justifyContent: 'center' }}>{s}{row.unit}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field"><label>Bandwidth</label><select value={f.bandwidth} onChange={e => set('bandwidth', e.target.value)}><option>100 Mbps</option><option>500 Mbps</option><option>1 Gbps</option></select></div>
                <div className="field"><label>Backup policy</label><select value={f.backup} onChange={e => set('backup', e.target.value)}><option>None</option><option>Daily 02:00, 7d retention</option><option>Daily 02:00, 14d retention</option><option>Hourly snapshots, 48h retention</option><option>Weekly Sun 02:00, 4w retention</option></select></div>
              </div>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10 }}>
                <div className="flex center between">
                  <div className="text-sm">Custom instance <span className="fw-7 mono">{f.vcpu}c · {f.ram}GB · {f.storage}GB</span></div>
                  <div className="right">
                    <div className="text-xs text-mute">Suggested price</div>
                    <div className="tnum fw-7" style={{ fontSize: 15 }}>MMK {formatMMK(computedPrice)}/mo</div>
                  </div>
                </div>
                <div className="field mt-3"><label>Monthly price (MMK) — override</label><input type="number" value={f.priceMonth} onChange={e => set('priceMonth', +e.target.value)} placeholder={String(computedPrice)}/></div>
              </div>
            </div>
          )}

          {/* Step 4: Network */}
          {step === 4 && (
            <div className="flex col gap-3">
              <div className="flex center between">
                <div>
                  <div className="fw-6 text-sm">Public access</div>
                  <div className="text-xs text-mute">Assign a public IPv4 and enable inbound routing</div>
                </div>
                <span className={`toggle ${f.publicAccess ? 'on' : ''}`} onClick={() => set('publicAccess', !f.publicAccess)}/>
              </div>
              {f.publicAccess && (
                <>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div className="field"><label>Public IPv4</label><input value={f.publicIp} onChange={e => set('publicIp', e.target.value)} placeholder="auto-assign" style={{ fontFamily: 'var(--mono)' }}/></div>
                    <div className="field"><label>VLAN</label><input value={f.vlan} onChange={e => set('vlan', e.target.value)} placeholder="auto-assign" style={{ fontFamily: 'var(--mono)' }}/></div>
                  </div>
                  <div className="field"><label>Port forwarding</label><input value={f.portForward} onChange={e => set('portForward', e.target.value)} placeholder="443→443, 22→2222" style={{ fontFamily: 'var(--mono)' }}/></div>
                </>
              )}
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field"><label>Datacenter</label><select value={f.datacenter} onChange={e => set('datacenter', e.target.value)}><option>Yangon DC1</option><option>Yangon DC2</option><option>Mandalay DC1</option></select></div>
                <div className="field"><label>Proxmox node</label><select value={f.node} onChange={e => set('node', e.target.value)}><option>pve-node-01</option><option>pve-node-02</option><option>pve-node-03</option><option>pve-node-04</option><option>pve-node-05</option></select></div>
              </div>
              <div className="field"><label>Firewall policy name</label><input value={f.firewallPolicy} onChange={e => set('firewallPolicy', e.target.value)} placeholder={`fw-${f.name || 'vm'}`} style={{ fontFamily: 'var(--mono)' }}/></div>
              <div className="flex center between" style={{ padding: '4px 2px' }}>
                <div><div className="fw-6 text-sm">Hardened security baseline</div><div className="text-xs text-mute">Fail2ban, disabled root SSH, auto-patching</div></div>
                <span className={`toggle ${f.security ? 'on' : ''}`} onClick={() => set('security', !f.security)}/>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="flex col gap-3">
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="building" size={12}/> Customer & account</h3></div>
                  <div className="card-body" style={{ padding: '10px 14px' }}>
                    <dl className="dl" style={{ gridTemplateColumns: '92px 1fr', gap: '7px 12px' }}>
                      <dt>Customer</dt><dd>{cust?.company}</dd>
                      <dt>Contact</dt><dd>{cust?.name}</dd>
                      <dt>Tech contact</dt><dd className="text-sm">{f.adminContact || cust?.email}</dd>
                      <dt>Environment</dt><dd><span className="pill subtle">{f.environment}</span></dd>
                      <dt>Auto-renew</dt><dd>{f.autoRenew ? 'Yes' : 'No'}</dd>
                    </dl>
                  </div>
                </div>
                <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="server" size={12}/> Instance</h3></div>
                  <div className="card-body" style={{ padding: '10px 14px' }}>
                    <dl className="dl" style={{ gridTemplateColumns: '78px 1fr', gap: '7px 12px' }}>
                      <dt>Hostname</dt><dd className="mono">{f.name || '—'}</dd>
                      <dt>Label</dt><dd>{f.label || '—'}</dd>
                      <dt>OS</dt><dd>{f.os}</dd>
                      <dt>Type</dt><dd>{f.type} · {f.subscription}</dd>
                      <dt>Start</dt><dd className="tnum">{f.start}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="cpu" size={12}/> Specification</h3></div>
                  <div className="card-body" style={{ padding: '10px 14px' }}>
                    <dl className="dl" style={{ gridTemplateColumns: '78px 1fr', gap: '7px 12px' }}>
                      <dt>vCPU</dt><dd className="tnum">{f.vcpu} cores</dd>
                      <dt>RAM</dt><dd className="tnum">{f.ram} GB</dd>
                      <dt>Storage</dt><dd className="tnum">{f.storage} GB SSD</dd>
                      <dt>Bandwidth</dt><dd>{f.bandwidth}</dd>
                      <dt>Backup</dt><dd className="text-sm">{f.backup}</dd>
                    </dl>
                  </div>
                </div>
                <div className="card"><div className="card-head" style={{ padding: '10px 14px' }}><h3 className="card-title" style={{ fontSize: 12 }}><Icon name="network" size={12}/> Network</h3></div>
                  <div className="card-body" style={{ padding: '10px 14px' }}>
                    <dl className="dl" style={{ gridTemplateColumns: '78px 1fr', gap: '7px 12px' }}>
                      <dt>Access</dt><dd>{f.publicAccess ? 'Public IPv4' : 'Private only'}</dd>
                      <dt>Ports</dt><dd className="mono text-sm">{f.publicAccess ? f.portForward : '—'}</dd>
                      <dt>Datacenter</dt><dd>{f.datacenter}</dd>
                      <dt>Node</dt><dd className="mono">{f.node}</dd>
                      <dt>Firewall</dt><dd className="mono text-sm">{f.firewallPolicy || `fw-${f.name || 'vm'}`}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--surface-2)' }}>
                <div className="card-body" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div className="text-xs text-mute">Monthly charge</div>
                    <div className="tnum fw-7" style={{ fontSize: 20 }}>MMK {formatMMK(f.priceMonth || computedPrice)}</div>
                  </div>
                  <div className="text-xs text-mute" style={{ textAlign: 'right', maxWidth: 280 }}>A provisioning task is created and assigned to Engineering. The customer is notified when the VM is ready.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step > 1 && <button className="btn" onClick={() => setStep(step - 1)}><Icon name="chevron-left" size={11}/>Back</button>}
          <div style={{ flex: 1 }}/>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          {step < totalSteps
            ? <button className="btn primary" onClick={() => setStep(step + 1)} disabled={step === 1 && !f.name}>Continue<Icon name="chevron-right" size={11}/></button>
            : <button className="btn accent" onClick={submit}><Icon name="check" size={12}/>Provision VM</button>}
        </div>
      </div>
    </div>
  )
}

// ── Renew Modal ─────────────────────────────────────────────────────────
interface RenewModalProps {
  vm: VM
  onClose: () => void
}

const RenewModal: React.FC<RenewModalProps> = ({ vm, onClose }) => {
  const { renew } = useVMStore()
  const { addInvoice } = useInvoiceStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const [months, setMonths] = useState(12)
  const monthOpts = [3, 6, 12, 24]
  const price = vm.priceMonth * months
  const c = customers.find((cust: any) => cust.id === vm.customer)

  const submit = () => {
    renew(vm.id, months)
    addInvoice({ customer: vm.customer, vms: [vm.id], amount: price, due: new Date(Date.now() + 10*86400000).toISOString().slice(0,10) })
    toast(`Renewed ${vm.name} for ${months} months`, 'ok')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Renew {vm.name}</h3>
            <div className="text-xs text-mute mt-1">Customer: {c?.company}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="field"><label>Renewal period</label>
              <div className="flex gap-2">
                {monthOpts.map(m => (
                  <button key={m} className={`filter-chip ${months === m ? 'active' : ''}`} onClick={() => setMonths(m)}>
                    {m < 12 ? `${m} months` : m === 12 ? '1 year' : `${m/12} years`}
                  </button>
                ))}
              </div>
            </div>
            <div className="card" style={{ background: 'var(--surface-2)' }}>
              <div className="card-body">
                <dl className="dl">
                  <dt>Current expiry</dt><dd className="tnum">{vm.expiry}</dd>
                  <dt>New expiry</dt><dd className="tnum fw-6" style={{ color: 'var(--ok)' }}>
                    {(() => { const d = new Date(vm.expiry === '—' ? Date.now() : vm.expiry); d.setMonth(d.getMonth() + months); return d.toISOString().slice(0,10); })()}
                  </dd>
                  <dt>Monthly rate</dt><dd className="tnum">MMK {formatMMK(vm.priceMonth)}</dd>
                  <dt>Renewal total</dt><dd className="tnum fw-7" style={{ fontSize: 14 }}>MMK {formatMMK(price)}</dd>
                </dl>
              </div>
            </div>
            <div style={{ padding: 12, background: 'var(--info-soft)', borderRadius: 6, fontSize: 12, display: 'flex', gap: 8 }}>
              <Icon name="invoice" size={14}/>
              <div>An invoice will be created automatically and emailed to the customer.</div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={submit}><Icon name="check" size={12}/>Renew & invoice</button>
        </div>
      </div>
    </div>
  )
}

// ── Change Spec Modal ────────────────────────────────────────────────────
interface SpecModalProps {
  vm: VM
  onClose: () => void
}

const SpecModal: React.FC<SpecModalProps> = ({ vm, onClose }) => {
  const { updateVM } = useVMStore()
  const { addTask } = useTaskStore()
  const { toast } = useUIStore()
  const [f, setF] = useState({ vcpu: vm.vcpu, ram: vm.ram, storage: vm.storage })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))
  const oldPrice = vm.priceMonth
  const newPrice = Math.round(oldPrice * (f.vcpu / vm.vcpu * 0.4 + f.ram / vm.ram * 0.4 + f.storage / vm.storage * 0.2))
  const diff = newPrice - oldPrice

  const submit = () => {
    updateVM(vm.id, { ...f, priceMonth: newPrice })
    addTask({ title: `Spec change: ${vm.name} (${vm.vcpu}/${vm.ram}/${vm.storage} → ${f.vcpu}/${f.ram}/${f.storage})`, customer: vm.customer, vm: vm.id, type: 'Upgrade', status: 'Pending' })
    toast('Spec change scheduled', 'ok')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Spec change — {vm.name}</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="grid-3" style={{ gap: 12 }}>
              <div className="field"><label>vCPU</label><input type="number" value={f.vcpu} onChange={e => set('vcpu', +e.target.value)}/></div>
              <div className="field"><label>RAM (GB)</label><input type="number" value={f.ram} onChange={e => set('ram', +e.target.value)}/></div>
              <div className="field"><label>Storage (GB)</label><input type="number" value={f.storage} onChange={e => set('storage', +e.target.value)}/></div>
            </div>
            <div className="card" style={{ background: 'var(--surface-2)' }}>
              <div className="card-body">
                <div className="flex center between">
                  <div><div className="text-xs text-mute">Old monthly</div><div className="tnum fw-6">MMK {formatMMK(oldPrice)}</div></div>
                  <Icon name="chevron-right" size={14}/>
                  <div><div className="text-xs text-mute">New monthly</div><div className="tnum fw-6">MMK {formatMMK(newPrice)}</div></div>
                  <div className="text-sm fw-7 tnum" style={{ color: diff >= 0 ? 'var(--bad)' : 'var(--ok)' }}>
                    {diff >= 0 ? '+' : ''}MMK {formatMMK(Math.abs(diff))}/mo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={submit}>Apply & schedule</button>
        </div>
      </div>
    </div>
  )
}

// ── New Task Modal ─────────────────────────────────────────────────────────
interface NewTaskModalProps {
  onClose: () => void
  presetStatus?: string
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, presetStatus }) => {
  const { addTask } = useTaskStore()
  const { customers } = useCustomerStore()
  const { team } = useTeamStore()
  const { vms } = useVMStore()
  const [f, setF] = useState({
    title: '',
    customer: customers[0]?.id || '',
    vm: '',
    type: 'New',
    priority: 'Normal',
    assignee: team.find((t: any) => t.role === 'Engineer')?.name || '—',
    team: 'Provisioning',
    subscription: '1 year',
    status: presetStatus || 'Pending',
    notes: '',
  })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))
  const custVMs = vms.filter((v: any) => v.customer === f.customer)

  const submit = () => {
    addTask(f)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Create provisioning task</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="field"><label>Title</label><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?"/></div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field"><label>Customer</label>
                <select value={f.customer} onChange={e => set('customer', e.target.value)}>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <div className="field"><label>Related VM (optional)</label>
                <select value={f.vm} onChange={e => set('vm', e.target.value)}>
                  <option value="">— None —</option>
                  {custVMs.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
                </select>
              </div>
            </div>
            <div className="grid-3" style={{ gap: 12 }}>
              <div className="field"><label>Type</label><select value={f.type} onChange={e => set('type', e.target.value)}><option>New</option><option>Renewal</option><option>Upgrade</option><option>Terminate</option></select></div>
              <div className="field"><label>Priority</label><select value={f.priority} onChange={e => set('priority', e.target.value)}><option>Normal</option><option>Urgent</option></select></div>
              <div className="field"><label>Status</label><select value={f.status} onChange={e => set('status', e.target.value)}><option>Pending</option><option>In Progress</option><option>Blocked</option><option>Done</option></select></div>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field"><label>Assignee</label>
                <select value={f.assignee} onChange={e => set('assignee', e.target.value)}>
                  <option value="—">Unassigned</option>
                  {team.map((t: any) => <option key={t.id} value={t.name}>{t.name} · {t.role}</option>)}
                </select>
              </div>
              <div className="field"><label>Team</label><select value={f.team} onChange={e => set('team', e.target.value)}><option>Sales</option><option>Provisioning</option><option>Network</option><option>Finance</option></select></div>
            </div>
            <div className="field"><label>Notes</label><textarea rows={2} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Context, links, customer comments…"/></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.title || !f.customer} onClick={submit}><Icon name="plus" size={12}/>Create task</button>
        </div>
      </div>
    </div>
  )
}

// ── Terminate Modal ───────────────────────────────────────────────────────
interface TerminateModalProps {
  vm: VM
  onClose: () => void
}

const TerminateModal: React.FC<TerminateModalProps> = ({ vm, onClose }) => {
  const { deleteVM } = useVMStore()
  const { toast } = useUIStore()
  const [confirmed, setConfirmed] = useState(false)

  const submit = () => {
    deleteVM(vm.id)
    toast(`VM ${vm.name} terminated`, 'bad')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--bad)' }}>Terminate {vm.name}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div style={{ padding: 14, background: 'var(--bad-soft)', borderRadius: 8, marginBottom: 16 }}>
            <div className="flex gap-2">
              <Icon name="alert" size={18} style={{ color: 'var(--bad)' }}/>
              <div>
                <div className="fw-7 text-sm" style={{ color: 'var(--bad)' }}>This action cannot be undone</div>
                <div className="text-xs text-mute mt-1">All data will be permanently deleted. This VM will be removed from your account.</div>
              </div>
            </div>
          </div>
          <div className="field">
            <label>Type the VM name to confirm</label>
            <input value={confirmed ? vm.name : ''} onChange={e => setConfirmed(e.target.value === vm.name)} placeholder={vm.name}/>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn danger" disabled={!confirmed} onClick={submit}>
            <Icon name="trash" size={12}/>Terminate VM
          </button>
        </div>
      </div>
    </div>
  )
}

// ── New Customer Modal ───────────────────────────────────────────────────────
interface NewCustomerModalProps {
  onClose: () => void
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ onClose }) => {
  const { addCustomer } = useCustomerStore()
  const { team } = useTeamStore()
  const [f, setF] = useState({ 
    name: '', 
    company: '', 
    email: '', 
    phone: '', 
    salesperson: team.find((t: any) => t.role === 'Sales')?.name || 'Su Su' 
  })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))

  const submit = () => {
    addCustomer(f)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Add new customer</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field"><label>Contact name</label><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Aung Min Htet"/></div>
              <div className="field"><label>Company</label><input value={f.company} onChange={e => set('company', e.target.value)} placeholder="Mandalay Logistics Co., Ltd"/></div>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field"><label>Email</label><input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="contact@company.com"/></div>
              <div className="field"><label>Phone</label><input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+95 9 ..."/></div>
            </div>
            <div className="field">
              <label>Assigned salesperson</label>
              <select value={f.salesperson} onChange={e => set('salesperson', e.target.value)}>
                {team.filter((t: any) => t.role === 'Sales').map((t: any) => <option key={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ padding: 12, background: 'var(--warn-soft)', borderRadius: 6, fontSize: 12, color: 'oklch(0.4 0.13 75)', display: 'flex', gap: 8 }}>
              <Icon name="alert" size={14}/>
              <div>Customer will be created with KYC status <strong>Pending</strong>. They'll receive an email link to upload identity documents.</div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.name || !f.email} onClick={submit}>
            <Icon name="plus" size={12}/>Add customer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Email Modal ───────────────────────────────────────────────────────────
interface EmailModalProps {
  onClose: () => void
  to?: string
  template?: string
}

const EmailModal: React.FC<EmailModalProps> = ({ onClose, to, template }) => {
  const { toast } = useUIStore()
  const templates: Record<string, { subject: string; body: string }> = {
    welcome: { subject: 'Welcome to VPS Myanmar', body: `Hi,\n\nThank you for signing up. To activate your account, please complete the KYC verification by uploading your ID and company registration documents.\n\nThe link is in the portal.\n\n— VPS Myanmar Team` },
    renewal: { subject: 'Your VM subscription is expiring soon', body: `Hi,\n\nYour subscription is set to expire in 7 days. To avoid service interruption, please confirm your renewal.\n\nReply to this email or visit the portal.\n\n— VPS Myanmar Team` },
    invoice: { subject: 'Invoice attached', body: `Hi,\n\nPlease find your invoice attached.\n\nPayment is due within 10 days. We accept KBZ Pay, AYA Bank, and CB Bank transfers.\n\n— VPS Myanmar Team` },
    kyc_request: { subject: 'KYC document re-upload', body: `Hi,\n\nWe need to re-verify your identity documents. Please upload a clearer image of your NRC.\n\nLink: portal.vpsmm.co/kyc\n\n— VPS Myanmar Team` },
  }
  const [tmpl, setTmpl] = useState(template || 'renewal')
  const [f, setF] = useState({ to: to || '', subject: templates[tmpl].subject, body: templates[tmpl].body })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))
  const pick = (k: string) => { setTmpl(k); setF(x => ({ ...x, subject: templates[k].subject, body: templates[k].body })) }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Compose email</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="field">
              <label>Template</label>
              <div className="flex gap-2 wrap">
                {Object.keys(templates).map(k => (
                  <button key={k} type="button" className={`filter-chip ${tmpl === k ? 'active' : ''}`} onClick={() => pick(k)}>
                    {k.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="field"><label>To</label><input value={f.to} onChange={e => set('to', e.target.value)} placeholder="customer@email.com"/></div>
            <div className="field"><label>Subject</label><input value={f.subject} onChange={e => set('subject', e.target.value)}/></div>
            <div className="field"><label>Body</label><textarea rows={6} value={f.body} onChange={e => set('body', e.target.value)}/></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Discard</button>
          <button className="btn" onClick={() => { toast('Saved as draft', 'info'); onClose() }}>Save draft</button>
          <button className="btn accent" onClick={() => { toast(`Email sent to ${f.to || 'customer'}`, 'ok'); onClose() }}><Icon name="mail" size={12}/>Send</button>
        </div>
      </div>
    </div>
  )
}

// ── Task Detail Modal ───────────────────────────────────────────────────────
interface TaskDetailModalProps {
  taskId: string
  onClose: () => void
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const { updateTask } = useTaskStore()
  const { tasks } = useTaskStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const t = tasks.find((x: any) => x.id === taskId)
  if (!t) return null
  const c = customers.find((cust: any) => cust.id === t.customer)

  const [f, setF] = useState({
    assignee: t.assignee || '—',
    priority: t.priority || 'Normal',
    status: t.status,
    internalNotes: (t as any).internalNotes || '',
  })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))

  const save = () => {
    updateTask(t.id, f)
    toast(`${t.id} updated`, 'ok')
    onClose()
  }

  const WF = [
    { label: 'Submitted', team: 'Customer', icon: 'mail', desc: 'Request received via portal' },
    { label: 'Sales review & KYC', team: 'Sales', icon: 'shield', desc: 'Verify customer & documents' },
    { label: 'KYC approved → notify Eng', team: 'VPS Portal', icon: 'check', desc: 'Provisioning task created' },
    { label: 'System: provision VM', team: 'Engineering', icon: 'server', desc: 'Build VM per specs' },
    { label: 'Network: firewall rules', team: 'Network', icon: 'shield', desc: 'Configure firewall & ports' },
    { label: 'KT: test & credentials', team: 'Engineering', icon: 'key', desc: 'Test VM, upload credentials' },
    { label: 'Handover to customer', team: 'Sales', icon: 'users', desc: 'Notify customer, send credentials' },
  ]
  const wfStage = WF.findIndex(w => w.label.includes(t.status) || t.status === 'Done' ? 6 : 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{t.id} · {t.title}</h3>
            <div className="text-xs text-mute mt-1">{c?.company} · {t.type} · {t.priority}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-4">
            {(t.type === 'New' || t.type === 'Upgrade') && (
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Provisioning workflow</h3>
                  <span className="pill accent"><span className="dot"/>Step {Math.min(wfStage + 1, WF.length)} of {WF.length}</span>
                </div>
                <div className="card-body">
                  <div className="flex col gap-2">
                    {WF.map((w, i) => (
                      <div key={w.label} className="flex center gap-3" style={{ opacity: i <= wfStage ? 1 : 0.4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < wfStage ? 'var(--ok)' : i === wfStage ? 'var(--accent)' : 'var(--surface-3)', color: i <= wfStage ? '#fff' : 'var(--ink-3)', display: 'grid', placeItems: 'center', fontSize: 11 }}>
                          {i < wfStage ? <Icon name="check" size={11}/> : <Icon name={w.icon} size={11}/>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="fw-6 text-sm">{w.label}</div>
                          <div className="text-xs text-mute">{w.desc} · {w.team}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-head"><h3 className="card-title">Task details</h3></div>
              <div className="card-body">
                <dl className="dl">
                  <dt>Customer</dt><dd>{c?.company}</dd>
                  <dt>Type</dt><dd>{t.type}</dd>
                  <dt>Priority</dt><dd>{t.priority}</dd>
                  <dt>Assignee</dt><dd>{t.assignee}</dd>
                  <dt>Team</dt><dd>{t.team}</dd>
                  <dt>Status</dt><dd>{t.status}</dd>
                  <dt>Created</dt><dd className="tnum">{t.created}</dd>
                </dl>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3 className="card-title">Customer notes</h3></div>
              <div className="card-body">
                <div className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{t.notes || 'No notes'}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3 className="card-title">Internal notes</h3></div>
              <div className="card-body">
                <textarea rows={3} value={f.internalNotes} onChange={e => set('internalNotes', e.target.value)} placeholder="Internal notes..."/>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn accent" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  )
}

// ── New Invoice Modal ───────────────────────────────────────────────────────
interface NewInvoiceModalProps {
  onClose: () => void
  presetCustomer?: string
}

const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ onClose, presetCustomer }) => {
  const { addInvoice } = useInvoiceStore()
  const { customers } = useCustomerStore()
  const { vms } = useVMStore()
  const [f, setF] = useState({
    customer: presetCustomer || customers[0]?.id || '',
    vms: [] as string[],
    months: 6,
  })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))
  const custVMs = vms.filter((v: any) => v.customer === f.customer && v.status !== 'Expired')
  const amount = custVMs.filter((v: any) => f.vms.includes(v.id)).reduce((a: number, v: any) => a + v.priceMonth * f.months, 0)
  const dueDate = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)
  const toggle = (id: string) => set('vms', f.vms.includes(id) ? f.vms.filter((x: string) => x !== id) : [...f.vms, id])

  const submit = () => {
    addInvoice({ customer: f.customer, vms: f.vms, amount, due: dueDate })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Create invoice</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="field"><label>Customer</label>
              <select value={f.customer} onChange={e => { set('customer', e.target.value); set('vms', []); }}>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
            <div className="field"><label>Billing period</label>
              <div className="flex gap-2">
                {[1, 3, 6, 12].map(m => (
                  <button key={m} type="button" className={`filter-chip ${f.months === m ? 'active' : ''}`} onClick={() => set('months', m)}>{m} {m === 1 ? 'month' : 'months'}</button>
                ))}
              </div>
            </div>
            <div className="field"><label>Include these VMs</label>
              <div className="card" style={{ borderColor: 'var(--line)' }}>
                <div className="card-body flush" style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {custVMs.length === 0 && <div className="empty"><div className="sub">No billable VMs for this customer.</div></div>}
                  {custVMs.map((v: any) => (
                    <label key={v.id} style={{ display: 'flex', padding: '10px 14px', borderBottom: '1px solid var(--line)', cursor: 'pointer', alignItems: 'center', gap: 10 }}>
                      <input type="checkbox" checked={f.vms.includes(v.id)} onChange={() => toggle(v.id)}/>
                      <div style={{ flex: 1 }}>
                        <div className="fw-6 text-sm">{v.name}</div>
                        <div className="text-xs text-mute mono">{v.id} · {v.vcpu}c · {v.ram}GB · {v.storage}GB</div>
                      </div>
                      <div className="tnum text-sm">MMK {formatMMK(v.priceMonth)}/mo</div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--surface-2)' }}>
              <div className="card-body">
                <div className="flex between"><span className="text-mute">Selected</span><span className="tnum fw-6">{f.vms.length} VM{f.vms.length !== 1 ? 's' : ''}</span></div>
                <div className="flex between"><span className="text-mute">Period</span><span className="tnum fw-6">{f.months} month{f.months !== 1 ? 's' : ''}</span></div>
                <div className="flex between"><span className="text-mute">Due date</span><span className="tnum fw-6">{dueDate}</span></div>
                <div className="divider"/>
                <div className="flex between"><span className="fw-7">Total</span><span className="tnum fw-7" style={{ fontSize: 16 }}>MMK {formatMMK(amount)}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.vms.length} onClick={submit}><Icon name="plus" size={12}/>Create invoice</button>
        </div>
      </div>
    </div>
  )
}

// ── Invite Member Modal ─────────────────────────────────────────────────────
interface InviteMemberModalProps {
  onClose: () => void
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose }) => {
  const { addMember } = useTeamStore()
  const { toast } = useUIStore()
  const [f, setF] = useState({ name: '', email: '', role: 'Sales', team: 'Sales' })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))

  const submit = () => {
    addMember(f)
    toast(`Invite sent to ${f.email}`, 'ok')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Invite team member</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="flex col gap-3">
            <div className="field"><label>Name</label><input value={f.name} onChange={e => set('name', e.target.value)}/></div>
            <div className="field"><label>Work email</label><input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="@vpsmm.co"/></div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field"><label>Role</label><select value={f.role} onChange={e => set('role', e.target.value)}><option>Admin</option><option>Sales</option><option>Engineer</option><option>Finance</option></select></div>
              <div className="field"><label>Team</label><select value={f.team} onChange={e => set('team', e.target.value)}><option>Sales</option><option>Provisioning</option><option>Network</option><option>Finance</option><option>Management</option></select></div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn accent" disabled={!f.name || !f.email} onClick={submit}><Icon name="mail" size={12}/>Send invite</button>
        </div>
      </div>
    </div>
  )
}

export { NewVMModal, RenewModal, SpecModal, TerminateModal, NewTaskModal, TaskDetailModal, NewCustomerModal, EmailModal, NewInvoiceModal, InviteMemberModal }
