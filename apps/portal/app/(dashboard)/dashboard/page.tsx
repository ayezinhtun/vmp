'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth, useVMStore } from '@/lib/store';
import { customerApi } from '@/lib/api-client';
import { VMStatusBadge } from '@/components/vms/vm-status-badge';
import { formatBytes, formatUptime } from '@/lib/utils';
import { ServerIcon, CpuIcon, ArrowUpIcon, InvoiceIcon, PlusIcon } from '@/components/layout/icons';

export default function DashboardPage() {
  const customer = useAuth(s => s.customer);
  const vms      = useVMStore(s => s.vms);
  const vmList   = [...vms.values()];

  const { data: tickets  } = useQuery({ queryKey: ['tickets'],  queryFn: customerApi.tickets  });
  const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: customerApi.invoices });

  const runningVMs  = vmList.filter(v => v.status === 'running').length;
  const totalVcpu   = vmList.reduce((a, v) => a + ((v.config?.cores as number) ?? 0), 0);
  const totalRam    = vmList.reduce((a, v) => a + v.ramTotal, 0);
  const openTickets = (tickets ?? []).filter((t: any) => t.status === 'Open' || t.status === 'In Progress');
  const pendingInvs = (invoices ?? []).filter((i: any) => i.status === 'Pending' || i.status === 'Overdue');

  const firstName = customer?.name?.split(' ')[0] ?? 'there';

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Good morning, {firstName}</h1>
          <p className="page-subtitle">{customer?.company} — here's your service overview</p>
        </div>
        <div className="page-actions">
          <Link href="/deploy"><button className="btn primary"><PlusIcon size={13}/>Deploy VM</button></Link>
        </div>
      </div>

      {/* KYC banner */}
      {customer?.kycStatus !== 'Approved' && (
        <div style={{
          marginBottom: 18, padding: '10px 14px', borderRadius: 8, fontSize: 12.5,
          display: 'flex', alignItems: 'center', gap: 10,
          background: customer?.kycStatus === 'Rejected' ? 'var(--bad-soft)' : 'var(--warn-soft)',
          border: `1px solid ${customer?.kycStatus === 'Rejected' ? 'var(--bad)' : 'var(--warn)'}`,
          color: customer?.kycStatus === 'Rejected' ? 'var(--bad)' : 'oklch(0.45 0.13 75)',
        }}>
          <span style={{ fontSize: 16 }}>{customer?.kycStatus === 'Rejected' ? '⚠️' : '⏳'}</span>
          {customer?.kycStatus === 'Rejected'
            ? 'KYC was rejected. Please re-upload your documents or contact support.'
            : 'Your account is under KYC review (usually 1 business day). Some features are locked until approved.'}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid-4 mb-4">
        <div className="metric">
          <div className="label"><ServerIcon size={13}/> Running VMs</div>
          <div className="value tnum">{runningVMs}</div>
          <div className="trend">{vmList.length} total assigned</div>
        </div>
        <div className="metric">
          <div className="label"><CpuIcon size={13}/> vCPU cores</div>
          <div className="value tnum">{totalVcpu || '—'}</div>
          <div className="trend">{formatBytes(totalRam)} RAM total</div>
        </div>
        <div className="metric">
          <div className="label">🎫 Open tickets</div>
          <div className="value tnum" style={{ color: openTickets.length > 0 ? 'var(--warn)' : undefined }}>
            {openTickets.length}
          </div>
          <div className="trend">{(tickets ?? []).length} total</div>
        </div>
        <div className="metric">
          <div className="label"><InvoiceIcon size={13}/> Pending invoices</div>
          <div className="value tnum" style={{ color: pendingInvs.length > 0 ? 'var(--bad)' : undefined }}>
            {pendingInvs.length}
          </div>
          <div className="trend">{(invoices ?? []).length} total</div>
        </div>
      </div>

      {/* VM table */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">My virtual machines</h2>
            <div className="card-sub">Real-time status via Proxmox</div>
          </div>
          <Link href="/vms"><button className="btn ghost sm">View all →</button></Link>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>VM</th>
                <th>Status</th>
                <th>CPU</th>
                <th>RAM</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {vmList.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty">
                    <div className="title">No VMs yet</div>
                    <div className="sub"><Link href="/deploy" style={{ color: 'var(--accent)' }}>Deploy your first VM →</Link></div>
                  </div>
                </td></tr>
              )}
              {vmList.slice(0, 6).map(vm => (
                <tr key={vm.vmId}>
                  <td>
                    <div className="fw-6">{vm.name}</div>
                    <div className="text-xs text-mute mono">{vm.legacyId ?? `vmid:${vm.vmId}`} · {vm.node}</div>
                  </td>
                  <td><VMStatusBadge status={vm.status}/></td>
                  <td className="mono text-sm">{vm.cpu}%</td>
                  <td className="mono text-sm">
                    {formatBytes(vm.ramUsed)} / {formatBytes(vm.ramTotal)}
                  </td>
                  <td className="mono text-sm" style={{ color: 'var(--ok)' }}>{formatUptime(vm.uptime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
