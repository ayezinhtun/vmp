'use client';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/api-client';
import { useAuth } from '@/lib/store';
import { StatusPill } from '@/components/vms/vm-status-badge';
import { formatDate } from '@/lib/utils';

/* ─── Avatar ──────────────────────────────────────────────────────── */
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const hue = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 7) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.36,
      background: `oklch(0.85 0.06 ${hue})`, color: `oklch(0.32 0.1 ${hue})`,
      fontWeight: 700, fontSize: size * 0.38, display: 'grid', placeItems: 'center',
      letterSpacing: '-0.02em', flexShrink: 0,
    }}>{initials}</div>
  );
}

/* ─── DL row ──────────────────────────────────────────────────────── */
function DlRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)', gap: 16 }}>
      <dt style={{ minWidth: 140, fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</dt>
      <dd style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{value}</dd>
    </div>
  );
}

export default function AccountPage() {
  const authCustomer = useAuth(s => s.customer);
  const { data: me }  = useQuery({ queryKey: ['me'], queryFn: customerApi.me });
  const customer = me ?? authCustomer;

  if (!customer) return (
    <div className="page-head"><p className="page-subtitle">Loading…</p></div>
  );

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Account</h1>
        <p className="page-subtitle">Your profile and service details</p>
      </div>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <Avatar name={customer.name} size={52}/>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>{customer.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{customer.email}</div>
            <div style={{ marginTop: 6 }}><StatusPill status={customer.kycStatus}/></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Personal information */}
        <div className="card">
          <div className="card-head"><h2 className="card-title">Personal information</h2></div>
          <div className="card-body" style={{ padding: '4px 20px 16px' }}>
            <dl style={{ margin: 0 }}>
              <DlRow label="Full name"  value={customer.name}/>
              <DlRow label="Email"      value={<span className="mono" style={{ fontSize: 12 }}>{customer.email}</span>}/>
              <DlRow label="Phone"      value={(customer as any).phone ?? '—'}/>
            </dl>
          </div>
        </div>

        {/* Company */}
        <div className="card">
          <div className="card-head"><h2 className="card-title">Company</h2></div>
          <div className="card-body" style={{ padding: '4px 20px 16px' }}>
            <dl style={{ margin: 0 }}>
              <DlRow label="Company"     value={customer.company ?? '—'}/>
              <DlRow label="Customer ID" value={<span className="mono" style={{ fontSize: 11.5 }}>{customer.id}</span>}/>
              <DlRow label="Member since" value={(customer as any).createdAt ? formatDate((customer as any).createdAt) : '—'}/>
            </dl>
          </div>
        </div>
      </div>

      {/* KYC */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h2 className="card-title">KYC verification</h2></div>
        <div className="card-body" style={{ padding: '12px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Verification status</span>
            <StatusPill status={customer.kycStatus}/>
          </div>

          {customer.kycStatus === 'Pending' && (
            <div style={{ padding: '10px 14px', background: 'var(--warn-soft)', border: '1px solid color-mix(in oklch, var(--warn) 35%, transparent)', borderRadius: 6, fontSize: 12.5, color: 'oklch(0.45 0.13 75)', marginBottom: 14 }}>
              Your identity documents are under review — typically 1 business day. You'll be notified by email.
            </div>
          )}
          {customer.kycStatus === 'Rejected' && (
            <div style={{ padding: '10px 14px', background: 'var(--bad-soft)', border: '1px solid color-mix(in oklch, var(--bad) 35%, transparent)', borderRadius: 6, fontSize: 12.5, color: 'var(--bad)', marginBottom: 14 }}>
              Your KYC was rejected. Please contact support or re-upload valid documents.
            </div>
          )}
          {customer.kycStatus !== 'Approved' && (
            <button className="btn ghost sm">Upload / resubmit documents</button>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h2 className="card-title">Security</h2></div>
        <div className="card-body" style={{ padding: '4px 20px 16px' }}>
          <div style={{ padding: '12px 0', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Password</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>Change your account password</div>
            </div>
            <button className="btn ghost sm">Change password</button>
          </div>
          <div style={{ paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Two-factor authentication</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>Not configured</div>
            </div>
            <button className="btn ghost sm" disabled>Enable 2FA</button>
          </div>
        </div>
      </div>
    </>
  );
}
