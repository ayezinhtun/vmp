// Main app shell

const ACCENT_MAP = {
  '#4F6FE3': 250,
  '#3D9C6E': 155,
  '#C25A4B': 25,
  '#8060D4': 285,
  '#C9883A': 75,
};

const AppInner = ({ tw, setTweak }) => {
  const store = useStore();
  const [view, setView] = React.useState('dashboard');
  const [vmDrawer, setVmDrawer] = React.useState(null);
  const [custDrawer, setCustDrawer] = React.useState(null);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [modal, setModal] = React.useState(null);
  const [modalProps, setModalProps] = React.useState({});

  const openModal = (kind, props = {}) => { setModal(kind); setModalProps(props); };
  const closeModal = () => { setModal(null); setModalProps({}); };

  const unread = store.state.alerts.filter(a => !a.read).length;

  // Keyboard shortcuts
  React.useEffect(() => {
    let gPressed = false, nPressed = false;
    const onKey = (e) => {
      const inField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); return; }
      if (e.key === 'Escape') { setCmdOpen(false); setNotifOpen(false); closeModal(); setShortcutsOpen(false); return; }
      if (inField) return;
      if (e.key === '?') { e.preventDefault(); setShortcutsOpen(true); return; }
      if (e.key === 'g') { gPressed = true; nPressed = false; setTimeout(() => gPressed = false, 1200); return; }
      if (e.key === 'n') { nPressed = true; gPressed = false; setTimeout(() => nPressed = false, 1200); return; }
      if (gPressed) {
        const map = { d: 'dashboard', v: 'vms', c: 'customers', t: 'tasks', f: 'finance', k: 'kyc', a: 'alerts', l: 'activity', r: 'reports', s: 'settings' };
        if (map[e.key]) { setView(map[e.key]); gPressed = false; }
        return;
      }
      if (nPressed) {
        const m = { v: 'newvm', c: 'newcust', t: 'newtask', i: 'email' };
        if (m[e.key]) { openModal(m[e.key]); nPressed = false; }
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Apply theme + accent
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tw.theme);
    const hue = ACCENT_MAP[tw.accent] || 250;
    document.documentElement.style.setProperty('--accent-h', hue);
  }, [tw.theme, tw.accent]);

  if (tw.role === 'Customer') {
    return (
      <>
        <CustomerPortal/>
        <TweaksUI tw={tw} setTweak={setTweak}/>
        <RoleSwitcher role={tw.role} setRole={(r) => setTweak('role', r)} roleNames={tw.roleNames || {}}/>
        <AIChatWidget role={tw.role}/>
        <Toasts/>
      </>
    );
  }

  // Resolve display name for current role (fallback to role key)
  const roleLabel = (tw.roleNames && tw.roleNames[tw.role]) || tw.role;

  const crumbs = {
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
    'customer-accounts': ['Customers', 'Customer accounts'],
  };

  const openVM = (id) => setVmDrawer(id);
  const openCust = (id) => { setVmDrawer(null); setCustDrawer(id); };

  return (
    <div className="app">
      <Sidebar view={view} setView={(v) => { setView(v); setNotifOpen(false); }} role={tw.role} roleNames={tw.roleNames || {}} onAccountClick={() => setView('account')}/>
      <div className="main">
        <Topbar
          crumbs={crumbs[view] || ['Dashboard']}
          theme={tw.theme}
          setTheme={(t) => setTweak('theme', t)}
          onBellClick={() => setNotifOpen(!notifOpen)}
          onSearchClick={() => setCmdOpen(true)}
          onHelpClick={() => setShortcutsOpen(true)}
          unread={unread}
        />
        {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} onAllRead={() => { store.markAllAlertsRead(); setNotifOpen(false); }} onViewAll={() => { setView('alerts'); setNotifOpen(false); }}/>}

        {view === 'dashboard' && <Dashboard openVM={openVM} setView={setView} openModal={openModal}/>}
        {view === 'alerts' && <AlertsView/>}
        {view === 'calendar' && <CalendarView openVM={openVM}/>}
        {view === 'activity' && <ActivityView/>}
        {view === 'vms' && <VMList openVM={openVM} openModal={openModal}/>}
        {view === 'tasks' && <TasksView openVM={openVM} openCust={openCust} openModal={openModal}/>}
        {view === 'network' && <NetworkView openVM={openVM} openModal={openModal}/>}
        {view === 'console' && <WebConsoleView/>}
        {view === 'nodes' && <NodesView/>}
        {view === 'topology' && <TopologyView/>}
        {view === 'snapshots' && <SnapshotsView/>}
        {view === 'maintenance' && <MaintenanceView openModal={openModal}/>}
        {view === 'patches' && <PatchesView/>}
        {view === 'firewall' && <FirewallView/>}
        {view === 'customers' && <CustomersView openCust={openCust} openModal={openModal}/>}
        {view === 'customer-accounts' && <CustomerAccountManagementView openCust={openCust} openModal={openModal}/>}
        {view === 'kyc' && <KYCView openCust={openCust} openModal={openModal}/>}
        {view === 'pipeline' && <PipelineView openModal={openModal}/>}
        {view === 'quotes' && <QuotesView/>}
        {view === 'followups' && <FollowupsView openModal={openModal}/>}
        {view === 'trials' && <TrialsView/>}
        {view === 'finance' && <FinanceView openCust={openCust} openModal={openModal}/>}
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

      {vmDrawer && <VMDrawer vmId={vmDrawer} onClose={() => setVmDrawer(null)} openCust={openCust} openModal={openModal}/>}
      {custDrawer && <CustomerDrawer custId={custDrawer} onClose={() => setCustDrawer(null)} openVM={(id) => { setCustDrawer(null); setVmDrawer(id); }} openModal={openModal}/>}

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} setView={setView} openVM={openVM} openCust={openCust} openModal={openModal}/>}
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)}/>}

      {/* Modals */}
      {modal === 'newvm' && <NewVMModal onClose={closeModal} presetCustomer={modalProps.customer}/>}
      {modal === 'newcust' && <NewCustomerModal onClose={closeModal}/>}
      {modal === 'newtask' && <NewTaskModal onClose={closeModal} presetStatus={modalProps.status}/>}
      {modal === 'newinvoice' && <NewInvoiceModal onClose={closeModal} presetCustomer={modalProps.customer}/>}
      {modal === 'newdeal' && <NewDealModal onClose={closeModal} onAdd={modalProps.onAdd}/>}
      {modal === 'newreminder' && <NewReminderModal onClose={closeModal} onAdd={modalProps.onAdd}/>}
      {modal === 'newapikey' && <NewApiKeyModal onClose={closeModal} onAdd={modalProps.onAdd}/>}
      {modal === 'newmaintenance' && <NewMaintenanceModal onClose={closeModal} onAdd={modalProps.onAdd}/>}
      {modal === 'reserveip' && <ReserveIpModal onClose={closeModal}/>}
      {modal === 'email' && <EmailModal onClose={closeModal} to={modalProps.to} template={modalProps.template}/>}
      {modal === 'renew' && <RenewModal vm={modalProps.vm} onClose={closeModal}/>}
      {modal === 'spec' && <SpecChangeModal vm={modalProps.vm} onClose={closeModal}/>}
      {modal === 'terminate' && <TerminateModal vm={modalProps.vm} onClose={closeModal}/>}
      {modal === 'kycdocs' && <KYCDocsModal customer={modalProps.customer} onClose={closeModal}/>}
      {modal === 'invite' && <InviteMemberModal onClose={closeModal}/>}

      <Toasts/>
      <RoleSwitcher role={tw.role} setRole={(r) => setTweak('role', r)} roleNames={tw.roleNames || {}}/>
      <AIChatWidget role={tw.role}/>
      <TweaksUI tw={tw} setTweak={setTweak}/>
    </div>
  );
};

const App = () => {
  const [tw, setTweak] = useTweaks /*EDITMODE-BEGIN*/({
    "role": "Admin",
    "theme": "light",
    "accent": "#4F6FE3",
    "roleNames": {
      "Admin": "Administrator",
      "Sales": "Sales",
      "Engineer": "Engineer",
      "Finance": "Finance",
      "Customer": "Customer"
    }
  })/*EDITMODE-END*/;

  return (
    <StoreProvider>
      <AuthShell setRole={(r) => setTweak('role', r)}>
        <AppInner tw={tw} setTweak={setTweak}/>
      </AuthShell>
    </StoreProvider>
  );
};

const NotifPanel = ({ onClose, onAllRead, onViewAll }) => {
  const { state, markAlertRead } = useStore();
  const sevColor = { urgent: 'urgent', warn: 'warn', info: 'info' };
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
  );
};

const TweaksUI = ({ tw, setTweak }) => {
  const setRoleName = (role, name) => setTweak('roleNames', { ...(tw.roleNames || {}), [role]: name });
  const rn = tw.roleNames || {};
  return (
  <TweaksPanel title="Tweaks">
    <TweakSection label="Role">
      <TweakSelect
        label="View as"
        value={tw.role}
        options={['Admin', 'Sales', 'Engineer', 'Finance', 'Customer'].map(r => ({ value: r, label: rn[r] || r }))}
        onChange={(v) => setTweak('role', v)}
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
        onChange={(v) => setTweak('theme', v)}
      />
      <TweakColor
        label="Accent"
        value={tw.accent}
        options={['#4F6FE3', '#3D9C6E', '#C25A4B', '#8060D4', '#C9883A']}
        onChange={(v) => setTweak('accent', v)}
      />
    </TweakSection>
  </TweaksPanel>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
