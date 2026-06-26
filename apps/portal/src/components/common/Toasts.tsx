import React from 'react'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'

const Toasts: React.FC = () => {
  const { toasts, setToasts } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24, left: 24,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.kind}`} style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 280,
          animation: 'toastIn 0.2s ease-out',
        }}>
          <Icon name={t.kind === 'ok' ? 'check' : t.kind === 'bad' ? 'alert' : 'info'} size={16} style={{ color: t.kind === 'ok' ? 'var(--ok)' : t.kind === 'bad' ? 'var(--bad)' : 'var(--accent)' }}/>
          <span style={{ flex: 1, fontSize: 13 }}>{t.msg}</span>
          <button className="icon-btn" onClick={() => setToasts(toasts.filter(x => x.id !== t.id))} style={{ width: 20, height: 20 }}>
            <Icon name="x" size={12}/>
          </button>
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

export default Toasts
