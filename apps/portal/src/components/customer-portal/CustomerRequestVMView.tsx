import React, { useState } from 'react'
import useTaskStore from '../../store/taskStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { IaaSCard, SpecPill, SpecStepper, ReviewBlock, SummaryLine } from './VMHelperComponents'

interface CustomerRequestVMViewProps {
  me: any
  setView: (view: string) => void
}

export const CustomerRequestVMView: React.FC<CustomerRequestVMViewProps> = ({ me, setView }) => {
  const { addTask } = useTaskStore()
  const { toast } = useUIStore()
  const [step, setStep] = useState(1)
  const [f, setF] = useState({
    purpose: '',
    hostname: '',
    os: 'ubuntu',
    osVersion: '22.04 LTS',
    sizing: 'preset',
    preset: 'business',
    vcpu: 4,
    ram: 16,
    volumes: [{ size: 200 }],
    bandwidth: '1 Gbps',
    backupEnabled: false,
    backupFrequency: 'Daily',
    backupRetention: 7,
    monitoring: false,
    zone: 'yangon-dc1',
    nics: [{ id: 1, label: 'NIC 1', type: 'Public', vlan: 'auto' }],
    firewallPorts: ['22', '80', '443'],
    portForwarding: [] as any[],
    vmProtection: 'none',
    ddosProtection: 'none',
    sslCertificate: 'none',
    loadBalancer: 'none',
    additionalNotes: '',
  })
  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))

  const presets = [
    { id: 'starter', label: 'Starter', vcpu: 2, ram: 4, storage: 50, desc: 'Small services, dev work' },
    { id: 'standard', label: 'Standard', vcpu: 4, ram: 8, storage: 100, desc: 'Web apps, staging' },
    { id: 'business', label: 'Business', vcpu: 4, ram: 16, storage: 200, desc: 'Production workloads', popular: true },
    { id: 'performance', label: 'Performance', vcpu: 8, ram: 32, storage: 500, desc: 'Heavy traffic, databases' },
    { id: 'enterprise', label: 'Enterprise', vcpu: 16, ram: 64, storage: 1000, desc: 'Mission-critical' },
  ]

  const osCatalog = [
    { id: 'ubuntu', name: 'Ubuntu', accent: 'oklch(0.6 0.17 30)', versions: ['24.04 LTS', '22.04 LTS', '20.04 LTS'], logo: 'U' },
    { id: 'debian', name: 'Debian', accent: 'oklch(0.55 0.18 0)', versions: ['12 (Bookworm)', '11 (Bullseye)'], logo: 'D' },
    { id: 'rocky', name: 'Rocky Linux', accent: 'oklch(0.58 0.16 155)', versions: ['9.3', '9.2', '8.9'], logo: 'R' },
    { id: 'alpine', name: 'Alpine', accent: 'oklch(0.55 0.15 230)', versions: ['3.19', '3.18'], logo: 'A' },
    { id: 'centos', name: 'CentOS Stream', accent: 'oklch(0.55 0.17 285)', versions: ['9', '8'], logo: 'C' },
    { id: 'windows', name: 'Windows Server', accent: 'oklch(0.5 0.14 245)', versions: ['2022', '2019'], logo: 'W' },
  ]

  const zones = [
    { id: 'yangon-dc1', name: 'Yangon Zone A', flag: '🇲🇲', sub: 'Primary · low latency', latency: '2ms' },
    { id: 'yangon-dc2', name: 'Yangon Zone B', flag: '🇲🇲', sub: 'Secondary · DR pair', latency: '4ms' },
    { id: 'mandalay-dc1', name: 'Mandalay Zone A', flag: '🇲🇲', sub: 'North coverage', latency: '12ms' },
  ]

  const bandwidthOpts = ['100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps']

  const commonPorts = [
    { port: '22', label: 'SSH', desc: 'Secure Shell' },
    { port: '80', label: 'HTTP', desc: 'Web traffic' },
    { port: '443', label: 'HTTPS', desc: 'Secure web' },
    { port: '3389', label: 'RDP', desc: 'Remote Desktop' },
    { port: '21', label: 'FTP', desc: 'File Transfer' },
    { port: '25', label: 'SMTP', desc: 'Email' },
    { port: '587', label: 'SMTP-TLS', desc: 'Email (TLS)' },
    { port: '3306', label: 'MySQL', desc: 'MySQL database' },
    { port: '5432', label: 'PostgreSQL', desc: 'PostgreSQL' },
    { port: '27017', label: 'MongoDB', desc: 'MongoDB' },
    { port: '6379', label: 'Redis', desc: 'Redis cache' },
    { port: '8080', label: 'HTTP-Alt', desc: 'Alternate HTTP' },
  ]

  const spec = f.sizing === 'preset'
    ? (presets.find(p => p.id === f.preset) || presets[2])
    : { vcpu: f.vcpu, ram: f.ram, storage: f.volumes[0]?.size || 200 }

  const cpuSteps = [1, 2, 4, 8, 16, 32]
  const ramSteps = [1, 2, 4, 8, 16, 32, 64, 128]
  const storageSteps = [25, 50, 100, 200, 500, 1000, 2000]

  const selectedOS = osCatalog.find(o => o.id === f.os) || osCatalog[0]
  const selectedZone = zones.find(z => z.id === f.zone) || zones[0]
  const hostValid = /^[a-z0-9][a-z0-9-]{1,30}$/i.test(f.hostname)

  const canContinue = () => {
    if (step === 1) return !!f.purpose
    if (step === 2) return hostValid
    return true
  }

  const setVolumeCount = (count: number) => {
    const cur = f.volumes
    const next = count > cur.length
      ? [...cur, ...Array.from({ length: count - cur.length }, () => ({ size: 100 }))]
      : cur.slice(0, count)
    set('volumes', next)
  }
  const setVolumeSize = (idx: number, size: number) => {
    const next = [...f.volumes]
    next[idx] = { ...next[idx], size }
    set('volumes', next)
  }

  const togglePort = (port: string) => {
    const ports = f.firewallPorts
    set('firewallPorts', ports.includes(port) ? ports.filter((p: string) => p !== port) : [...ports, port])
  }
  const [customPort, setCustomPort] = useState('')
  const addCustomPort = () => {
    const p = customPort.trim()
    if (!p || f.firewallPorts.includes(p)) return
    set('firewallPorts', [...f.firewallPorts, p])
    setCustomPort('')
  }

  const [pfDraft, setPfDraft] = useState({ srcPort: '', dstPort: '', protocol: 'TCP' })
  const addPfRule = () => {
    if (!pfDraft.srcPort || !pfDraft.dstPort) return
    set('portForwarding', [...f.portForwarding, { ...pfDraft, id: Date.now() }])
    setPfDraft({ srcPort: '', dstPort: '', protocol: 'TCP' })
  }
  const removePfRule = (id: number) => set('portForwarding', f.portForwarding.filter((r: any) => r.id !== id))

  const addNic = () => {
    if (f.nics.length >= 3) return
    set('nics', [...f.nics, { id: Date.now(), label: `NIC ${f.nics.length + 1}`, type: 'Private', vlan: 'vlan-100' }])
  }
  const removeNic = (id: number) => { if (f.nics.length > 1) set('nics', f.nics.filter((n: any) => n.id !== id)) }
  const updateNic = (id: number, key: string, val: any) => set('nics', f.nics.map((n: any) => n.id === id ? { ...n, [key]: val } : n))

  const submit = () => {
    const volumeDesc = f.volumes.map((v: any, i: number) => `Disk ${i+1}: ${v.size} GB SSD`).join(', ')
    addTask({
      title: `VM request — ${f.hostname} (${spec.vcpu}c / ${spec.ram}GB / ${f.volumes.map((v: any) => v.size).join('+')}GB)`,
      customer: me.id, vm: '', type: 'New', priority: 'Normal', status: 'Pending', team: 'Sales',
      subscription: '—',
      assignee: (me as any).salesperson || '—',
      notes: `Customer-initiated VM request via portal.
Hostname: ${f.hostname}
Purpose: ${f.purpose || '—'}
Spec: ${spec.vcpu} vCPU · ${spec.ram} GB RAM · ${volumeDesc}${f.sizing === 'preset' ? ` (${presets.find(p => p.id === f.preset)?.label} preset)` : ' (custom)'}
Bandwidth: ${f.bandwidth}
Backup: ${f.backupEnabled ? `${f.backupFrequency}, ${f.backupRetention}-day retention` : 'No'}
Monitoring: ${f.monitoring ? 'Enabled' : 'No'}
OS: ${selectedOS?.name} ${f.osVersion}
Zone: ${selectedZone?.name}
NICs: ${f.nics.map((n: any) => `${n.label} (${n.type}, VLAN: ${n.vlan})`).join('; ')}
Firewall ports: ${f.firewallPorts.join(', ') || 'none'}
Port forwarding: ${f.portForwarding.length ? f.portForwarding.map((r: any) => `${r.srcPort}→${r.dstPort}/${r.protocol}`).join(', ') : 'none'}
VM Protection: ${f.vmProtection}
DDoS Protection: ${f.ddosProtection}
SSL Certificate: ${f.sslCertificate}
Load Balancer: ${f.loadBalancer}
Customer notes: ${f.additionalNotes || '—'}`,
    })
    toast(`Deployment request sent — ${(me as any).salesperson || 'Sales'} will confirm shortly`, 'ok')
    setView('requests')
  }

  const stepLabels = ['Purpose', 'Hostname & OS', 'Specification', 'Zone & Network', 'Firewall', 'Add-ons', 'Review']
  const totalSteps = stepLabels.length

  return (
    <div className="content" style={{ maxWidth: 1180, margin: '0 auto', paddingBottom: 100 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Deploy a new VM</h1>
          <p className="page-subtitle">Configure your instance — choose the specs you need</p>
        </div>
        <div className="page-actions">
          <span className="text-xs text-mute">Step {step} of {totalSteps}</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            {stepLabels.map((label, i) => {
              const n = i + 1
              const done = n < step
              const active = n === step
              return (
                <React.Fragment key={label}>
                  <button
                    onClick={() => n < step && setStep(n)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      background: 'transparent', border: 'none',
                      cursor: n < step ? 'pointer' : 'default',
                      padding: '4px 4px', flexShrink: 0, minWidth: 68,
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: done ? 'var(--accent)' : active ? 'var(--accent-soft)' : 'var(--surface-3)',
                      color: done ? 'var(--accent-fg)' : active ? 'var(--accent-strong)' : 'var(--ink-3)',
                      display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13,
                      border: active ? '2px solid var(--accent)' : 'none',
                      transition: 'background 0.2s, transform 0.15s',
                      transform: active ? 'scale(1.08)' : 'scale(1)',
                    }}>{done ? <Icon name="check" size={14}/> : n}</div>
                    <span className="text-xs fw-6" style={{
                      color: active ? 'var(--ink)' : done ? 'var(--ink-2)' : 'var(--ink-3)',
                      whiteSpace: 'nowrap', letterSpacing: '0.005em',
                    }}>{label}</span>
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, minWidth: 8,
                      background: n < step ? 'var(--accent)' : 'var(--surface-3)',
                      marginTop: 16, transition: 'background 0.3s',
                    }}/>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step body */}
      <div className="grid-asym" style={{ gap: 24, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1: Purpose */}
          {step === 1 && (
            <div className="card">
              <div className="card-head"><h3 className="card-title">What's this VM for?</h3></div>
              <div className="card-body">
                <div className="field">
                  <label>Purpose / project name</label>
                  <input value={f.purpose} onChange={e => set('purpose', e.target.value)} placeholder="e.g. Production web app, ERP database, dev environment"/>
                  <div className="hint">Helps your account manager allocate the right resources.</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Hostname & OS */}
          {step === 2 && (
            <>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Hostname</h3></div>
                <div className="card-body">
                  <div className="field">
                    <label>VM hostname</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        value={f.hostname}
                        onChange={e => set('hostname', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="my-production-app"
                        style={{ fontFamily: 'var(--mono)', paddingRight: 110, width: '100%' }}
                      />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>.vpsmm.local</span>
                    </div>
                    <div className="hint" style={{ color: f.hostname && !hostValid ? 'var(--bad)' : undefined }}>
                      {f.hostname && !hostValid
                        ? 'Hostname must be 2–31 chars, lowercase letters, digits, or hyphen.'
                        : 'Lowercase letters, digits, hyphens. 2–31 characters. Must start with a letter or digit.'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Choose an OS image</h3>
                  <span className="text-xs text-mute">{selectedOS?.name} {f.osVersion}</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {osCatalog.map(os => (
                      <IaaSCard key={os.id} selected={f.os === os.id} onClick={() => { set('os', os.id); set('osVersion', os.versions[0]) }} padding={14 as any}>
                        <div className="flex center gap-2 mb-2">
                          <div style={{ width: 38, height: 38, borderRadius: 8, background: `${os.accent}1a`, color: os.accent, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{os.logo}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="fw-7 text-sm">{os.name}</div>
                            <div className="text-xs text-mute">{os.versions.length} versions</div>
                          </div>
                          {f.os === os.id && <Icon name="check" size={14} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <select
                          value={f.os === os.id ? f.osVersion : os.versions[0]}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { set('os', os.id); set('osVersion', e.target.value) }}
                          style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 5, background: 'var(--surface)', fontSize: 11.5 }}
                        >
                          {os.versions.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Specification */}
          {step === 3 && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Compute</h3>
                  <div className="flex gap-1" style={{ background: 'var(--surface-3)', borderRadius: 8, padding: 3 }}>
                    {[['preset', 'Presets'], ['custom', 'Custom']].map(([id, label]) => (
                      <button key={id} onClick={() => set('sizing', id)}
                        style={{
                          padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                          background: f.sizing === id ? 'var(--surface)' : 'transparent',
                          color: f.sizing === id ? 'var(--ink)' : 'var(--ink-3)',
                          boxShadow: f.sizing === id ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.15s',
                        }}>{label}</button>
                    ))}
                  </div>
                </div>
                <div className="card-body">
                  {f.sizing === 'preset' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      {presets.map(p => (
                        <IaaSCard key={p.id} selected={f.preset === p.id} onClick={() => set('preset', p.id)} padding={16 as any}>
                          <div className="flex center between mb-2">
                            <div className="flex center gap-2">
                              <span className="fw-7" style={{ fontSize: 15 }}>{p.label}</span>
                              {p.popular && <span className="pill accent" style={{ fontSize: 10 }}><span className="dot"/>Popular</span>}
                            </div>
                            {f.preset === p.id && <Icon name="check" size={15} style={{ color: 'var(--accent-strong)' }}/>}
                          </div>
                          <div className="text-xs text-mute mb-3">{p.desc}</div>
                          <div className="flex between" style={{ gap: 8 }}>
                            <SpecPill icon="cpu" value={p.vcpu} unit="vCPU"/>
                            <SpecPill icon="database" value={p.ram} unit="GB RAM"/>
                            <SpecPill icon="box" value={p.storage} unit="GB SSD"/>
                          </div>
                        </IaaSCard>
                      ))}
                    </div>
                  ) : (
                    <div className="flex col gap-4">
                      <SpecStepper label="vCPU cores" icon="cpu" steps={cpuSteps} value={f.vcpu} unit="" onChange={v => set('vcpu', v)}/>
                      <SpecStepper label="Memory" icon="database" steps={ramSteps} value={f.ram} unit=" GB" onChange={v => set('ram', v)}/>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Storage volumes</h3>
                  <div className="flex center gap-2">
                    <span className="text-xs text-mute">Number of disks:</span>
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setVolumeCount(n)}
                        className={`filter-chip ${f.volumes.length === n ? 'active' : ''}`}
                        style={{ minWidth: 36 }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex col gap-4">
                    {f.volumes.map((vol: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex center between mb-2">
                          <span className="fw-6 text-sm flex center gap-2">
                            <Icon name="box" size={13}/>
                            {idx === 0 ? 'System disk (OS)' : `Data disk ${idx}`}
                          </span>
                          <span className="tnum fw-7" style={{ fontSize: 15, color: 'var(--accent-strong)' }}>{vol.size} GB SSD</span>
                        </div>
                        <div className="flex gap-1 wrap">
                          {storageSteps.map(s => (
                            <button key={s} onClick={() => setVolumeSize(idx, s)}
                              className={`filter-chip ${vol.size === s ? 'active' : ''}`}
                              style={{ minWidth: 52, justifyContent: 'center' }}>
                              {s} GB
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3 className="card-title">Network bandwidth</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {bandwidthOpts.map(bw => (
                      <IaaSCard key={bw} selected={f.bandwidth === bw} onClick={() => set('bandwidth', bw)} padding={12 as any}>
                        <div className="flex center between mb-1">
                          <span className="fw-7 text-sm">{bw}</span>
                          {f.bandwidth === bw && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="text-xs text-mute">{bw === '10 Gbps' ? 'Dedicated line' : bw === '1 Gbps' ? 'Recommended' : bw === '100 Mbps' ? 'Basic' : 'Standard'}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              {/* Backup service */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Backup service</h3>
                  <span className={`toggle ${f.backupEnabled ? 'on' : ''}`} onClick={() => set('backupEnabled', !f.backupEnabled)}/>
                </div>
                {f.backupEnabled && (
                  <div className="card-body">
                    <div className="flex col gap-3">
                      <div>
                        <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Frequency</div>
                        <div className="flex gap-2">
                          {['Daily', 'Weekly', 'Monthly'].map(freq => (
                            <button key={freq} className={`filter-chip ${f.backupFrequency === freq ? 'active' : ''}`} onClick={() => set('backupFrequency', freq)}>{freq}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Retention</div>
                        <div className="flex gap-2">
                          {[7, 14, 30, 90].map(days => (
                            <button key={days} className={`filter-chip ${f.backupRetention === days ? 'active' : ''}`} onClick={() => set('backupRetention', days as any)}>{days} days</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Managed monitoring */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Managed monitoring & alerts</div>
                    <div className="text-xs text-mute mt-1">CPU, RAM, disk, and uptime alerts via email/SMS</div>
                  </div>
                  <span className={`toggle ${f.monitoring ? 'on' : ''}`} onClick={() => set('monitoring', !f.monitoring)}/>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Zone & Network */}
          {step === 4 && (
            <>
              <div className="card">
                <div className="card-head"><h3 className="card-title">Choose a zone</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {zones.map(z => (
                      <IaaSCard key={z.id} selected={f.zone === z.id} onClick={() => set('zone', z.id)} padding={14 as any}>
                        <div className="flex center between mb-2">
                          <div style={{ fontSize: 24, lineHeight: 1 }}>{z.flag}</div>
                          {f.zone === z.id && <Icon name="check" size={14} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="fw-7 text-sm">{z.name}</div>
                        <div className="text-xs text-mute">{z.sub}</div>
                        <div className="text-xs mt-2 mono"><span className="text-mute">Latency:</span> <span className="fw-6">{z.latency}</span></div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              {/* Network Interface Controllers */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Network interfaces (NICs)</h3>
                  {f.nics.length < 3 && (
                    <button className="btn sm" onClick={addNic}><Icon name="plus" size={11}/>Add NIC</button>
                  )}
                </div>
                <div className="card-body">
                  <div className="flex col gap-3">
                    {f.nics.map((nic: any, idx: number) => (
                      <div key={nic.id} style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
                        <div className="flex center between mb-3">
                          <div className="flex center gap-2">
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: idx === 0 ? 'var(--accent-soft)' : 'var(--surface-3)', color: idx === 0 ? 'var(--accent-strong)' : 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
                              <Icon name="network" size={13}/>
                            </div>
                            <div>
                              <div className="fw-7 text-sm">{nic.label}</div>
                              {idx === 0 && <div className="text-xs text-mute">Primary interface</div>}
                            </div>
                          </div>
                          {idx > 0 && (
                            <button className="btn sm danger" onClick={() => removeNic(nic.id)}><Icon name="trash" size={11}/>Remove</button>
                          )}
                        </div>
                        <div className="grid-2" style={{ gap: 12 }}>
                          <div>
                            <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Interface type</div>
                            <div className="flex gap-2">
                              {['Public', 'Private'].map(t => (
                                <button key={t} className={`filter-chip ${nic.type === t ? 'active' : ''}`} onClick={() => updateNic(nic.id, 'type', t)}>{t}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>VLAN / subnet</div>
                            <select value={nic.vlan} onChange={e => updateNic(nic.id, 'vlan', e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', fontSize: 12, width: '100%' }}>
                              <option value="auto">Auto-assign</option>
                              <option value="vlan-100">VLAN 100 (default)</option>
                              <option value="vlan-200">VLAN 200 (management)</option>
                              <option value="vlan-300">VLAN 300 (storage)</option>
                              <option value="vlan-400">VLAN 400 (backup)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-mute mt-2">Up to 3 NICs per VM. Additional NICs require VLAN setup by the network team.</div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="field">
                    <label>Anything else for our team? (optional)</label>
                    <textarea rows={3} value={f.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} placeholder="Migration timeline, integrations, preferred contact…"/>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 5: Firewall */}
          {step === 5 && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Firewall rules — inbound ports</h3>
                  <span className="text-xs text-mute">{f.firewallPorts.length} port{f.firewallPorts.length !== 1 ? 's' : ''} open</span>
                </div>
                <div className="card-body">
                  <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Common services — select all that apply</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {commonPorts.map(p => {
                      const active = f.firewallPorts.includes(p.port)
                      return (
                        <button key={p.port} onClick={() => togglePort(p.port)}
                          style={{
                            textAlign: 'left', padding: 12,
                            background: active ? 'var(--accent-soft)' : 'var(--surface)',
                            border: '1.5px solid', borderColor: active ? 'var(--accent)' : 'var(--line)',
                            borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                            transition: 'all 0.15s',
                          }}>
                          <div className="flex center between mb-1">
                            <span className="mono fw-7 text-sm" style={{ color: active ? 'var(--accent-strong)' : 'var(--ink)' }}>{p.port}</span>
                            {active && <Icon name="check" size={12} style={{ color: 'var(--accent-strong)' }}/>}
                          </div>
                          <div className="fw-6 text-xs">{p.label}</div>
                          <div className="text-xs text-mute">{p.desc}</div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="text-xs text-mute fw-6 mt-4 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Custom port</div>
                  <div className="flex gap-2">
                    <input value={customPort} onChange={e => setCustomPort(e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && addCustomPort()}
                      placeholder="e.g. 8443"
                      style={{ width: 120, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5, fontFamily: 'var(--mono)' }}
                    />
                    <button className="btn" onClick={addCustomPort}><Icon name="plus" size={12}/>Add port</button>
                  </div>

                  {f.firewallPorts.length > 0 && (
                    <div style={{ marginTop: 16, padding: 12, background: 'var(--surface-2)', borderRadius: 8 }}>
                      <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Open ports</div>
                      <div className="flex gap-1 wrap">
                        {f.firewallPorts.map(p => (
                          <span key={p} className="pill accent" style={{ paddingRight: 4 }}>
                            <span className="mono">{p}</span>
                            <button className="icon-btn" style={{ width: 16, height: 16, marginLeft: 2 }} onClick={() => togglePort(p)}><Icon name="x" size={9}/></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Port forwarding */}
              <div className="card">
                <div className="card-head">
                  <h3 className="card-title">Port forwarding</h3>
                  <span className="text-xs text-mute">{f.portForwarding.length} rule{f.portForwarding.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="card-body">
                  <div className="text-xs text-mute mb-3">Map incoming public ports to internal destination ports on this VM.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px auto', gap: 8, marginBottom: 12, alignItems: 'end' }}>
                    <div>
                      <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Source port</div>
                      <input value={pfDraft.srcPort} onChange={e => setPfDraft({ ...pfDraft, srcPort: e.target.value.replace(/[^0-9]/g, '') })} placeholder="e.g. 8080" style={{ fontFamily: 'var(--mono)', width: '100%' }}/>
                    </div>
                    <div>
                      <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Destination port</div>
                      <input value={pfDraft.dstPort} onChange={e => setPfDraft({ ...pfDraft, dstPort: e.target.value.replace(/[^0-9]/g, '') })} placeholder="e.g. 80" style={{ fontFamily: 'var(--mono)', width: '100%' }}/>
                    </div>
                    <div>
                      <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Protocol</div>
                      <select value={pfDraft.protocol} onChange={e => setPfDraft({ ...pfDraft, protocol: e.target.value })} style={{ width: '100%', padding: '7px 8px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5 }}>
                        <option>TCP</option>
                        <option>UDP</option>
                      </select>
                    </div>
                    <button className="btn primary" onClick={addPfRule} disabled={!pfDraft.srcPort || !pfDraft.dstPort}><Icon name="plus" size={12}/>Add</button>
                  </div>

                  {f.portForwarding.length > 0 && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {f.portForwarding.map((pf: any, i: number) => (
                        <div key={i} style={{ padding: 10, background: 'var(--surface-2)', borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="mono fw-6" style={{ minWidth: 60 }}>{pf.srcPort}</span>
                          <Icon name="arrow-right" size={10} className="text-mute"/>
                          <span className="mono fw-6" style={{ minWidth: 60 }}>{pf.dstPort}</span>
                          <span className="text-xs text-mute" style={{ minWidth: 40 }}>{pf.protocol}</span>
                          <div style={{ flex: 1 }}/>
                          <button className="icon-btn" onClick={() => removePfRule(pf.id)}><Icon name="x" size={12}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 6: Add-on Services */}
          {step === 6 && (
            <>
              <div className="card">
                <div className="card-head"><h3 className="card-title">VM protection</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'No automated protection', icon: 'x' },
                      { id: 'daily', label: 'Daily snapshot', desc: 'Automated daily snapshots, 7-day retention', icon: 'refresh' },
                      { id: 'advanced', label: 'Advanced backup', desc: 'Daily + weekly + cross-zone replication', icon: 'shield' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.vmProtection === opt.id} onClick={() => set('vmProtection', opt.id)} padding={14 as any}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: f.vmProtection === opt.id ? 'var(--accent-soft)' : 'var(--surface-3)', color: f.vmProtection === opt.id ? 'var(--accent-strong)' : 'var(--ink-3)', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
                          <Icon name={opt.icon} size={13}/>
                        </div>
                        <div className="fw-7 text-sm">{opt.label}</div>
                        <div className="text-xs text-mute mt-1">{opt.desc}</div>
                        {f.vmProtection === opt.id && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)', marginTop: 6 }}/>}
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3 className="card-title">DDoS protection</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'No DDoS mitigation', color: 'var(--ink-3)' },
                      { id: 'standard', label: 'Standard', desc: 'L3/L4 volumetric mitigation up to 10 Gbps', color: 'oklch(0.55 0.16 75)' },
                      { id: 'advanced', label: 'Advanced', desc: 'L7 application protection + 24/7 SOC monitoring', color: 'var(--bad)' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.ddosProtection === opt.id} onClick={() => set('ddosProtection', opt.id)} padding={14 as any}>
                        <div className="flex center between mb-2">
                          <div className="fw-7 text-sm" style={{ color: f.ddosProtection === opt.id ? opt.color : 'var(--ink)' }}>{opt.label}</div>
                          {f.ddosProtection === opt.id && <Icon name="check" size={13} style={{ color: opt.color }}/>}
                        </div>
                        <div className="text-xs text-mute">{opt.desc}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3 className="card-title">SSL / TLS certificate</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'Manage your own certificates' },
                      { id: 'standard', label: 'Standard DV', desc: 'Domain-validated certificate, single domain' },
                      { id: 'wildcard', label: 'Wildcard', desc: 'Covers *.yourdomain.com and all subdomains' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.sslCertificate === opt.id} onClick={() => set('sslCertificate', opt.id)} padding={14 as any}>
                        <div className="flex center between mb-2">
                          <div className="fw-7 text-sm">{opt.label}</div>
                          {f.sslCertificate === opt.id && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="text-xs text-mute">{opt.desc}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3 className="card-title">Load balancer</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'none', label: 'None', desc: 'Direct traffic to this VM only' },
                      { id: 'shared', label: 'Shared LB', desc: 'Multi-tenant balancer, HTTP/HTTPS routing' },
                      { id: 'dedicated', label: 'Dedicated LB', desc: 'Dedicated instance, custom rules + health checks' },
                    ].map(opt => (
                      <IaaSCard key={opt.id} selected={f.loadBalancer === opt.id} onClick={() => set('loadBalancer', opt.id)} padding={14 as any}>
                        <div className="flex center between mb-2">
                          <div className="fw-7 text-sm">{opt.label}</div>
                          {f.loadBalancer === opt.id && <Icon name="check" size={13} style={{ color: 'var(--accent-strong)' }}/>}
                        </div>
                        <div className="text-xs text-mute">{opt.desc}</div>
                      </IaaSCard>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 7: Review */}
          {step === 7 && (
            <div className="card">
              <div className="card-head"><h3 className="card-title">Review your configuration</h3></div>
              <div className="card-body">
                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Instance</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <ReviewBlock icon="server" label="Hostname" value={<span className="mono">{f.hostname}.vpsmm.local</span>}/>
                  <ReviewBlock icon="box" label="Purpose" value={f.purpose || '—'}/>
                  <ReviewBlock icon="database" label="Operating system" value={`${selectedOS?.name} ${f.osVersion}`}/>
                  <ReviewBlock icon="globe" label="Zone" value={selectedZone?.name}/>
                </div>

                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Compute & Storage</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <ReviewBlock icon="cpu" label="vCPU" value={`${spec.vcpu} cores`}/>
                  <ReviewBlock icon="database" label="Memory" value={`${spec.ram} GB RAM`}/>
                  <ReviewBlock icon="box" label="Storage" value={`${f.volumes.map((v: any) => v.size).join('+')} GB SSD`}/>
                  <ReviewBlock icon="zap" label="Bandwidth" value={f.bandwidth}/>
                </div>

                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Firewall</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <ReviewBlock icon="shield" label="Open ports" value={f.firewallPorts.length > 0 ? f.firewallPorts.join(', ') : 'None'}/>
                  <ReviewBlock icon="network" label="Port forwarding" value={f.portForwarding.length > 0 ? `${f.portForwarding.length} rule${f.portForwarding.length > 1 ? 's' : ''}` : 'None'}/>
                </div>

                <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Add-on services</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 8 }}>
                  <ReviewBlock icon="shield" label="VM protection" value={f.vmProtection === 'none' ? 'None' : f.vmProtection === 'daily' ? 'Daily snapshot' : 'Advanced backup'}/>
                  <ReviewBlock icon="alert" label="DDoS protection" value={f.ddosProtection === 'none' ? 'None' : f.ddosProtection.charAt(0).toUpperCase() + f.ddosProtection.slice(1)}/>
                  <ReviewBlock icon="lock" label="SSL certificate" value={f.sslCertificate === 'none' ? 'None' : f.sslCertificate === 'standard' ? 'Standard DV' : 'Wildcard'}/>
                  <ReviewBlock icon="network" label="Load balancer" value={f.loadBalancer === 'none' ? 'None' : f.loadBalancer === 'shared' ? 'Shared LB' : 'Dedicated LB'}/>
                </div>

                {f.additionalNotes && (
                  <div style={{ marginTop: 16, padding: 14, background: 'var(--surface-2)', borderRadius: 8 }}>
                    <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Notes for our team</div>
                    <div className="text-sm">{f.additionalNotes}</div>
                  </div>
                )}
                <div className="card" style={{ background: 'var(--info-soft)', borderColor: 'transparent', marginTop: 16 }}>
                  <div className="card-body" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Icon name="alert" size={14} style={{ marginTop: 2, color: 'var(--info)' }}/>
                    <div style={{ fontSize: 12.5, color: 'var(--info)' }}>
                      Submitting sends this to <strong>{(me as any).salesperson || 'Sales'}</strong> as a Pending request. Your account manager will confirm the configuration and follow up with next steps.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step navigation */}
          <div className="flex center" style={{ gap: 10, paddingTop: 8 }}>
            {step > 1 && <button className="btn" onClick={() => setStep(step - 1)}><Icon name="chevron-left" size={11}/>Back</button>}
            <div style={{ flex: 1 }}/>
            {step < totalSteps && <button className="btn primary" disabled={!canContinue()} onClick={() => setStep(step + 1)}>Continue<Icon name="chevron-right" size={11}/></button>}
            {step === totalSteps && <button className="btn accent" onClick={submit} style={{ padding: '10px 18px', fontSize: 13 }}><Icon name="check" size={13}/>Submit deployment request</button>}
          </div>
        </div>

        {/* Sticky configuration summary */}
        <div style={{ position: 'sticky', top: 16 }}>
          <div className="card">
            <div className="card-head" style={{ paddingTop: 14, paddingBottom: 12 }}>
              <h3 className="card-title">Your configuration</h3>
              <span className="pill accent" style={{ fontSize: 10 }}><span className="dot"/>{f.sizing === 'preset' ? (presets.find(p => p.id === f.preset)?.label || 'Preset') : 'Custom'}</span>
            </div>
            <div className="card-body" style={{ padding: '14px 18px' }}>
              <SummaryLine icon="server" label="Hostname" value={f.hostname || <span className="text-mute">not set</span>} mono/>
              <SummaryLine icon="database" label="OS" value={selectedOS ? `${selectedOS.name} ${f.osVersion}` : '—'}/>
              <div className="divider" style={{ margin: '10px 0' }}/>
              <SummaryLine icon="cpu" label="vCPU" value={`${spec.vcpu} cores`}/>
              <SummaryLine icon="database" label="RAM" value={`${spec.ram} GB`}/>
              <SummaryLine icon="box" label={`Storage (${f.volumes.length} disk${f.volumes.length > 1 ? 's' : ''})`} value={`${f.volumes.reduce((a: number, v: any) => a + v.size, 0)} GB SSD`}/>
              <SummaryLine icon="network" label="Bandwidth" value={f.bandwidth}/>
              <SummaryLine icon="refresh" label="Backup" value={f.backupEnabled ? f.backupFrequency : 'No'}/>
              <SummaryLine icon="alert" label="Monitoring" value={f.monitoring ? 'Enabled' : 'No'}/>
              <div className="divider" style={{ margin: '10px 0' }}/>
              <SummaryLine icon="globe" label="Zone" value={selectedZone?.name || '—'}/>
              <SummaryLine icon="network" label="NICs" value={`${f.nics.length} interface${f.nics.length > 1 ? 's' : ''}`}/>
              <SummaryLine icon="shield" label="Firewall" value={`${f.firewallPorts.length} port${f.firewallPorts.length !== 1 ? 's' : ''} open`}/>
              {(f.vmProtection !== 'none' || f.ddosProtection !== 'none' || f.sslCertificate !== 'none' || f.loadBalancer !== 'none') && (
                <>
                  <div className="divider" style={{ margin: '10px 0' }}/>
                  {f.vmProtection !== 'none' && <SummaryLine icon="shield" label="VM protection" value={f.vmProtection === 'daily' ? 'Daily snapshot' : 'Advanced'}/>}
                  {f.ddosProtection !== 'none' && <SummaryLine icon="alert" label="DDoS" value={f.ddosProtection.charAt(0).toUpperCase() + f.ddosProtection.slice(1)}/>}
                  {f.sslCertificate !== 'none' && <SummaryLine icon="lock" label="SSL" value={f.sslCertificate === 'standard' ? 'Standard DV' : 'Wildcard'}/>}
                  {f.loadBalancer !== 'none' && <SummaryLine icon="network" label="Load balancer" value={f.loadBalancer === 'shared' ? 'Shared' : 'Dedicated'}/>}
                </>
              )}
            </div>
          </div>
          <div className="text-xs text-mute mt-3" style={{ textAlign: 'center' }}>
            Need help? Contact <strong>{(me as any).salesperson || 'Sales'}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
