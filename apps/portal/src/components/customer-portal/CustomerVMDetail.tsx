import React, { useState } from 'react'
import useVMStore from '../../store/vmStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { StatusPill, SecCheck, formatMMK } from '../ui/ui'
import { InfoCard, UsageCard, UsageDetailCard } from './VMHelperComponents'
import { CustUpgradeModal, CustChangePlanModal } from '../modals/CustomerVMModals'

interface CustomerVMDetailProps {
  vm: any
  onClose: () => void
  onRenew: () => void
}

export const CustomerVMDetail: React.FC<CustomerVMDetailProps> = ({ vm: initialVm, onClose, onRenew }) => {
  const { vms, startVM, stopVM, restartVM, snapshotVM, updateVMTags, updateVMNotes } = useVMStore()
  const { toast } = useUIStore()
  const vm = vms.find((v: any) => v.id === initialVm.id) || initialVm
  const [tab, setTab] = useState('overview')
  const [revealCreds, setRevealCreds] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [notesDraft, setNotesDraft] = useState(vm.notes || '')
  const [snapName, setSnapName] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [changePlanOpen, setChangePlanOpen] = useState(false)

  const tags = vm.tags || []
  const isRunning = vm.powerState === 'Running'

  const seed = vm.id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
  const seedRand = (i: number) => ((Math.sin(seed + i) + 1) / 2)
  const cpu = Array.from({ length: 24 }, (_, i) => Math.round(30 + seedRand(i) * 50))
  const ram = Array.from({ length: 24 }, (_, i) => Math.round(50 + seedRand(i * 2) * 35))
  const net = Array.from({ length: 24 }, (_, i) => Math.round(40 + seedRand(i * 3) * 140))
  const disk = Math.round(vm.storage * 0.42)

  const creds = [
    { type: 'root', user: 'root', pass: 'X9k$mP2vL!Q7nR8w' },
    { type: 'app user', user: `${vm.name.split('-')[0]}-admin`, pass: 'B3$jK9pX@2vN4mZq' },
  ]

  const snapshots = [
    { id: `snap-${vm.id.slice(3)}-d1`, date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), size: (3.8 + seedRand(1) * 0.6).toFixed(1), type: 'Daily' },
    { id: `snap-${vm.id.slice(3)}-d2`, date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), size: (3.8 + seedRand(2) * 0.6).toFixed(1), type: 'Daily' },
    { id: `snap-${vm.id.slice(3)}-d3`, date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), size: (3.8 + seedRand(3) * 0.6).toFixed(1), type: 'Daily' },
    { id: `snap-${vm.id.slice(3)}-w1`, date: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), size: (15.2 + seedRand(4) * 2).toFixed(1), type: 'Weekly' },
  ]

  const addTag = () => {
    if (!tagInput.trim()) return
    const next = [...tags, tagInput.trim()]
    updateVMTags(vm.id, next)
    setTagInput('')
  }
  const removeTag = (t: string) => updateVMTags(vm.id, tags.filter((x: string) => x !== t))

  const openConsole = () => {
    const params = new URLSearchParams({
      name: vm.name, id: vm.id, ip: vm.publicIp || '203.81.64.10',
      os: vm.os, vcpu: String(vm.vcpu), ram: String(vm.ram), storage: String(vm.storage),
      running: isRunning ? '1' : '0',
    })
    window.open(`vnc-console.html?${params.toString()}`, '_blank', 'noopener,width=1180,height=760')
    toast(`Opening VNC console for ${vm.name}…`, 'info')
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to VMs</button>
            <span className="mono text-xs text-mute">{vm.id}</span>
          </div>
          <h1 className="page-title">{vm.name}</h1>
          <div className="flex gap-2 mt-2">
            <StatusPill status={vm.status}/>
            <StatusPill status={vm.type}/>
            <span className="pill"><Icon name={isRunning ? 'play' : 'pause'} size={10}/>{vm.powerState}</span>
            <SecCheck on={vm.security}/>
            {tags.map((t: string) => <span key={t} className="pill subtle">#{t}</span>)}
          </div>
        </div>
        <div className="page-actions">
          {isRunning
            ? <button className="btn" onClick={() => stopVM(vm.id)}><Icon name="pause" size={12}/>Stop</button>
            : <button className="btn primary" onClick={() => startVM(vm.id)}><Icon name="play" size={12}/>Start</button>
          }
          <button className="btn" onClick={() => restartVM(vm.id)} disabled={!isRunning}><Icon name="refresh" size={12}/>Restart</button>
          <button className="btn" onClick={openConsole} disabled={!isRunning} title={isRunning ? 'Open VNC console in new tab' : 'Start the VM to open console'}><Icon name="terminal" size={12}/>Console<Icon name="external" size={10}/></button>
          <button className="btn" onClick={() => setUpgradeOpen(true)}><Icon name="arrow-up" size={12}/>Upgrade</button>
          <button className="btn" onClick={() => setChangePlanOpen(true)}><Icon name="sliders" size={12}/>Change plan</button>
          <button className="btn accent" onClick={onRenew}><Icon name="refresh" size={12}/>Renew</button>
        </div>

      {upgradeOpen && <CustUpgradeModal vm={vm} onClose={() => setUpgradeOpen(false)}/>}
      {changePlanOpen && <CustChangePlanModal vm={vm} onClose={() => setChangePlanOpen(false)}/>}
      </div>

      <div className="grid-4 mb-4">
        <UsageCard label="CPU" value={`${cpu[23]}%`} data={cpu} color="var(--accent)"/>
        <UsageCard label="RAM" value={`${ram[23]}%`} data={ram} color="var(--info)" sub={`${Math.round(vm.ram * ram[23] / 100)} / ${vm.ram} GB`}/>
        <UsageCard label="Storage" value={`${Math.round(disk / vm.storage * 100)}%`} data={[disk, disk, disk, disk]} color="oklch(0.55 0.18 285)" sub={`${disk} / ${vm.storage} GB`}/>
        <UsageCard label="Network out" value={`${net[23]} Mbps`} data={net} color="var(--ok)"/>
      </div>

      <div className="card">
        <div className="tabs">
          {['overview', 'specs', 'network', 'credentials', 'snapshots', 'usage', 'tags-notes'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'tags-notes' ? 'Tags & notes' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'snapshots' && <span className="count">{snapshots.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 14 }}>
              <InfoCard icon="cpu" title="Specification" rows={[
                ['vCPU', `${vm.vcpu} cores`],
                ['RAM', `${vm.ram} GB`],
                ['Storage', `${vm.storage} GB SSD`],
                ['Bandwidth', vm.bandwidth],
                ['OS', vm.os],
                ['Datacenter', vm.datacenter],
              ]}/>
              <InfoCard icon="invoice" title="Subscription" rows={[
                ['Type', vm.type],
                ['Period', vm.subscription],
                ['Started', vm.start],
                ['Expires', vm.expiry],
                ['Monthly', `MMK ${formatMMK(vm.priceMonth)}`],
                ['Auto-renew', 'On'],
              ]}/>
            </div>
          </div>
        )}

        {tab === 'network' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 24 }}>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Public access</div>
                <dl className="dl">
                  <dt>Public IPv4</dt><dd className="mono fw-6">{vm.publicIp}</dd>
                  <dt>VLAN</dt><dd className="mono">{vm.vlan}</dd>
                  <dt>Public access</dt><dd>{vm.publicAccess ? <span className="pill ok"><span className="dot"/>Enabled</span> : <span className="pill"><span className="dot"/>Disabled</span>}</dd>
                  <dt>Firewall policy</dt><dd className="mono">{vm.firewallPolicy}</dd>
                </dl>
              </div>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Allowed ports</div>
                <div className="card" style={{ borderColor: 'var(--line)' }}>
                  <div className="card-body flush">
                    <table className="tbl">
                      <thead><tr><th>Port</th><th>Protocol</th><th>Source</th></tr></thead>
                      <tbody>
                        <tr><td className="mono fw-6">443</td><td className="mono">TCP</td><td className="text-sm">any (HTTPS)</td></tr>
                        <tr><td className="mono fw-6">80</td><td className="mono">TCP</td><td className="text-sm">any (HTTP)</td></tr>
                        <tr><td className="mono fw-6">22</td><td className="mono">TCP</td><td className="text-sm">trusted-admin</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-xs text-mute mt-2">Port forwarding: <span className="mono">{vm.portForward}</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'credentials' && (
          <div className="card-body">
            <div style={{ padding: 12, background: 'var(--warn-soft)', borderRadius: 6, fontSize: 12, color: 'oklch(0.4 0.12 75)', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
              <Icon name="lock" size={14}/>
              <div>Credentials are encrypted at rest. Reveal logs an audit event.</div>
            </div>
            <table className="tbl">
              <thead><tr><th>Type</th><th>Username</th><th>Password</th><th>Last accessed</th><th></th></tr></thead>
              <tbody>
                {creds.map((c: any) => (
                  <tr key={c.type}>
                    <td>{c.type}</td>
                    <td className="mono">{c.user}</td>
                    <td className="mono">{revealCreds ? c.pass : '••••••••••••••••'}</td>
                    <td className="text-sm text-mute">2 days ago</td>
                    <td className="right">
                      <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(c.pass); toast('Password copied', 'ok') }}><Icon name="check" size={11}/>Copy</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>SSH key</td>
                  <td className="mono">id_ed25519</td>
                  <td className="mono">SHA256:{revealCreds ? 'X8k29...wPq7n' : '•••••••••••'}</td>
                  <td className="text-sm text-mute">1 week ago</td>
                  <td className="right"><button className="btn sm" onClick={() => toast('SSH key downloaded', 'info')}><Icon name="download" size={11}/>Download</button></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-3">
              <button className="btn" onClick={() => setRevealCreds(!revealCreds)}><Icon name="eye" size={12}/>{revealCreds ? 'Hide' : 'Reveal'} all</button>
              <button className="btn" onClick={() => toast('Password rotation requested — Sales will contact you', 'info')}><Icon name="refresh" size={12}/>Request rotation</button>
            </div>
          </div>
        )}

        {tab === 'snapshots' && (
          <div className="card-body">
            <div className="flex gap-2 mb-3">
              <input value={snapName} onChange={e => setSnapName(e.target.value)} placeholder="Snapshot name (optional)" style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5 }}/>
              <button className="btn primary" onClick={() => { snapshotVM(vm.id, snapName); setSnapName('') }}><Icon name="plus" size={12}/>Create snapshot</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Snapshot ID</th><th>Created</th><th className="right">Size</th><th>Type</th><th></th></tr></thead>
              <tbody>
                {snapshots.map((s: any) => (
                  <tr key={s.id}>
                    <td className="mono text-xs">{s.id}</td>
                    <td className="tnum text-sm">{s.date}</td>
                    <td className="right tnum text-sm">{s.size} GB</td>
                    <td><span className="pill subtle">{s.type}</span></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => toast(`Restoring from ${s.id}…`, 'info')}>Restore</button>
                      <button className="btn sm danger" style={{ marginLeft: 4 }} onClick={() => toast('Snapshot delete request submitted', 'info')}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'tags-notes' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 24 }}>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tags</div>
                <div className="flex wrap gap-2 mb-2">
                  {tags.length === 0 && <span className="text-xs text-mute">No tags yet.</span>}
                  {tags.map((t: string) => (
                    <span key={t} className="pill accent" style={{ paddingRight: 4 }}>
                      <span>#{t}</span>
                      <button className="icon-btn" style={{ width: 18, height: 18, marginLeft: 2 }} onClick={() => removeTag(t)}><Icon name="x" size={10}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add a tag (e.g. production, db, backup)" style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5 }}/>
                  <button className="btn" onClick={addTag}><Icon name="plus" size={12}/>Add</button>
                </div>
                <div className="text-xs text-mute mt-2">Tags help you organize VMs. Try: production, staging, db, web, backup-critical.</div>
              </div>
              <div>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Notes</div>
                <textarea
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  placeholder="Add notes for this VM…"
                  rows={6}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5, resize: 'vertical' }}
                />
                <div className="flex gap-2 mt-2">
                  <button className="btn accent" onClick={() => { updateVMNotes(vm.id, notesDraft); toast('Notes saved', 'ok') }}><Icon name="check" size={12}/>Save notes</button>
                  <button className="btn ghost" onClick={() => setNotesDraft(vm.notes || '')}>Reset</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'specs' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 14 }}>
              <InfoCard icon="server" title="Instance" mono rows={[
                ['VM ID', vm.id],
                ['Hostname', vm.name],
                ['Power state', vm.powerState],
                ['Datacenter', vm.datacenter],
                ['VLAN', vm.vlan],
              ]}/>
              <InfoCard icon="cpu" title="Hardware" rows={[
                ['vCPU cores', `${vm.vcpu}`],
                ['RAM', `${vm.ram} GB`],
                ['Storage', `${vm.storage} GB SSD`],
                ['Bandwidth', vm.bandwidth],
                ['Operating system', vm.os],
              ]}/>
            </div>
            <div style={{ padding: 12, background: 'var(--info-soft)', borderRadius: 8, fontSize: 12, display: 'flex', gap: 8, marginTop: 14, color: 'var(--info)' }}>
              <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: 1 }}/>
              <div>Need a different spec? Use <strong>Upgrade</strong> or <strong>Change plan</strong> above — your account manager will confirm with a quote.</div>
            </div>
          </div>
        )}

        {tab === 'usage' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <UsageDetailCard label="CPU" data={cpu} color="var(--accent)" unit="%" avg={Math.round(cpu.reduce((a, b) => a + b, 0) / cpu.length)} peak={Math.max(...cpu)}/>
              <UsageDetailCard label="RAM" data={ram} color="var(--info)" unit="%" avg={Math.round(ram.reduce((a, b) => a + b, 0) / ram.length)} peak={Math.max(...ram)}/>
              <UsageDetailCard label="Network out" data={net} color="var(--ok)" unit=" Mbps" avg={Math.round(net.reduce((a, b) => a + b, 0) / net.length)} peak={Math.max(...net)}/>
              <div className="card" style={{ borderColor: 'var(--line)' }}>
                <div className="card-body">
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Storage</div>
                  <div className="flex center between mb-2">
                    <span className="tnum fw-7" style={{ fontSize: 24 }}>{disk} GB</span>
                    <span className="text-sm text-mute tnum">of {vm.storage} GB</span>
                  </div>
                  <div className="bar"><div className="fill" style={{ width: `${(disk / vm.storage) * 100}%`, background: 'oklch(0.55 0.18 285)' }}/></div>
                  <div className="flex between text-xs mt-2"><span className="text-mute">Used</span><span className="text-mute tnum">{Math.round(disk / vm.storage * 100)}%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
