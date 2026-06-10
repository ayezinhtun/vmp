'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { vmApi } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface NIC    { id: number; label: string; type: 'Public' | 'Private'; vlan: string }
interface PfRule { id: number; proto: string; extPort: string; intIp: string; intPort: string }
interface Volume { size: number }

const STEPS = [
  { id: 1, label: 'Purpose'        },
  { id: 2, label: 'Hostname & OS'  },
  { id: 3, label: 'Specification'  },
  { id: 4, label: 'Zone & Network' },
  { id: 5, label: 'Firewall'       },
  { id: 6, label: 'Add-ons'        },
  { id: 7, label: 'Review'         },
];

const COMMON_PORTS = [
  { port: '22',    label: 'SSH'        },
  { port: '80',    label: 'HTTP'       },
  { port: '443',   label: 'HTTPS'      },
  { port: '3306',  label: 'MySQL'      },
  { port: '5432',  label: 'PostgreSQL' },
  { port: '6379',  label: 'Redis'      },
  { port: '27017', label: 'MongoDB'    },
  { port: '8080',  label: 'HTTP-Alt'   },
  { port: '8443',  label: 'HTTPS-Alt'  },
  { port: '21',    label: 'FTP'        },
  { port: '25',    label: 'SMTP'       },
  { port: '3389',  label: 'RDP'        },
];

// ─── Inline SVG helpers ────────────────────────────────────────────────────────
const CheckSvg = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ChevL    = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevR    = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const PlusIcon = () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 36, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
      background: checked ? 'var(--ok)' : 'var(--surface-3)', position: 'relative',
      transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2,
        width: 16, height: 16, borderRadius: 8, background: '#fff',
        transition: 'left 0.2s',
      }}/>
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 20, border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
      background: active ? 'var(--accent-soft)' : 'var(--surface)', color: active ? 'var(--accent-strong)' : 'var(--ink)',
      fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {children}
    </button>
  );
}

// ─── SelectRow (radio-style card) ─────────────────────────────────────────────
function SelectRow({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '10px 14px', borderRadius: 7, textAlign: 'left', cursor: 'pointer',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
      background: active ? 'var(--accent-soft)' : 'var(--surface)',
      display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'all 0.15s',
    }}>
      <div style={{
        width: 15, height: 15, borderRadius: 8, border: `2px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
        display: 'grid', placeItems: 'center', marginTop: 2, flexShrink: 0,
      }}>
        {active && <div style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--accent)' }}/>}
      </div>
      {children}
    </button>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHead({ title }: { title: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-2)', marginBottom: 10 }}>{title}</div>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DeployPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [purpose, setPurpose] = useState('');
  const [notes,   setNotes]   = useState('');

  // Step 2
  const [hostname, setHostname] = useState('');
  const [os,       setOs]       = useState('ubuntu-22.04');

  // Step 3
  const [cpu,     setCpu]     = useState('2');
  const [ram,     setRam]     = useState('4');
  const [volumes, setVolumes] = useState<Volume[]>([{ size: 100 }]);
  const [bandwidth,       setBandwidth]       = useState('1 Gbps');
  const [backupEnabled,   setBackupEnabled]   = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupRetention, setBackupRetention] = useState('7');
  const [monitoring,      setMonitoring]      = useState(false);

  // Step 4
  const [zone, setZone] = useState('');
  const [nics, setNics] = useState<NIC[]>([{ id: 1, label: 'Primary NIC', type: 'Public', vlan: '' }]);

  // Step 5
  const [firewallPorts,  setFirewallPorts]  = useState<string[]>(['22', '80', '443']);
  const [customPort,     setCustomPort]     = useState('');
  const [portForwarding, setPortForwarding] = useState<PfRule[]>([]);

  // Step 6
  const [vmProtection,   setVmProtection]   = useState(false);
  const [ddosProtection, setDdosProtection] = useState(false);
  const [sslCertificate, setSslCertificate] = useState(false);
  const [loadBalancer,   setLoadBalancer]   = useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const setVolumeCount = (n: number) =>
    setVolumes(prev => n > prev.length ? [...prev, ...Array(n - prev.length).fill({ size: 100 })] : prev.slice(0, n));

  const setVolumeSize = (i: number, size: number) =>
    setVolumes(v => v.map((vol, idx) => idx === i ? { size } : vol));

  const togglePort = (p: string) =>
    setFirewallPorts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const addCustomPort = () => {
    const p = customPort.trim();
    if (p && !firewallPorts.includes(p)) setFirewallPorts(prev => [...prev, p]);
    setCustomPort('');
  };

  const addPfRule = () => setPortForwarding(prev => [...prev, { id: Date.now(), proto: 'TCP', extPort: '', intIp: '', intPort: '' }]);
  const removePfRule = (id: number) => setPortForwarding(prev => prev.filter(r => r.id !== id));
  const updatePfRule = (id: number, field: keyof PfRule, value: string) =>
    setPortForwarding(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const addNic = () => {
    if (nics.length >= 3) return;
    setNics(prev => [...prev, { id: Date.now(), label: `NIC ${prev.length + 1}`, type: 'Private', vlan: '' }]);
  };
  const removeNic = (id: number) => setNics(prev => prev.filter(n => n.id !== id));
  const updateNic = (id: number, field: keyof NIC, value: string) =>
    setNics(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));

  // ─── Submit ────────────────────────────────────────────────────────────────────
  const submitMut = useMutation({
    mutationFn: () => vmApi.request({
      purpose, notes, hostname, os,
      cpu: parseInt(cpu), ram: parseInt(ram), volumes,
      bandwidth, backupEnabled, backupFrequency, backupRetention: parseInt(backupRetention), monitoring,
      zone, nics, firewallPorts, portForwarding,
      addons: { vmProtection, ddosProtection, sslCertificate, loadBalancer },
    }),
    onSuccess: () => {
      toast({ title: 'VM request submitted', description: 'Your account manager will reach out within 1 business day.' });
      router.push('/dashboard');
    },
    onError: (e: any) => toast({ variant: 'destructive', title: 'Submission failed', description: e?.message }),
  });

  const canNext = () => {
    if (step === 1) return !!purpose;
    if (step === 2) return !!hostname && !!os;
    if (step === 4) return !!zone;
    return true;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Deploy a New VM</h1>
          <p className="page-subtitle">Fill in the details — your account manager will confirm and provision.</p>
        </div>
      </div>

      {/* Step nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <button onClick={() => s.id < step && setStep(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20,
              fontSize: 12, fontWeight: 500, cursor: s.id < step ? 'pointer' : s.id === step ? 'default' : 'not-allowed',
              border: 'none', outline: 'none',
              background: s.id === step ? 'var(--ink)' : s.id < step ? 'var(--ok-soft)' : 'transparent',
              color: s.id === step ? 'oklch(0.99 0 0)' : s.id < step ? 'var(--ok)' : 'var(--ink-2)',
              opacity: s.id > step ? 0.5 : 1,
            }}>
              {s.id < step ? <CheckSvg/> : <span style={{ fontSize: 10.5 }}>{s.id}</span>}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--line)', flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout: form + summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        {/* Main form area */}
        <div>
          {step === 1 && <StepPurpose purpose={purpose} setPurpose={setPurpose} notes={notes} setNotes={setNotes}/>}
          {step === 2 && <StepHostname hostname={hostname} setHostname={setHostname} os={os} setOs={setOs}/>}
          {step === 3 && (
            <StepSpec
              cpu={cpu} setCpu={setCpu} ram={ram} setRam={setRam}
              volumes={volumes} setVolumeCount={setVolumeCount} setVolumeSize={setVolumeSize}
              bandwidth={bandwidth} setBandwidth={setBandwidth}
              backupEnabled={backupEnabled} setBackupEnabled={setBackupEnabled}
              backupFrequency={backupFrequency} setBackupFrequency={setBackupFrequency}
              backupRetention={backupRetention} setBackupRetention={setBackupRetention}
              monitoring={monitoring} setMonitoring={setMonitoring}
            />
          )}
          {step === 4 && (
            <StepZoneNetwork
              zone={zone} setZone={setZone}
              nics={nics} addNic={addNic} removeNic={removeNic} updateNic={updateNic}
            />
          )}
          {step === 5 && (
            <StepFirewall
              firewallPorts={firewallPorts} togglePort={togglePort}
              customPort={customPort} setCustomPort={setCustomPort} addCustomPort={addCustomPort}
              portForwarding={portForwarding} addPfRule={addPfRule} removePfRule={removePfRule} updatePfRule={updatePfRule}
            />
          )}
          {step === 6 && (
            <StepAddons
              vmProtection={vmProtection}   setVmProtection={setVmProtection}
              ddosProtection={ddosProtection} setDdosProtection={setDdosProtection}
              sslCertificate={sslCertificate} setSslCertificate={setSslCertificate}
              loadBalancer={loadBalancer}     setLoadBalancer={setLoadBalancer}
            />
          )}
          {step === 7 && (
            <StepReview
              purpose={purpose} notes={notes} hostname={hostname} os={os}
              cpu={cpu} ram={ram} volumes={volumes} bandwidth={bandwidth}
              backupEnabled={backupEnabled} backupFrequency={backupFrequency} backupRetention={backupRetention}
              monitoring={monitoring} zone={zone} nics={nics}
              firewallPorts={firewallPorts} portForwarding={portForwarding}
              vmProtection={vmProtection} ddosProtection={ddosProtection}
              sslCertificate={sslCertificate} loadBalancer={loadBalancer}
            />
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button className="btn ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
              <ChevL/>Back
            </button>
            {step < 7 ? (
              <button className="btn primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Continue<ChevR/>
              </button>
            ) : (
              <button className="btn primary" onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
                {submitMut.isPending ? 'Submitting…' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>

        {/* Sticky summary panel */}
        <div style={{ position: 'sticky', top: 16 }}>
          <ConfigSummary
            hostname={hostname} os={os} cpu={cpu} ram={ram} volumes={volumes}
            bandwidth={bandwidth} backupEnabled={backupEnabled} monitoring={monitoring}
            zone={zone} nics={nics} firewallPorts={firewallPorts}
            vmProtection={vmProtection} ddosProtection={ddosProtection}
            sslCertificate={sslCertificate} loadBalancer={loadBalancer}
          />
        </div>
      </div>
    </>
  );
}

// ─── Step 1: Purpose ──────────────────────────────────────────────────────────
function StepPurpose({ purpose, setPurpose, notes, setNotes }: any) {
  const opts = ['Web Application','Database Server','Dev / Staging','CI/CD Runner','Game Server','Media Server','API Gateway','Other'];
  return (
    <div className="card">
      <div className="card-head"><h2 className="card-title">What's this VM for?</h2></div>
      <div className="card-body" style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {opts.map(o => (
            <button key={o} onClick={() => setPurpose(o)} style={{
              padding: '9px 14px', borderRadius: 7, textAlign: 'left', cursor: 'pointer',
              border: `1px solid ${purpose === o ? 'var(--accent)' : 'var(--line)'}`,
              background: purpose === o ? 'var(--accent-soft)' : 'var(--surface)',
              color: purpose === o ? 'var(--accent-strong)' : 'var(--ink)',
              fontWeight: purpose === o ? 600 : 400, fontSize: 12.5, transition: 'all 0.15s',
            }}>{o}</button>
          ))}
        </div>
        <div className="field">
          <label>Additional notes <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            style={{ minHeight: 80, resize: 'vertical', padding: 8, fontSize: 12.5 }}
            placeholder="Describe your workload, expected traffic, special requirements…"/>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Hostname & OS ────────────────────────────────────────────────────
function StepHostname({ hostname, setHostname, os, setOs }: any) {
  const osList = [
    { id: 'ubuntu-22.04',   label: 'Ubuntu 22.04 LTS'      },
    { id: 'ubuntu-24.04',   label: 'Ubuntu 24.04 LTS'      },
    { id: 'debian-12',      label: 'Debian 12 Bookworm'     },
    { id: 'rocky-9',        label: 'Rocky Linux 9'          },
    { id: 'alma-9',         label: 'AlmaLinux 9'            },
    { id: 'centos-stream',  label: 'CentOS Stream 9'        },
    { id: 'windows-2022',   label: 'Windows Server 2022'    },
    { id: 'windows-2019',   label: 'Windows Server 2019'    },
  ];
  return (
    <div className="card">
      <div className="card-head"><h2 className="card-title">Hostname & Operating System</h2></div>
      <div className="card-body" style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="field">
          <label>Hostname</label>
          <input value={hostname} onChange={e => setHostname(e.target.value)} autoFocus placeholder="e.g. web-prod-01"/>
          <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 3 }}>Lowercase letters, numbers, hyphens only.</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Operating System</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {osList.map(o => (
              <button key={o.id} onClick={() => setOs(o.id)} style={{
                padding: '8px 12px', borderRadius: 7, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${os === o.id ? 'var(--accent)' : 'var(--line)'}`,
                background: os === o.id ? 'var(--accent-soft)' : 'var(--surface)',
                color: os === o.id ? 'var(--accent-strong)' : 'var(--ink)',
                fontWeight: os === o.id ? 600 : 400, fontSize: 12.5, transition: 'all 0.15s',
              }}>{o.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Spec ─────────────────────────────────────────────────────────────
function StepSpec({ cpu, setCpu, ram, setRam, volumes, setVolumeCount, setVolumeSize, bandwidth, setBandwidth, backupEnabled, setBackupEnabled, backupFrequency, setBackupFrequency, backupRetention, setBackupRetention, monitoring, setMonitoring }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Compute */}
      <div className="card">
        <div className="card-head"><h2 className="card-title">Compute</h2></div>
        <div className="card-body" style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 8 }}>vCPU Cores</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['1','2','4','8','16','32'].map(c => <Chip key={c} active={cpu === c} onClick={() => setCpu(c)}>{c} vCPU{c !== '1' ? 's' : ''}</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 8 }}>RAM (GB)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['1','2','4','8','16','32','64','128'].map(r => <Chip key={r} active={ram === r} onClick={() => setRam(r)}>{r} GB</Chip>)}
            </div>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="card">
        <div className="card-head"><h2 className="card-title">Storage Volumes</h2></div>
        <div className="card-body" style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 8 }}>Number of disks</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3].map(n => <Chip key={n} active={volumes.length === n} onClick={() => setVolumeCount(n)}>{n} disk{n > 1 ? 's' : ''}</Chip>)}
            </div>
          </div>
          {volumes.map((vol: Volume, i: number) => (
            <div key={i}>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 8 }}>Disk {i + 1} size (GB)</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[50,100,200,500,1000,2000].map(s => <Chip key={s} active={vol.size === s} onClick={() => setVolumeSize(i, s)}>{s} GB</Chip>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bandwidth */}
      <div className="card">
        <div className="card-head"><h2 className="card-title">Network Bandwidth</h2></div>
        <div className="card-body" style={{ padding: '14px 20px 18px' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['100 Mbps','500 Mbps','1 Gbps','5 Gbps','10 Gbps'].map(b => <Chip key={b} active={bandwidth === b} onClick={() => setBandwidth(b)}>{b}</Chip>)}
          </div>
        </div>
      </div>

      {/* Backup */}
      <div className="card">
        <div className="card-head" style={{ cursor: 'pointer' }} onClick={() => setBackupEnabled(!backupEnabled)}>
          <h2 className="card-title">Backup Service</h2>
          <Toggle checked={backupEnabled} onChange={setBackupEnabled}/>
        </div>
        {backupEnabled && (
          <div className="card-body" style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 8 }}>Frequency</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['daily','weekly','monthly'].map(f => <Chip key={f} active={backupFrequency === f} onClick={() => setBackupFrequency(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</Chip>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 8 }}>Retention period</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['7','14','30','90'].map(r => <Chip key={r} active={backupRetention === r} onClick={() => setBackupRetention(r)}>{r} days</Chip>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monitoring */}
      <div className="card">
        <div className="card-body" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Managed Monitoring & Alerts</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2 }}>24/7 proactive monitoring with email/SMS alerts</div>
          </div>
          <Toggle checked={monitoring} onChange={setMonitoring}/>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Zone & Network ────────────────────────────────────────────────────
function StepZoneNetwork({ zone, setZone, nics, addNic, removeNic, updateNic }: any) {
  const zones = [
    { id: 'yangon-a',   label: 'Yangon Zone A',   sub: 'Primary datacenter'  },
    { id: 'yangon-b',   label: 'Yangon Zone B',   sub: 'Secondary / DR site' },
    { id: 'mandalay-a', label: 'Mandalay Zone A', sub: 'Northern region'      },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card">
        <div className="card-head"><h2 className="card-title">Choose a zone</h2></div>
        <div className="card-body" style={{ padding: '12px 20px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {zones.map(z => (
            <SelectRow key={z.id} active={zone === z.id} onClick={() => setZone(z.id)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{z.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>{z.sub}</div>
              </div>
            </SelectRow>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Network Interfaces (NICs)</h2>
          {nics.length < 3 && (
            <button className="btn ghost sm" onClick={addNic}><PlusIcon/>Add NIC</button>
          )}
        </div>
        <div className="card-body" style={{ padding: '12px 20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nics.map((nic: NIC, i: number) => (
            <div key={nic.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
              border: '1px solid var(--line)', borderRadius: 7,
            }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <label style={{ minWidth: 50, marginBottom: 0 }}>Label</label>
                  <input value={nic.label} onChange={e => updateNic(nic.id, 'label', e.target.value)} style={{ flex: 1 }}/>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ minWidth: 50, fontSize: 12, color: 'var(--ink-2)' }}>Type</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['Public','Private'] as const).map(t => <Chip key={t} active={nic.type === t} onClick={() => updateNic(nic.id, 'type', t)}>{t}</Chip>)}
                  </div>
                </div>
                <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <label style={{ minWidth: 50, marginBottom: 0 }}>VLAN</label>
                  <input value={nic.vlan} onChange={e => updateNic(nic.id, 'vlan', e.target.value)} placeholder="e.g. 100" style={{ width: 90 }}/>
                </div>
              </div>
              {i > 0 && (
                <button className="icon-btn" onClick={() => removeNic(nic.id)} style={{ color: 'var(--bad)', marginTop: 2 }}>
                  <TrashIcon/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Firewall ──────────────────────────────────────────────────────────
function StepFirewall({ firewallPorts, togglePort, customPort, setCustomPort, addCustomPort, portForwarding, addPfRule, removePfRule, updatePfRule }: any) {
  const knownPorts = COMMON_PORTS.map(x => x.port);
  const customAdded = firewallPorts.filter((p: string) => !knownPorts.includes(p));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card">
        <div className="card-head"><h2 className="card-title">Inbound Firewall Rules</h2></div>
        <div className="card-body" style={{ padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {COMMON_PORTS.map(p => (
              <button key={p.port} onClick={() => togglePort(p.port)} style={{
                padding: '8px 10px', borderRadius: 7, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${firewallPorts.includes(p.port) ? 'var(--accent)' : 'var(--line)'}`,
                background: firewallPorts.includes(p.port) ? 'var(--accent-soft)' : 'var(--surface)',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: firewallPorts.includes(p.port) ? 'var(--accent-strong)' : 'var(--ink)' }}>{p.label}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>:{p.port}</div>
              </button>
            ))}
          </div>

          {/* Custom port */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={customPort} onChange={e => setCustomPort(e.target.value)}
              placeholder="Custom port (e.g. 9200)"
              onKeyDown={e => e.key === 'Enter' && addCustomPort()}
              style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 12.5 }}/>
            <button className="btn ghost sm" onClick={addCustomPort}>Add</button>
          </div>

          {customAdded.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {customAdded.map((p: string) => (
                <button key={p} onClick={() => togglePort(p)} className="pill subtle" style={{ cursor: 'pointer' }}>
                  :{p} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Port Forwarding Rules</h2>
          <button className="btn ghost sm" onClick={addPfRule}><PlusIcon/>Add rule</button>
        </div>
        <div className="card-body" style={{ padding: '12px 20px 18px' }}>
          {portForwarding.length === 0 && (
            <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: 'var(--ink-2)' }}>
              No port forwarding rules. Add one to map external ports to internal VMs.
            </div>
          )}
          {portForwarding.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr 32px', gap: 8, fontSize: 11, color: 'var(--ink-2)', fontWeight: 600, padding: '0 2px' }}>
                <span>Proto</span><span>Ext port</span><span>Internal IP</span><span>Int port</span><span/>
              </div>
              {portForwarding.map((r: PfRule) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr 32px', gap: 8, alignItems: 'center' }}>
                  <select value={r.proto} onChange={e => updatePfRule(r.id, 'proto', e.target.value)} style={{
                    height: 30, padding: '0 6px', borderRadius: 5, border: '1px solid var(--line)', fontSize: 12, background: 'var(--surface)', color: 'var(--ink)',
                  }}>
                    <option>TCP</option><option>UDP</option><option>BOTH</option>
                  </select>
                  <input value={r.extPort} onChange={e => updatePfRule(r.id, 'extPort', e.target.value)} placeholder="8080" style={{ height: 30, padding: '0 8px', borderRadius: 5, border: '1px solid var(--line)', fontSize: 12 }}/>
                  <input value={r.intIp}   onChange={e => updatePfRule(r.id, 'intIp',   e.target.value)} placeholder="10.0.0.x" style={{ height: 30, padding: '0 8px', borderRadius: 5, border: '1px solid var(--line)', fontSize: 12 }}/>
                  <input value={r.intPort} onChange={e => updatePfRule(r.id, 'intPort', e.target.value)} placeholder="80" style={{ height: 30, padding: '0 8px', borderRadius: 5, border: '1px solid var(--line)', fontSize: 12 }}/>
                  <button className="icon-btn" onClick={() => removePfRule(r.id)} style={{ color: 'var(--bad)' }}><TrashIcon/></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 6: Add-ons ──────────────────────────────────────────────────────────
function StepAddons({ vmProtection, setVmProtection, ddosProtection, setDdosProtection, sslCertificate, setSslCertificate, loadBalancer, setLoadBalancer }: any) {
  const addons = [
    { key: 'vmProtection',   label: 'VM Protection',   desc: 'Automated off-site backup + bare-metal restore within 4h RTO.', icon: '🛡️', value: vmProtection,   setter: setVmProtection   },
    { key: 'ddosProtection', label: 'DDoS Protection', desc: 'Up to 10 Gbps scrubbing. Traffic mitigation in <5 minutes.',    icon: '🔥', value: ddosProtection, setter: setDdosProtection },
    { key: 'sslCertificate', label: 'SSL Certificate', desc: 'Auto-renewed wildcard cert via Let\'s Encrypt or your own CA.', icon: '🔒', value: sslCertificate, setter: setSslCertificate },
    { key: 'loadBalancer',   label: 'Load Balancer',   desc: 'Layer 4/7 LB with health checks and sticky sessions.',         icon: '⚖️', value: loadBalancer,   setter: setLoadBalancer   },
  ];
  return (
    <div className="card">
      <div className="card-head"><h2 className="card-title">Add-on Services</h2></div>
      <div className="card-body" style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {addons.map(a => (
          <div key={a.key} onClick={() => a.setter(!a.value)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 14px',
            borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
            border: `1px solid ${a.value ? 'var(--accent)' : 'var(--line)'}`,
            background: a.value ? 'var(--accent-soft)' : 'var(--surface)',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>{a.desc}</div>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <Toggle checked={a.value} onChange={a.setter}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 7: Review ────────────────────────────────────────────────────────────
function StepReview(props: any) {
  const addons = [
    props.vmProtection   && 'VM Protection',
    props.ddosProtection && 'DDoS Protection',
    props.sslCertificate && 'SSL Certificate',
    props.loadBalancer   && 'Load Balancer',
  ].filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ReviewSection title="Instance">
        <RR label="Purpose"  value={props.purpose}/>
        <RR label="Hostname" value={props.hostname}/>
        <RR label="OS"       value={props.os}/>
        {props.notes && <RR label="Notes" value={props.notes}/>}
      </ReviewSection>

      <ReviewSection title="Compute & Storage">
        <RR label="CPU"       value={`${props.cpu} vCPU`}/>
        <RR label="RAM"       value={`${props.ram} GB`}/>
        <RR label="Disks"     value={`${props.volumes.length}× disk (${props.volumes.map((v: Volume) => `${v.size} GB`).join(', ')})`}/>
        <RR label="Bandwidth" value={props.bandwidth}/>
        {props.backupEnabled && <RR label="Backup" value={`${props.backupFrequency} · ${props.backupRetention} day retention`}/>}
        {props.monitoring    && <RR label="Monitoring" value="Managed 24/7"/>}
      </ReviewSection>

      <ReviewSection title="Zone & Network">
        <RR label="Zone" value={props.zone}/>
        {props.nics.map((n: NIC, i: number) => (
          <RR key={n.id} label={`NIC ${i+1}`} value={`${n.label} · ${n.type}${n.vlan ? ` · VLAN ${n.vlan}` : ''}`}/>
        ))}
      </ReviewSection>

      <ReviewSection title="Firewall">
        <RR label="Open ports"  value={props.firewallPorts.join(', ') || 'None'}/>
        {props.portForwarding.length > 0 && (
          <RR label="Port forwarding" value={props.portForwarding.map((r: PfRule) => `${r.extPort}→${r.intIp}:${r.intPort}`).join(', ')}/>
        )}
      </ReviewSection>

      {addons.length > 0 && (
        <ReviewSection title="Add-on Services">
          {addons.map(a => <RR key={a as string} label={a as string} value="Enabled"/>)}
        </ReviewSection>
      )}

      <div style={{
        padding: '12px 16px', borderRadius: 8, fontSize: 12.5,
        background: 'var(--warn-soft)', border: '1px solid color-mix(in oklch, var(--warn) 35%, transparent)',
        color: 'oklch(0.45 0.13 75)', display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        Your account manager will confirm the exact configuration and pricing after submission. You'll be notified by email within 1 business day.
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div style={{ padding: '10px 18px 2px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-2)' }}>{title}</div>
      <div style={{ padding: '2px 0 8px' }}>{children}</div>
    </div>
  );
}

function RR({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 18px', borderTop: '1px solid var(--line)', fontSize: 12.5 }}>
      <span style={{ color: 'var(--ink-2)' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: 260, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

// ─── Config Summary Panel ──────────────────────────────────────────────────────
function ConfigSummary({ hostname, os, cpu, ram, volumes, bandwidth, backupEnabled, monitoring, zone, nics, firewallPorts, vmProtection, ddosProtection, sslCertificate, loadBalancer }: any) {
  const activeAddons = [vmProtection && 'VM Protection', ddosProtection && 'DDoS', sslCertificate && 'SSL', loadBalancer && 'LB'].filter(Boolean);
  return (
    <div className="card">
      <div className="card-head"><h2 className="card-title">Configuration</h2></div>
      <div className="card-body" style={{ padding: '6px 16px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {[
          hostname   && ['Hostname',  hostname],
          os         && ['OS',        os],
          cpu        && ['CPU',       `${cpu} vCPU`],
          ram        && ['RAM',       `${ram} GB`],
          ['Disks',               `${volumes.length}× disk`],
          bandwidth  && ['BW',        bandwidth],
          backupEnabled  && ['Backup',    'On'],
          monitoring     && ['Monitor',   'On'],
          zone       && ['Zone',      zone],
          ['NICs',                `${nics.length} NIC${nics.length > 1 ? 's' : ''}`],
          firewallPorts.length && ['Ports', `${firewallPorts.length} open`],
          activeAddons.length && ['Add-ons', activeAddons.join(', ')],
        ].filter(Boolean).map((row: any) => (
          <div key={row[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
            <span style={{ color: 'var(--ink-2)' }}>{row[0]}</span>
            <span style={{ fontWeight: 600, maxWidth: 140, textAlign: 'right', wordBreak: 'break-word' }}>{row[1]}</span>
          </div>
        ))}
        {!hostname && !cpu && (
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--ink-2)' }}>Complete the steps to see your summary.</div>
        )}
      </div>
    </div>
  );
}
