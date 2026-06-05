// Shared helpers and small components

const StatusPill = ({ status }) => {
  const map = {
    'Active': 'ok', 'Running': 'ok', 'Approved': 'ok', 'Done': 'ok', 'Payment Received': 'ok',
    'Pending': 'warn', 'In Progress': 'warn', 'Customer Transferred': 'warn',
    'Suspended': 'warn', 'Trial': 'info', 'Paid': 'accent',
    'Expired': 'bad', 'Overdue': 'bad', 'Rejected': 'bad', 'Blocked': 'bad', 'Inactive': 'subtle',
    'Stopped': 'subtle', 'Terminated': 'bad',
  };
  return <span className={`pill ${map[status] || 'subtle'}`}><span className="dot"></span>{status}</span>;
};

const formatMMK = (n) => {
  if (!n) return '0';
  return n.toLocaleString('en-US');
};

const ExpiryCell = ({ date }) => {
  if (!date || date === '—') return <span className="text-mute">—</span>;
  const d = new Date(date);
  const diff = Math.ceil((d - window.MOCK.TODAY) / 86400000);
  let cls = 'text-mute';
  let label = `${diff}d`;
  if (diff < 0) { cls = 'text-bad'; label = `${Math.abs(diff)}d ago`; }
  else if (diff <= 7) { cls = 'text-warn'; }
  return (
    <div className="flex col" style={{ gap: 1 }}>
      <span className="tnum">{date}</span>
      <span className="text-xs tnum" style={{ color: diff < 0 ? 'var(--bad)' : diff <= 7 ? 'oklch(0.45 0.13 75)' : 'var(--ink-3)' }}>
        {diff < 0 ? `${Math.abs(diff)} days ago` : `${diff} days left`}
      </span>
    </div>
  );
};

const Avatar = ({ name, size = 24 }) => {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  // pick hue from name
  const hue = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 7) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `oklch(0.85 0.06 ${hue})`, color: `oklch(0.32 0.1 ${hue})`,
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.42, fontWeight: 600, flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
};

const SecCheck = ({ on }) => (
  <span className={`pill ${on ? 'ok' : 'warn'}`}>
    <Icon name={on ? 'check' : 'alert'} size={11} />
    {on ? 'Compliant' : 'Review'}
  </span>
);

// Tiny sparkline-as-bars chart (no library)
const Bars = ({ data, height = 36, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(v / max) * 100}%`,
          background: color || 'var(--accent)',
          borderRadius: 2,
          opacity: 0.4 + (v / max) * 0.6,
          minHeight: 2,
        }}/>
      ))}
    </div>
  );
};

// Donut (svg)
const Donut = ({ segments, size = 110, thickness = 14 }) => {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thickness}/>
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const node = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
                  stroke={s.color} strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${size/2} ${size/2})`}/>
        );
        offset += len;
        return node;
      })}
    </svg>
  );
};

Object.assign(window, { StatusPill, formatMMK, ExpiryCell, Avatar, SecCheck, Bars, Donut });
