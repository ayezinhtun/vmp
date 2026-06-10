/** Matches original StatusPill / pill classes from ui.jsx + styles.css */

type VMStatus = 'running' | 'stopped' | 'paused' | 'unknown' | string;

const STATUS_MAP: Record<string, string> = {
  running:  'ok',
  active:   'ok',
  stopped:  'subtle',
  inactive: 'subtle',
  paused:   'warn',
  pending:  'warn',
  error:    'bad',
  failed:   'bad',
};

export function VMStatusBadge({ status }: { status: VMStatus }) {
  const cls = STATUS_MAP[status?.toLowerCase()] ?? 'subtle';
  return (
    <span className={`pill ${cls}`}>
      <span className="dot"/>
      {status}
    </span>
  );
}

/** Generic StatusPill — matches original ui.jsx StatusPill exactly */
export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Active': 'ok', 'Running': 'ok', 'Approved': 'ok', 'Done': 'ok', 'Payment Received': 'ok',
    'Pending': 'warn', 'In Progress': 'warn', 'Customer Transferred': 'warn',
    'Suspended': 'warn', 'Trial': 'info', 'Paid': 'accent',
    'Expired': 'bad', 'Overdue': 'bad', 'Rejected': 'bad', 'Blocked': 'bad', 'Inactive': 'subtle',
    'Stopped': 'subtle', 'Terminated': 'bad', 'Cancelled': 'subtle',
  };
  return (
    <span className={`pill ${map[status] || 'subtle'}`}>
      <span className="dot"/>
      {status}
    </span>
  );
}
