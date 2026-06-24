import React from 'react'
import Icon from '../lib/icons'
import { Avatar } from '../lib/ui'

interface NavItem {
  section?: string
  id?: string
  label?: string
  icon?: string
  badge?: number
}

interface SidebarProps {
  view: string
  setView: (view: string) => void
  role: string
  roleNames?: Record<string, string>
  onAccountClick?: () => void
}

interface TopbarProps {
  crumbs: string[]
  actions?: React.ReactNode
  theme: string
  setTheme: (theme: string) => void
  onBellClick?: () => void
  onSearchClick?: () => void
  onHelpClick?: () => void
  unread?: number
}

const NAV: NavItem[] = [
  { section: 'Overview' },
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'alerts', label: 'Notifications', icon: 'bell', badge: 3 },
  { id: 'calendar', label: 'Calendar', icon: 'clock' },
  { id: 'activity', label: 'Activity log', icon: 'activity' },
  { section: 'Operations' },
  { id: 'vms', label: 'VM records', icon: 'server' },
  { id: 'tasks', label: 'Provisioning', icon: 'tasks', badge: 2 },
  { id: 'network', label: 'Network & IPs', icon: 'network' },
  { section: 'Engineering' },
  { id: 'console', label: 'Web console', icon: 'cpu' },
  { id: 'nodes', label: 'Proxmox nodes', icon: 'server' },
  { id: 'topology', label: 'Topology', icon: 'network' },
  { id: 'snapshots', label: 'Snapshots', icon: 'database' },
  { id: 'maintenance', label: 'Maintenance', icon: 'sliders' },
  { id: 'patches', label: 'Patch queue', icon: 'box' },
  { id: 'firewall', label: 'Firewall rules', icon: 'shield' },
  { section: 'Customers' },
  { id: 'customers', label: 'Customers', icon: 'users' },
  { id: 'customer-accounts', label: 'Account management', icon: 'shield' },
  { id: 'kyc', label: 'KYC review', icon: 'shield', badge: 2 },
  { section: 'Sales' },
  { id: 'pipeline', label: 'Pipeline', icon: 'tasks' },
  { id: 'quotes', label: 'Quotes', icon: 'file' },
  { id: 'followups', label: 'Follow-ups', icon: 'clock' },
  { id: 'trials', label: 'Trial conversions', icon: 'box' },
  { section: 'Finance' },
  { id: 'finance', label: 'Invoices', icon: 'invoice' },
  { id: 'reports', label: 'Reports', icon: 'box' },
  { id: 'aging', label: 'Aging receivables', icon: 'clock' },
  { id: 'reconciliation', label: 'Reconciliation', icon: 'check' },
  { id: 'recurring', label: 'Recurring billing', icon: 'refresh' },
  { id: 'tax', label: 'Tax / VAT', icon: 'file' },
  { section: 'Admin' },
  { id: 'team', label: 'Team & roles', icon: 'lock' },
  { id: 'settings', label: 'System settings', icon: 'settings' },
  { id: 'health', label: 'System health', icon: 'activity' },
  { id: 'audit', label: 'Audit log', icon: 'eye' },
  { id: 'announcements', label: 'Announcements', icon: 'mail' },
  { id: 'apikeys', label: 'API & webhooks', icon: 'key' },
  { id: 'backups', label: 'Backup center', icon: 'database' },
]

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, role, roleNames = {}, onAccountClick }) => {
  const roleLabel = roleNames[role] || role
  const HIDDEN = new Set(['calendar', 'network', 'console', 'nodes', 'topology', 'snapshots', 'maintenance', 'patches', 'firewall', 'health', 'apikeys', 'backups', 'pipeline', 'quotes', 'followups', 'trials'])
  const items = (role === 'Customer' ? [
    { id: 'cust-vms', label: 'My VMs', icon: 'server' },
    { id: 'cust-invoices', label: 'Invoices & receipts', icon: 'invoice' },
    { id: 'cust-profile', label: 'Profile', icon: 'users' },
  ] : NAV).filter(it => it.section || (it.id && !HIDDEN.has(it.id)))

  const allowedFor: Record<string, Set<string> | null> = {
    'Sales': new Set(['dashboard', 'alerts', 'calendar', 'activity', 'vms', 'tasks', 'customers', 'customer-accounts', 'kyc']),
    'Engineer': new Set(['dashboard', 'alerts', 'calendar', 'activity', 'vms', 'tasks', 'network', 'console', 'nodes', 'topology', 'snapshots', 'maintenance', 'patches', 'firewall']),
    'Finance': new Set(['dashboard', 'alerts', 'calendar', 'vms', 'tasks', 'finance', 'reports', 'customers', 'customer-accounts', 'aging', 'reconciliation', 'recurring', 'tax']),
    'Admin': null,
  }
  const allow = allowedFor[role]

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">V</div>
        <div>
          <div className="brand-name">VM Portal</div>
          <div className="brand-sub">{role === 'Customer' ? 'Customer view' : 'Operations'}</div>
        </div>
      </div>
      <nav className="nav">
        {items.map((it, i) => {
          if (it.section) {
            const nextSection = items.findIndex((x, idx) => idx > i && x.section)
            const slice = items.slice(i + 1, nextSection === -1 ? items.length : nextSection)
            const visibleSlice = slice.filter(x => !allow || (x.id && allow.has(x.id)))
            if (visibleSlice.length === 0) return null
            return <div key={i} className="nav-section">{it.section}</div>
          }
          if (allow && it.id && !allow.has(it.id)) return null
          return (
            <button key={it.id}
              className={`nav-item ${view === it.id ? 'active' : ''}`}
              onClick={() => it.id && setView(it.id)}>
              <Icon name={it.icon || 'server'} className="nav-icon"/>
              <span>{it.label}</span>
              {it.badge && <span className="nav-badge">{it.badge}</span>}
            </button>
          )
        })}
      </nav>
      <div className="nav-user" style={{ cursor: onAccountClick ? 'pointer' : 'default' }} onClick={onAccountClick}>
        <Avatar name={role === 'Customer' ? 'Thiri Ko' : (role === 'Admin' ? 'Min Khant' : role === 'Sales' ? 'Su Su' : role === 'Engineer' ? 'Ko Thein' : 'Daw Aye')} size={28}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="who">{role === 'Customer' ? 'Thiri Ko' : (role === 'Admin' ? 'Min Khant' : role === 'Sales' ? 'Su Su' : role === 'Engineer' ? 'Ko Thein' : 'Daw Aye')}</div>
          <div className="role">{roleLabel}</div>
        </div>
        <button className="icon-btn" title="Sign out"><Icon name="logout" size={14}/></button>
      </div>
    </aside>
  )
}

export const Topbar: React.FC<TopbarProps> = ({ crumbs, actions, theme, setTheme, onBellClick, onSearchClick, onHelpClick, unread }) => (
  <div className="topbar">
    <div className="crumbs">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="chevron-right" size={12} className="sep"/>}
          {i === crumbs.length - 1 ? <strong>{c}</strong> : <span>{c}</span>}
        </React.Fragment>
      ))}
    </div>
    <div className="topbar-spacer"/>
    <div className="search" onClick={onSearchClick}>
      <Icon name="search" size={14} className="search-icon"/>
      <input placeholder="Search VMs, customers, invoices…" readOnly style={{ cursor: 'pointer' }}/>
      <span className="kbd">⌘K</span>
    </div>
    <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15}/>
    </button>
    <button className="icon-btn" onClick={onHelpClick} title="Keyboard shortcuts (?)">
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>?</span>
    </button>
    <button className="icon-btn" onClick={onBellClick} title="Notifications">
      <Icon name="bell" size={15}/>
      {unread && unread > 0 && <span className="dot"/>}
    </button>
    {actions}
  </div>
)
