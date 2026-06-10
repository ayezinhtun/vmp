'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vmApi, consoleApi } from '@/lib/api-client';
import { useVMStore } from '@/lib/store';
import { VMStatusBadge } from '@/components/vms/vm-status-badge';
import { RealtimeMetrics } from '@/components/vms/realtime-metrics';
import { formatBytes, formatUptime } from '@/lib/utils';

// Inline SVG helpers
const BackArrow = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const TerminalIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
const RebootIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const PlayIcon  = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const StopIcon  = () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>;
const PlusIcon  = () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default function VMDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const vmId    = parseInt(id);
  const router  = useRouter();
  const qc      = useQueryClient();
  const [tab,          setTab]          = useState<'metrics' | 'config' | 'network' | 'snapshots'>('metrics');
  const [consoleOpen,  setConsoleOpen]  = useState(false);
  const [consoleUrl,   setConsoleUrl]   = useState('');

  // Use live store first, fallback to query
  const liveVM = useVMStore(s => s.vms.get(vmId));
  const { data: fetchedVM } = useQuery({ queryKey: ['vm', vmId], queryFn: () => vmApi.get(vmId) });
  const vm = liveVM ?? fetchedVM;

  const { data: snapshots } = useQuery({ queryKey: ['snapshots', vmId], queryFn: () => vmApi.snapshots(vmId) });
  const { data: metrics }   = useQuery({ queryKey: ['metrics', vmId, 'hour'], queryFn: () => vmApi.metrics(vmId, 'hour'), refetchInterval: 30_000 });

  const powerMutation = useMutation({
    mutationFn: ({ action }: { action: 'start' | 'stop' | 'reboot' | 'shutdown' }) => {
      const map = { start: vmApi.start, stop: vmApi.stop, reboot: vmApi.reboot, shutdown: vmApi.shutdown };
      return map[action](vmId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vm', vmId] }),
  });

  const snapMutation = useMutation({
    mutationFn: (name?: string) => vmApi.createSnapshot(vmId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['snapshots', vmId] }),
  });

  const openConsole = async () => {
    try {
      const data = await consoleApi.getTicket(vmId);
      setConsoleUrl(`/novnc/vnc.html?host=${window.location.hostname}&path=${encodeURIComponent(data.wsUrl.slice(1))}&autoconnect=1&resize=scale`);
      setConsoleOpen(true);
    } catch (err) { console.error('Console error', err); }
  };

  if (!vm) return (
    <div className="page-head"><p className="page-subtitle">Loading VM…</p></div>
  );

  const isRunning = vm.status === 'running';
  const busy = powerMutation.isPending;

  return (
    <>
      {/* Header */}
      <div className="page-head">
        <div>
          <button className="btn ghost sm" style={{ marginBottom: 8 }} onClick={() => router.back()}>
            <BackArrow/>Back to VMs
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{vm.name}</h1>
            <VMStatusBadge status={vm.status}/>
          </div>
          <div style={{ marginTop: 3 }} className="mono text-xs text-mute">
            {vm.legacyId ?? `vmid:${vmId}`} · node: {vm.node}
          </div>
        </div>

        <div className="page-actions">
          {isRunning ? (
            <>
              <button className="btn sm" disabled={busy} onClick={() => powerMutation.mutate({ action: 'stop' })}>
                <StopIcon/>Stop
              </button>
              <button className="btn sm" disabled={busy} onClick={() => powerMutation.mutate({ action: 'reboot' })}>
                <RebootIcon/>Reboot
              </button>
            </>
          ) : (
            <button className="btn primary sm" disabled={busy} onClick={() => powerMutation.mutate({ action: 'start' })}>
              <PlayIcon/>Start
            </button>
          )}
          <button className="btn ghost sm" disabled={!isRunning} onClick={openConsole}>
            <TerminalIcon/>Console
          </button>
        </div>
      </div>

      {/* VNC console iframe */}
      {consoleOpen && (
        <div className="card" style={{ marginBottom: 18, border: '2px solid var(--accent)' }}>
          <div className="card-head">
            <h2 className="card-title">VNC Console — {vm.name}</h2>
            <button className="icon-btn" onClick={() => setConsoleOpen(false)}>✕</button>
          </div>
          <div style={{ height: 520 }}>
            <iframe src={consoleUrl} title="VNC Console" style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}/>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid-4" style={{ marginBottom: 18 }}>
        <MetricCard label="CPU" value={`${vm.cpu}%`} bar={vm.cpu} color="ok"/>
        <MetricCard label="RAM" value={`${Math.round(vm.ramUsed / vm.ramTotal * 100 || 0)}%`}
          sub={`${formatBytes(vm.ramUsed)} / ${formatBytes(vm.ramTotal)}`}
          bar={vm.ramUsed / vm.ramTotal * 100} color="warn"/>
        <MetricCard label="Disk" value={`${Math.round(vm.diskUsed / vm.diskTotal * 100 || 0)}%`}
          sub={`${formatBytes(vm.diskUsed)} / ${formatBytes(vm.diskTotal)}`}
          bar={vm.diskUsed / vm.diskTotal * 100} color="bad"/>
        <MetricCard label="Uptime" value={formatUptime(vm.uptime)} sub={isRunning ? 'Running' : 'Stopped'} color="ok"/>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="tabs">
          {(['metrics','config','network','snapshots'] as const).map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'snapshots' ? `Snapshots (${snapshots?.length ?? 0})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Metrics */}
        {tab === 'metrics' && (
          <div className="card-body" style={{ padding: 20 }}>
            <RealtimeMetrics vmId={vmId} data={metrics ?? []}/>
          </div>
        )}

        {/* Config */}
        {tab === 'config' && (
          <div className="card-body flush">
            <table className="tbl">
              <tbody>
                {vm.config && Object.entries(vm.config).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ width: '40%', color: 'var(--ink-2)', textTransform: 'capitalize' }}>{k}</td>
                    <td className="mono text-sm" style={{ wordBreak: 'break-all' }}>{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Network */}
        {tab === 'network' && (
          <div className="card-body flush">
            <table className="tbl">
              <tbody>
                <tr>
                  <td style={{ color: 'var(--ink-2)' }}>Net in</td>
                  <td className="mono text-sm" style={{ color: 'var(--ok)' }}>↓ {formatBytes(vm.netIn)}/s</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--ink-2)' }}>Net out</td>
                  <td className="mono text-sm" style={{ color: 'var(--info)' }}>↑ {formatBytes(vm.netOut)}/s</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Snapshots */}
        {tab === 'snapshots' && (
          <>
            <div className="card-head" style={{ borderTop: '1px solid var(--line)' }}>
              <h2 className="card-title">Snapshots</h2>
              <button className="btn primary sm" disabled={snapMutation.isPending} onClick={() => snapMutation.mutate()}>
                <PlusIcon/>Create snapshot
              </button>
            </div>
            <div className="card-body flush">
              {!snapshots?.length ? (
                <div className="empty" style={{ padding: '32px 0' }}>
                  <div className="title">No snapshots yet</div>
                  <div className="sub">Click "Create snapshot" to save the current VM state.</div>
                </div>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr><th>Name</th><th>Description</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {snapshots.map((s: any) => (
                      <tr key={s.name}>
                        <td className="fw-6 mono text-sm">{s.name}</td>
                        <td style={{ color: 'var(--ink-2)' }}>{s.description || '—'}</td>
                        <td className="mono text-xs text-mute">{s.snaptime ? new Date(s.snaptime * 1000).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, sub, bar, color }: {
  label: string; value: string; sub?: string; bar?: number; color: string;
}) {
  const fill = bar !== undefined ? `var(--${color})` : undefined;
  const pct  = bar !== undefined ? Math.min(bar, 100) : 0;
  return (
    <div className="metric">
      <div className="label">{label}</div>
      <div className="value tnum" style={{ fontSize: 22 }}>{value}</div>
      {sub && <div className="trend">{sub}</div>}
      {bar !== undefined && (
        <div className="bar" style={{ marginTop: 6 }}>
          <div className="fill" style={{ width: `${pct}%`, background: fill }}/>
        </div>
      )}
    </div>
  );
}
