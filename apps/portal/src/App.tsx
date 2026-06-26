import { useState, useEffect } from 'react'
import { Sidebar, Topbar } from './components/layout/Shell'
import { AuthShell, useAuth } from './components/auth/Auth'
import Dashboard from './pages/Dashboard'
import VMList from './pages/VMList'
import VMDrawer from './components/vm/VMDrawer'
import { NewVMModal, RenewModal, SpecModal, TerminateModal, NewTaskModal, NewCustomerModal, EmailModal, NewInvoiceModal, InviteMemberModal } from './components/modals/AdminVMModals'
import CustomersView from './pages/Customers'
import CustomerDrawer from './components/customer/CustomerDrawer'
import { TeamView, SettingsView } from './pages/Team'
import { FinanceView, ReportsView } from './pages/Finance'
import { TasksView, ActivityView, AlertsView, NetworkView, TaskDrawer } from './pages/Ops'
import { CustomerAccountManagementView } from './pages/CustomerAccounts'
import { KYCReviewView } from './pages/KYCReview'
import { AgingView, ReconciliationView, RecurringView, TaxView } from './pages/FinanceExtras'
import { AccountSettingsView } from './pages/AccountSettings'
import { SystemHealthView, AuditLogView, AnnouncementsView, ApiKeysView, BackupCenterView } from './pages/AdminExtras'
import CustomerPortal from './pages/CustomerPortal'
import RoleSwitcher from './components/common/RoleSwitcher'
import Toasts from './components/common/Toasts'
import AIChatWidget from './components/common/AIChat'
import { CommandPalette, ShortcutsModal, CalendarView } from './components/common/Extras'
import { NotifPanel, PlaceholderView, TweaksUI } from './components/common'
import { useTweaks, TweakState } from './components/common/useTweaks'
import useAlertStore from './store/alertStore'

const ACCENT_MAP: Record<string, number> = {
  '#4F6FE3': 250,
  '#3D9C6E': 155,
  '#C25A4B': 25,
  '#8060D4': 285,
  '#C9883A': 75,
}

const AppInner = ({ tw, setTweak }: { tw: TweakState; setTweak: (keyOrEdits: keyof TweakState | Partial<TweakState>, value?: any) => void }) => {
  const { alerts, markAllAlertsRead } = useAlertStore()
  const auth = useAuth()
  const [view, setView] = useState('dashboard')
  const [notifOpen, setNotifOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const [modalKind, setModalKind] = useState<string | null>(null)
  const [modalProps, setModalProps] = useState<any>({})
  const [drawerVmId, setDrawerVmId] = useState<string | null>(null)
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null)
  const [drawerCustId, setDrawerCustId] = useState<string | null>(null)

  const openModal = (kind: string, props: any = {}) => { setModalKind(kind); setModalProps(props) }
  const closeModal = () => { setModalKind(null); setModalProps({}) }
  const openVM = (id: string) => setDrawerVmId(id)
  const closeDrawer = () => setDrawerVmId(null)
  const openTask = (id: string) => setDrawerTaskId(id)
  const closeTaskDrawer = () => setDrawerTaskId(null)
  const openCust = (id: string) => setDrawerCustId(id)
  const closeCustDrawer = () => setDrawerCustId(null)

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

  useEffect(() => {
    console.log('AppInner role changed:', tw.role, 'should render CustomerPortal:', tw.role === 'Customer')
  }, [tw.role])

  const unread = alerts.filter((a: any) => !a.read).length

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


  return (
    <div className="app">
      {tw.role === 'Customer' ? (
        <CustomerPortal role={tw.role} setRole={(r) => setTweak('role', r)} roleNames={tw.roleNames || {}}/>
      ) : (
        <>
          <Sidebar view={view} setView={(v) => { setView(v); setNotifOpen(false) }} role={tw.role} roleNames={tw.roleNames || {}} onAccountClick={() => setView('account')} onLogout={() => auth?.signout()}/>
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
            {notifOpen && <NotifPanel onAllRead={() => { markAllAlertsRead(); setNotifOpen(false) }} onViewAll={() => { setView('alerts'); setNotifOpen(false) }}/>}

            {view === 'dashboard' && <Dashboard openVM={openVM} setView={setView} openModal={openModal}/>}
            {view === 'alerts' && <AlertsView/>}
            {view === 'calendar' && <CalendarView openVM={openVM}/>}
            {view === 'activity' && <ActivityView/>}
            {view === 'vms' && <VMList openVM={openVM} openModal={openModal}/>}
            {drawerVmId && <VMDrawer vmId={drawerVmId} onClose={closeDrawer} openCust={openCust} openModal={openModal}/>}
            {view === 'tasks' && <TasksView openModal={openModal} openTask={openTask}/>}
            {drawerTaskId && <TaskDrawer taskId={drawerTaskId} onClose={closeTaskDrawer}/>}
            {view === 'network' && <NetworkView openVM={openVM} openModal={openModal}/>}
            {view === 'console' && <PlaceholderView title="Web Console" description="Proxmox web console - coming soon"/>}
            {view === 'nodes' && <PlaceholderView title="Proxmox Nodes" description="Node management view - coming soon"/>}
            {view === 'topology' && <PlaceholderView title="Network Topology" description="Network topology view - coming soon"/>}
            {view === 'snapshots' && <PlaceholderView title="Snapshots" description="VM snapshots view - coming soon"/>}
            {view === 'maintenance' && <PlaceholderView title="Maintenance Windows" description="Maintenance scheduling - coming soon"/>}
            {view === 'patches' && <PlaceholderView title="Patch Queue" description="OS patch management - coming soon"/>}
            {view === 'firewall' && <PlaceholderView title="Firewall Rules" description="Firewall configuration - coming soon"/>}
            {view === 'customers' && <CustomersView openCust={openCust} openModal={openModal}/>}
            {drawerCustId && <CustomerDrawer custId={drawerCustId} onClose={closeCustDrawer} openVM={openVM} openModal={openModal}/>}
            {view === 'customer-accounts' && <CustomerAccountManagementView openCust={openCust} openModal={openModal}/>}
            {view === 'kyc' && <KYCReviewView/>}
            {view === 'pipeline' && <PlaceholderView title="Sales Pipeline" description="Sales pipeline view - coming soon"/>}
            {view === 'quotes' && <PlaceholderView title="Quotes" description="Quote management - coming soon"/>}
            {view === 'followups' && <PlaceholderView title="Follow-ups" description="Sales follow-ups - coming soon"/>}
            {view === 'trials' && <PlaceholderView title="Trial Conversions" description="Trial conversion tracking - coming soon"/>}
            {view === 'finance' && <FinanceView openCust={(_id: string) => {}} openModal={openModal}/>}
            {view === 'reports' && <ReportsView/>}
            {view === 'aging' && <AgingView/>}
            {view === 'reconciliation' && <ReconciliationView/>}
            {view === 'recurring' && <RecurringView/>}
            {view === 'tax' && <TaxView/>}
            {view === 'team' && <TeamView openModal={openModal}/>}
            {view === 'settings' && <SettingsView/>}
            {view === 'health' && <SystemHealthView/>}
            {view === 'audit' && <AuditLogView/>}
            {view === 'announcements' && <AnnouncementsView/>}
            {view === 'apikeys' && <ApiKeysView openModal={openModal}/>}
            {view === 'backups' && <BackupCenterView/>}
            {view === 'account' && <AccountSettingsView role={tw.role} setView={setView}/>}
          </div>

          {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} setView={setView} openVM={openVM} openCust={openCust} openModal={openModal}/>}
          {modalKind === 'newvm' && <NewVMModal onClose={closeModal}/>}
          {modalKind === 'renew' && modalProps.vm && <RenewModal vm={modalProps.vm} onClose={closeModal}/>}
          {modalKind === 'spec' && modalProps.vm && <SpecModal vm={modalProps.vm} onClose={closeModal}/>}
          {modalKind === 'terminate' && modalProps.vm && <TerminateModal vm={modalProps.vm} onClose={closeModal}/>}
          {modalKind === 'newtask' && <NewTaskModal onClose={closeModal} presetStatus={modalProps.status}/>}
          {modalKind === 'newcust' && <NewCustomerModal onClose={closeModal}/>}
          {modalKind === 'email' && <EmailModal onClose={closeModal} to={modalProps.to} template={modalProps.template}/>}
          {modalKind === 'newinvoice' && <NewInvoiceModal onClose={closeModal} presetCustomer={modalProps.customer}/>}
          {modalKind === 'invite' && <InviteMemberModal onClose={closeModal}/>}
          {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)}/>}
        </>
      )}

      <Toasts/>
      <RoleSwitcher role={tw.role} setRole={(r) => setTweak('role', r)} roleNames={tw.roleNames || {}}/>
      <AIChatWidget role={tw.role}/>

      <TweaksUI tw={tw} setTweak={setTweak}/>
    </div>
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
    <AuthShell setRole={(role) => setTweak('role' as keyof TweakState, role)}>
      <AppInner tw={tw} setTweak={setTweak} />
    </AuthShell>
  )
}

export default App
