// Toast notifications

const Toasts = () => {
  const { toasts, setToasts } = useStore();
  return (
    <div style={{
      position: 'fixed',
      top: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 1000, pointerEvents: 'none',
      maxWidth: 'calc(100vw - 48px)',
    }}>
      {toasts.map(t => {
        const colors = {
          ok: { bg: 'var(--ok-soft)', fg: 'var(--ok)', icon: 'check' },
          bad: { bg: 'var(--bad-soft)', fg: 'var(--bad)', icon: 'alert' },
          warn: { bg: 'var(--warn-soft)', fg: 'oklch(0.45 0.13 75)', icon: 'alert' },
          info: { bg: 'var(--info-soft)', fg: 'var(--info)', icon: 'bell' },
        }[t.kind] || { bg: 'var(--surface-2)', fg: 'var(--ink)', icon: 'bell' };
        return (
          <div key={t.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '10px 14px 10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            minWidth: 280, maxWidth: 420,
            pointerEvents: 'auto',
            boxShadow: 'var(--shadow)',
            animation: 'toastIn 0.25s ease-out',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: colors.bg, color: colors.fg,
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}><Icon name={colors.icon} size={14}/></div>
            <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{t.msg}</div>
            {t.action && <button className="btn sm" onClick={t.action.fn}>{t.action.label}</button>}
            <button className="icon-btn" style={{ width: 22, height: 22 }}
              onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>
              <Icon name="x" size={12}/>
            </button>
          </div>
        );
      })}
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
};

window.Toasts = Toasts;
