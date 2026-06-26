import useAlertStore from '../../store/alertStore'

interface NotifPanelProps {
  onAllRead: () => void
  onViewAll: () => void
}

export const NotifPanel = ({ onAllRead, onViewAll }: NotifPanelProps) => {
  const { alerts, markAlertRead } = useAlertStore()
  const sevColor: Record<string, string> = { urgent: 'urgent', warn: 'warn', info: 'info' }
  return (
    <div className="notif-panel">
      <div className="notif-head">
        <div className="fw-6">Notifications</div>
        <button className="btn ghost sm" onClick={onAllRead}>Mark all read</button>
      </div>
      <div className="notif-list">
        {alerts.slice(0, 6).map(a => (
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
