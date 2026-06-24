import { useState, useEffect } from 'react'
import StoreProvider from './lib/store'
import { Sidebar, Topbar } from './components/Shell'
import { AuthShell } from './components/auth/Auth'
import Dashboard from './components/views/Dashboard'
import VMList from './components/views/VMList'
import CustomersView from './components/views/Customers'
import { TeamView, SettingsView } from './components/views/Team'
import { FinanceView, ReportsView } from './components/views/Finance'
import { TasksView, ActivityView, AlertsView, NetworkView } from './components/views/Ops'
import RoleSwitcher from './components/common/RoleSwitcher'
import Toasts from './components/common/Toasts'
import AIChatWidget from './components/common/AIChat'
import { CommandPalette, ShortcutsModal, CalendarView } from './components/common/Extras'
import { TweaksPanel, TweakSection, TweakSelect, TweakText, TweakRadio, TweakColor } from './components/common/TweaksPanel'
import { useStore } from './lib/store'

const ACCENT_MAP: Record<string, number> = {
  '#4F6FE3': 250,
  '#3D9C6E': 155,
  '#C25A4B': 25,
  '#8060D4': 285,
  '#C9883A': 75,
}

interface TweakState {
  role: string
  theme: string
  accent: string
  roleNames: Record<string, string>
}

// Local useTweaks implementation to match TweaksPanel's signature
const useTweaks = (initial: TweakState) => {
  const [tw, setTw] = useState<TweakState>(initial)
  const setTweak = (keyOrEdits: keyof TweakState | Partial<TweakState>, value?: any) => {
    setTw(prev => {
      if (typeof keyOrEdits === 'object' && keyOrEdits !== null) {
        return { ...prev, ...keyOrEdits }
      }
      return { ...prev, [keyOrEdits]: value }
    })
  }
  return [tw, setTweak] as const
}


// Placeholder views for unconverted components
const PlaceholderView = ({ title, description }: { title: string; description: string }) => (
  <div className="content">
    <div className="page-head">
      <h1 className="page-title">{title}</h1>
    </div>
    <div className="card">
      <div className="card-body">
        <div className="empty">
          <div className="title">{title}</div>
          <div className="sub">{description}</div>
        </div>
      </div>
    </div>
  </div>
)

const AppInner = ({ tw, setTweak }: { tw: TweakState; setTweak: (keyOrEdits: keyof TweakState | Partial<TweakState>, value?: any) => void }) => {
  const { state } = useStore()
  const [view, setView] = useState('dashboard')
  const [notifOpen, setNotifOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const openModal = (kind: string, props: any = {}) => { console.log('Open modal:', kind, props) }
  const openVM = (id: string) => console.log('Open VM:', id)
  const openCust = (id: string) => console.log('Open customer:', id)

  // Keyboard shortcuts
  useEffect(() => {
    let gPressed = false, nPressed = false
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const inField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT'
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); return }
      if (e.key === 'Escape') { setCmdOpen(false); setNotifOpen(false); setShortcutsOpen(false); return }
      if (inField) return
      if (e.key === '?') { e.preventDefault(); setShortcutsOpen(true); return }
      if (e.key === 'g') { gPressed = true; nPressed = false; setTimeout(() => gPressed = false, 1200); return }
      if (e.key === 'n') { nPressed = true; gPressed = false; setTimeout(() => nPressed = false, 1200); return }
      if (gPressed) {
        const map: Record<string, string> = { d: 'dashboard', v: 'vms', c: 'customers', t: 'tasks', f: 'finance', k: 'kyc', a: 'alerts', l: 'activity', r: 'reports', s: 'settings' }
        if (map[e.key]) { setView(map[e.key]); gPressed = false }
        return
      }
      if (nPressed) {
        const m: Record<string, string> = { v: 'newvm', c: 'newcust', t: 'newtask', i: 'email' }
        if (m[e.key]) { openModal(m[e.key]); nPressed = false }
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Apply theme + accent
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tw.theme)
    const hue = ACCENT_MAP[tw.accent] || 250
    document.documentElement.style.setProperty('--accent-h', hue.toString())
  }, [tw.theme, tw.accent])

  const unread = state.alerts.filter(a => !a.read).length

  const crumbs: Record<string, string[]> = {
    'dashboard': ['Overview', 'Dashboard'],
    'alerts': ['Overview', 'Notifications'],
    'calendar': ['Overview', 'Expiry calendar'],
    'activity': ['Overview', 'Activity log'],
    'vms': ['Operations', 'VM records'],
    'tasks': ['Operations', 'Provisioning tasks'],
    'network': ['Operations', 'Network & IPs'],
    'console': ['Engineering', 'Web console'],
    'nodes': ['Engineering', 'Proxmox nodes'],
    'topology': ['Engineering', 'Network topology'],
    'snapshots': ['Engineering', 'Snapshots'],
    'maintenance': ['Engineering', 'Maintenance windows'],
    'patches': ['Engineering', 'Patch queue'],
    'firewall': ['Engineering', 'Firewall rules'],
    'customers': ['Customers', 'All customers'],
    'customer-accounts': ['Customers', 'Customer accounts'],
    'kyc': ['Customers', 'KYC review'],
    'pipeline': ['Sales', 'Pipeline'],
    'quotes': ['Sales', 'Quotes'],
    'followups': ['Sales', 'Follow-ups'],
    'trials': ['Sales', 'Trial conversions'],
    'finance': ['Finance', 'Invoices'],
    'reports': ['Finance', 'Reports'],
    'aging': ['Finance', 'Aging receivables'],
    'reconciliation': ['Finance', 'Reconciliation'],
    'recurring': ['Finance', 'Recurring billing'],
    'tax': ['Finance', 'Tax / VAT report'],
    'team': ['Admin', 'Team & roles'],
    'settings': ['Admin', 'System settings'],
    'health': ['Admin', 'System health'],
    'audit': ['Admin', 'Audit log'],
    'announcements': ['Admin', 'Announcements'],
    'apikeys': ['Admin', 'API & webhooks'],
    'backups': ['Admin', 'Backup center'],
    'account': ['You', 'Account settings'],
  }

  const NotifPanel = ({ onAllRead, onViewAll }: any) => {
    const { state, markAlertRead } = useStore()
    const sevColor: Record<string, string> = { urgent: 'urgent', warn: 'warn', info: 'info' }
    return (
      <div className="notif-panel">
        <div className="notif-head">
          <div className="fw-6">Notifications</div>
          <button className="btn ghost sm" onClick={onAllRead}>Mark all read</button>
        </div>
        <div className="notif-list">
          {state.alerts.slice(0, 6).map(a => (
            <div key={a.id} className={`notif ${!a.read ? 'unread' : ''}`} onClick={() => markAlertRead(a.id)}>
              <span className={`sev-dot ${sevColor[a.sev]}`}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="title">{a.title}</div>
                <div className="body">{a.body}</div>
                <div className="ts">{a.ts}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 10, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <button className="btn sm w-full" onClick={onViewAll}>View all alerts</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={(v) => { setView(v); setNotifOpen(false) }} role={tw.role} roleNames={tw.roleNames || {}} onAccountClick={() => setView('account')}/>
      <div className="main">
        <Topbar
          crumbs={crumbs[view] || ['Dashboard']}
          theme={tw.theme}
          setTheme={(t) => setTweak('theme' as keyof TweakState, t)}
          onBellClick={() => setNotifOpen(!notifOpen)}
          onSearchClick={() => {}}
          onHelpClick={() => {}}
          unread={unread}
        />
        {notifOpen && <NotifPanel onAllRead={() => { useStore().markAllAlertsRead(); setNotifOpen(false) }} onViewAll={() => { setView('alerts'); setNotifOpen(false) }}/>}

        {view === 'dashboard' && <Dashboard openVM={openVM} setView={setView} openModal={openModal}/>}
        {view === 'alerts' && <AlertsView/>}
        {view === 'calendar' && <CalendarView openVM={openVM}/>}
        {view === 'activity' && <ActivityView/>}
        {view === 'vms' && <VMList openVM={openVM} openModal={openModal}/>}
        {view === 'tasks' && <TasksView openVM={openVM} openCust={openCust} openModal={openModal}/>}
        {view === 'network' && <NetworkView openVM={openVM} openModal={openModal}/>}
        {view === 'console' && <PlaceholderView title="Web Console" description="Proxmox web console - coming soon"/>}
        {view === 'nodes' && <PlaceholderView title="Proxmox Nodes" description="Node management view - coming soon"/>}
        {view === 'topology' && <PlaceholderView title="Network Topology" description="Network topology view - coming soon"/>}
        {view === 'snapshots' && <PlaceholderView title="Snapshots" description="VM snapshots view - coming soon"/>}
        {view === 'maintenance' && <PlaceholderView title="Maintenance Windows" description="Maintenance scheduling - coming soon"/>}
        {view === 'patches' && <PlaceholderView title="Patch Queue" description="OS patch management - coming soon"/>}
        {view === 'firewall' && <PlaceholderView title="Firewall Rules" description="Firewall configuration - coming soon"/>}
        {view === 'customers' && <CustomersView openCust={openCust} openModal={openModal}/>}
        {view === 'customer-accounts' && <PlaceholderView title="Customer Accounts" description="Customer account management - coming soon"/>}
        {view === 'kyc' && <PlaceholderView title="KYC Review" description="KYC review workflow - coming soon"/>}
        {view === 'pipeline' && <PlaceholderView title="Sales Pipeline" description="Sales pipeline view - coming soon"/>}
        {view === 'quotes' && <PlaceholderView title="Quotes" description="Quote management - coming soon"/>}
        {view === 'followups' && <PlaceholderView title="Follow-ups" description="Sales follow-ups - coming soon"/>}
        {view === 'trials' && <PlaceholderView title="Trial Conversions" description="Trial conversion tracking - coming soon"/>}
        {view === 'finance' && <FinanceView openCust={(_id: string) => {}} openModal={openModal}/>}
        {view === 'reports' && <ReportsView/>}
        {view === 'aging' && <PlaceholderView title="Aging Receivables" description="Aging receivables report - coming soon"/>}
        {view === 'reconciliation' && <PlaceholderView title="Reconciliation" description="Payment reconciliation - coming soon"/>}
        {view === 'recurring' && <PlaceholderView title="Recurring Billing" description="Recurring billing management - coming soon"/>}
        {view === 'tax' && <PlaceholderView title="Tax / VAT Report" description="Tax and VAT reporting - coming soon"/>}
        {view === 'team' && <TeamView openModal={openModal}/>}
        {view === 'settings' && <SettingsView/>}
        {view === 'health' && <PlaceholderView title="System Health" description="System health monitoring - coming soon"/>}
        {view === 'audit' && <PlaceholderView title="Audit Log" description="Audit trail - coming soon"/>}
        {view === 'announcements' && <PlaceholderView title="Announcements" description="System announcements - coming soon"/>}
        {view === 'apikeys' && <PlaceholderView title="API & Webhooks" description="API key management - coming soon"/>}
        {view === 'backups' && <PlaceholderView title="Backup Center" description="Backup management - coming soon"/>}
        {view === 'account' && <PlaceholderView title="Account Settings" description="User account settings - coming soon"/>}
      </div>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} setView={setView} openVM={openVM} openCust={openCust} openModal={openModal}/>}
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)}/>}

      <Toasts/>
      <RoleSwitcher role={tw.role} setRole={(r) => setTweak('role', r)} roleNames={tw.roleNames || {}}/>
      <AIChatWidget role={tw.role}/>

      <TweaksUI tw={tw} setTweak={setTweak}/>
    </div>
  )
}

const TweaksUI = ({ tw, setTweak }: { tw: TweakState; setTweak: (keyOrEdits: keyof TweakState | Partial<TweakState>, value?: any) => void }) => {
  const setRoleName = (role: string, name: string) => setTweak('roleNames' as keyof TweakState, { ...(tw.roleNames || {}), [role]: name })
  const rn = tw.roleNames || {}
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Role">
        <TweakSelect
          label="View as"
          value={tw.role}
          options={['Admin', 'Sales', 'Engineer', 'Finance', 'Customer'].map(r => ({ value: r, label: rn[r] || r }))}
          onChange={(v) => setTweak('role' as keyof TweakState, v)}
        />
      </TweakSection>
      <TweakSection label="Name role views">
        <TweakText label="Admin" value={rn.Admin || ''} placeholder="Administrator" onChange={v => setRoleName('Admin', v)}/>
        <TweakText label="Sales" value={rn.Sales || ''} placeholder="Sales" onChange={v => setRoleName('Sales', v)}/>
        <TweakText label="Engineer" value={rn.Engineer || ''} placeholder="Engineer" onChange={v => setRoleName('Engineer', v)}/>
        <TweakText label="Finance" value={rn.Finance || ''} placeholder="Finance" onChange={v => setRoleName('Finance', v)}/>
        <TweakText label="Customer" value={rn.Customer || ''} placeholder="Customer" onChange={v => setRoleName('Customer', v)}/>
      </TweakSection>
      <TweakSection label="Appearance">
        <TweakRadio
          label="Theme"
          value={tw.theme}
          options={[{value: 'light', label: 'Light'}, {value: 'dark', label: 'Dark'}]}
          onChange={(v) => setTweak('theme' as keyof TweakState, v)}
        />
        <TweakColor
          label="Accent"
          value={tw.accent}
          options={['#4F6FE3', '#3D9C6E', '#C25A4B', '#8060D4', '#C9883A']}
          onChange={(v) => setTweak('accent' as keyof TweakState, v)}
        />
      </TweakSection>
    </TweaksPanel>
  )
}

const App = () => {
  const [tw, setTweak] = useTweaks({
    role: "Admin",
    theme: "light",
    accent: "#4F6FE3",
    roleNames: {
      "Admin": "Administrator",
      "Sales": "Sales",
      "Engineer": "Engineer",
      "Finance": "Finance",
      "Customer": "Customer"
    }
  })

  return (
    <StoreProvider>
      <AuthShell setRole={(role) => setTweak('role' as keyof TweakState, role)}>
        <AppInner tw={tw} setTweak={setTweak} />
      </AuthShell>
    </StoreProvider>
  )
}

export default App
