'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useVMStore } from '@/lib/store';
import { authApi } from '@/lib/api-client';
import { VMIcon, PlusIcon, TasksIcon, InvoiceIcon, MailIcon, UsersIcon, DashboardIcon, LogoutIcon, LockIcon } from '@/components/layout/icons';

const NAV = [
  { href: '/dashboard', label: 'Dashboard',      icon: 'dashboard' },
  { href: '/vms',       label: 'My VMs',          icon: 'server',   kycRequired: true  },
  { href: '/deploy',    label: 'Deploy VM',        icon: 'plus',     kycRequired: true  },
  { href: '/requests',  label: 'My requests',      icon: 'tasks',    kycRequired: true  },
  { href: '/invoices',  label: 'Invoices',         icon: 'invoice',  kycRequired: true  },
  { href: '/tickets',   label: 'Support tickets',  icon: 'mail'                         },
  { href: '/account',   label: 'Account',          icon: 'users'                        },
];

/** Avatar — hue derived from name, matching original ui.jsx Avatar */
function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const hue = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 7) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `oklch(0.85 0.06 ${hue})`, color: `oklch(0.32 0.1 ${hue})`,
      display: 'grid', placeItems: 'center', flexShrink: 0,
      fontSize: size * 0.42, fontWeight: 600, letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
}

export function Sidebar() {
  const pathname     = usePathname();
  const router       = useRouter();
  const customer     = useAuth(s => s.customer);
  const clearSession = useAuth(s => s.clearSession);
  const vms          = useVMStore(s => s.vms);
  const kycApproved  = customer?.kycStatus === 'Approved';

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    clearSession();
    router.replace('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">V</div>
        <div>
          <div className="brand-name">VPS Myanmar</div>
          <div className="brand-sub">Customer portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-section">Workspace</div>
        {NAV.map(({ href, label, icon, kycRequired }) => {
          const locked = kycRequired && !kycApproved;
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          const vmBadge = href === '/vms' && vms.size > 0 ? vms.size : null;

          if (locked) {
            return (
              <button key={href} className="nav-item" disabled
                style={{ opacity: 0.45, cursor: 'not-allowed' }}
                title={`Locked — KYC ${customer?.kycStatus ?? 'Pending'}`}>
                <NavIcon name={icon}/>
                <span>{label}</span>
                <LockIcon size={11} style={{ marginLeft: 'auto', opacity: 0.7 }}/>
              </button>
            );
          }

          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <NavIcon name={icon}/>
              <span>{label}</span>
              {vmBadge && <span className="nav-badge">{vmBadge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="nav-user">
        {customer?.name && <Avatar name={customer.name} size={28}/>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="who" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {customer?.name ?? '—'}
          </div>
          <div className="role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {customer?.company ?? 'Customer'}
          </div>
        </div>
        <button className="icon-btn" title="Sign out" onClick={handleLogout}>
          <LogoutIcon size={14}/>
        </button>
      </div>
    </aside>
  );
}

/** Inline SVG icon subset — matching original icons.jsx exactly */
function NavIcon({ name }: { name: string }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'nav-icon', flexShrink: 0 };
  switch (name) {
    case 'dashboard': return <svg {...props}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    case 'server':    return <svg {...props}><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><circle cx="7" cy="7.5" r=".6" fill="currentColor"/><circle cx="7" cy="16.5" r=".6" fill="currentColor"/></svg>;
    case 'plus':      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'tasks':     return <svg {...props}><rect x="3" y="5" width="6" height="14" rx="1.5"/><rect x="11" y="5" width="6" height="9" rx="1.5"/><path d="M19 5h2v6"/></svg>;
    case 'invoice':   return <svg {...props}><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>;
    case 'mail':      return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 6 9-6"/></svg>;
    case 'users':     return <svg {...props}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.5.3 4.5 1.8 5 5"/></svg>;
    default:          return null;
  }
}
