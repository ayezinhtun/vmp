'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useVMStore } from '@/lib/store';
import { VMStatusBadge } from '@/components/vms/vm-status-badge';
import { VMPowerControls } from '@/components/vms/vm-power-controls';
import { formatBytes, formatUptime } from '@/lib/utils';
import { SearchIcon, MoreIcon } from '@/components/layout/icons';

export default function VMsPage() {
  const vms    = [...useVMStore(s => s.vms).values()];
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filters = [
    { id: 'all',     label: 'All',     count: vms.length },
    { id: 'running', label: 'Running', count: vms.filter(v => v.status === 'running').length },
    { id: 'stopped', label: 'Stopped', count: vms.filter(v => v.status === 'stopped').length },
    { id: 'paused',  label: 'Paused',  count: vms.filter(v => v.status === 'paused').length },
  ];

  const filtered = vms
    .filter(v => filter === 'all' || v.status === filter)
    .filter(v => !search || [v.name, String(v.vmId), v.node].join(' ').toLowerCase().includes(search.toLowerCase()));

  const totalCpu = vms.reduce((a, v) => a + v.cpu, 0);
  const avgCpu   = vms.length ? Math.round(totalCpu / vms.length) : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">My VMs</h1>
          <p className="page-subtitle">{vms.length} virtual machine{vms.length !== 1 ? 's' : ''} · {vms.filter(v => v.status === 'running').length} running</p>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid-3 mb-4">
        <div className="metric">
          <div className="label">Running</div>
          <div className="value tnum">{vms.filter(v => v.status === 'running').length}</div>
          <div className="trend">{vms.length} total</div>
        </div>
        <div className="metric">
          <div className="label">Avg CPU</div>
          <div className="value tnum">{avgCpu}%</div>
          <div className="trend">across all VMs</div>
        </div>
        <div className="metric">
          <div className="label">RAM in use</div>
          <div className="value" style={{ fontSize: 20 }}>{formatBytes(vms.reduce((a, v) => a + v.ramUsed, 0))}</div>
          <div className="trend">of {formatBytes(vms.reduce((a, v) => a + v.ramTotal, 0))} allocated</div>
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
            <SearchIcon size={13} className="search-icon"/>
            <input placeholder="Name, VMID, node…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>VM</th>
              <th>Status</th>
              <th>CPU</th>
              <th>RAM</th>
              <th>Net in/out</th>
              <th>Uptime</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7}>
                <div className="empty"><div className="title">No VMs match</div><div className="sub">Try a different filter or clear the search.</div></div>
              </td></tr>
            )}
            {filtered.map(vm => (
              <tr key={vm.vmId} onClick={() => {}} style={{ cursor: 'default' }}>
                <td>
                  <div className="flex center gap-2">
                    <span className="id-tag accent">{vm.vmId}</span>
                    <div>
                      <div className="fw-6">{vm.name}</div>
                      <div className="text-xs text-mute mono">{vm.node}</div>
                    </div>
                  </div>
                </td>
                <td><VMStatusBadge status={vm.status}/></td>
                <td>
                  <div className="mono text-sm">{vm.cpu}%</div>
                  <div className="bar mt-1" style={{ width: 60 }}>
                    <div className="fill" style={{ width: `${Math.min(vm.cpu, 100)}%`, background: vm.cpu > 80 ? 'var(--bad)' : vm.cpu > 60 ? 'var(--warn)' : 'var(--ok)' }}/>
                  </div>
                </td>
                <td>
                  <div className="mono text-sm">{Math.round(vm.ramUsed / vm.ramTotal * 100 || 0)}%</div>
                  <div className="text-xs text-mute">{formatBytes(vm.ramUsed)} / {formatBytes(vm.ramTotal)}</div>
                </td>
                <td className="mono text-xs">
                  <span style={{ color: 'var(--ok)' }}>↓ {formatBytes(vm.netIn)}/s</span>
                  <span className="text-mute"> · </span>
                  <span style={{ color: 'var(--info)' }}>↑ {formatBytes(vm.netOut)}/s</span>
                </td>
                <td className="mono text-sm" style={{ color: 'var(--ok)' }}>{formatUptime(vm.uptime)}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="flex center gap-2">
                    <VMPowerControls vmId={vm.vmId} status={vm.status} compact/>
                    <Link href={`/vms/${vm.vmId}`}>
                      <button className="btn sm ghost">Details</button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
