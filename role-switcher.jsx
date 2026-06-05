// Floating role switcher — bottom-right pill that expands into a role picker

const RoleSwitcher = ({ role, setRole, roleNames = {} }) => {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!e.target.closest('[data-role-switcher]')) setOpen(false); };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  const roles = [
    { id: 'Admin', icon: 'shield', desc: 'Full system access' },
    { id: 'Sales', icon: 'users', desc: 'Customer + pipeline' },
    { id: 'Engineer', icon: 'cpu', desc: 'Infra + provisioning' },
    { id: 'Finance', icon: 'invoice', desc: 'Billing + reports' },
    { id: 'Customer', icon: 'building', desc: 'Read-only portal' },
  ];

  const roleColors = {
    'Admin': 'oklch(0.55 0.18 285)',
    'Sales': 'oklch(0.62 0.13 155)',
    'Engineer': 'oklch(0.6 0.15 230)',
    'Finance': 'oklch(0.6 0.15 75)',
    'Customer': 'oklch(0.55 0.01 80)',
  };

  return (
    <div data-role-switcher style={{
      position: 'fixed',
      bottom: 24, right: 24,
      zIndex: 999,
    }}>
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 56, right: 0,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-lg)',
          width: 280,
          overflow: 'hidden',
          animation: 'roleIn 0.18s ease-out',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
            <div className="fw-7" style={{ fontSize: 13 }}>Switch role</div>
            <div className="text-xs text-mute mt-1">Demo: switch to see role-specific views</div>
          </div>
          <div style={{ padding: 6 }}>
            {roles.map(r => {
              const active = r.id === role;
              const label = roleNames[r.id] || r.id;
              return (
                <button key={r.id}
                  onClick={() => { setRole(r.id); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 10px',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    border: 'none', borderRadius: 8,
                    cursor: 'pointer', textAlign: 'left',
                    marginBottom: 2,
                  }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${roleColors[r.id]}22`, color: roleColors[r.id],
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}><Icon name={r.icon} size={15}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-6 text-sm" style={{ color: active ? 'var(--accent-strong)' : 'var(--ink)' }}>{label}</div>
                    <div className="text-xs text-mute" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.desc}</div>
                  </div>
                  {active && <Icon name="check" size={14} style={{ color: 'var(--accent-strong)' }}/>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch role"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          background: 'var(--ink)',
          color: 'oklch(0.99 0 0)',
          border: 'none',
          borderRadius: 999,
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          fontWeight: 600,
          fontSize: 12.5,
        }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: roleColors[role],
          display: 'grid', placeItems: 'center',
        }}><Icon name={roles.find(r => r.id === role)?.icon || 'users'} size={12}/></div>
        <span>{roleNames[role] || role}</span>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={12} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}/>
      </button>
      <style>{`@keyframes roleIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

window.RoleSwitcher = RoleSwitcher;
