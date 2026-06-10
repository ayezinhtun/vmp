/**
 * Inline SVG icon set — direct port of icons.jsx
 * Stroke style, 16px default, no external dependency.
 */

interface IconProps {
  size?: number;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

function mkIcon(name: string, path: React.ReactNode) {
  return function Icon({ size = 16, stroke = 1.6, className = '', style = {} }: IconProps) {
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth={stroke}
        strokeLinecap="round" strokeLinejoin="round"
        className={className} style={style}
      >
        {path}
      </svg>
    );
  };
}

export const DashboardIcon = mkIcon('dashboard', <>
  <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
  <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
</>);

export const VMIcon = mkIcon('server', <>
  <rect x="3" y="4" width="18" height="7" rx="1.5"/>
  <rect x="3" y="13" width="18" height="7" rx="1.5"/>
  <circle cx="7" cy="7.5" r=".6" fill="currentColor"/>
  <circle cx="7" cy="16.5" r=".6" fill="currentColor"/>
</>);

export const PlusIcon      = mkIcon('plus',    <path d="M12 5v14M5 12h14"/>);
export const TasksIcon     = mkIcon('tasks',   <><rect x="3" y="5" width="6" height="14" rx="1.5"/><rect x="11" y="5" width="6" height="9" rx="1.5"/><path d="M19 5h2v6"/></>);
export const InvoiceIcon   = mkIcon('invoice', <><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z"/><path d="M9 8h6M9 12h6M9 16h3"/></>);
export const BellIcon      = mkIcon('bell',    <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16z"/><path d="M10 21a2 2 0 0 0 4 0"/></>);
export const MailIcon      = mkIcon('mail',    <><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 6 9-6"/></>);
export const UsersIcon     = mkIcon('users',   <><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.5.3 4.5 1.8 5 5"/></>);
export const SearchIcon    = mkIcon('search',  <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>);
export const SettingsIcon  = mkIcon('settings',<circle cx="12" cy="12" r="3"/>);
export const LogoutIcon    = mkIcon('logout',  <><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 17l5-5-5-5M21 12H9"/></>);
export const LockIcon      = mkIcon('lock',    <><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>);
export const ShieldIcon    = mkIcon('shield',  <><path d="M12 3 4 6v6c0 4 3.5 7.5 8 9 4.5-1.5 8-5 8-9V6l-8-3z"/><path d="m8.5 12 2.5 2.5L16 10"/></>);
export const ChevronRightIcon = mkIcon('chevron-right', <path d="m9 6 6 6-6 6"/>);
export const ChevronDownIcon  = mkIcon('chevron-down',  <path d="m6 9 6 6 6-6"/>);
export const ChevronLeftIcon  = mkIcon('chevron-left',  <path d="m15 6-6 6 6 6"/>);
export const XIcon         = mkIcon('x',       <path d="m6 6 12 12M6 18 18 6"/>);
export const CheckIcon     = mkIcon('check',   <path d="m5 12 5 5L20 7"/>);
export const PlayIcon      = mkIcon('play',    <path d="m7 5 12 7-12 7V5z"/>);
export const PauseIcon     = mkIcon('pause',   <><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></>);
export const RefreshIcon   = mkIcon('refresh', <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4"/>);
export const SunIcon       = mkIcon('sun',     <><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>);
export const MoonIcon      = mkIcon('moon',    <path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10z"/>);
export const ActivityIcon  = mkIcon('activity',<path d="M3 12h4l3-8 4 16 3-8h4"/>);
export const AlertIcon     = mkIcon('alert',   <><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18v.5"/></>);
export const ServerIcon    = VMIcon;
export const CpuIcon       = mkIcon('cpu',     <><rect x="5" y="5" width="14" height="14" rx="1.5"/><rect x="9" y="9" width="6" height="6"/><path d="M5 9H2M5 15H2M22 9h-3M22 15h-3M9 5V2M15 5V2M9 22v-3M15 22v-3"/></>);
export const DatabaseIcon  = mkIcon('database',<><ellipse cx="12" cy="5" rx="8" ry="2.5"/><path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5M4 11v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6"/></>);
export const NetworkIcon   = mkIcon('network', <><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v3M12 11l-5.5 5.5M12 11l5.5 5.5"/></>);
export const TerminalIcon  = mkIcon('terminal',<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></>);
export const EditIcon      = mkIcon('edit',    <><path d="M5 17v3h3l10-10-3-3L5 17z"/><path d="m14 7 3 3"/></>);
export const TrashIcon     = mkIcon('trash',   <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></>);
export const EyeIcon       = mkIcon('eye',     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>);
export const DownloadIcon  = mkIcon('download',<><path d="M12 3v13M6 12l6 5 6-5M4 21h16"/></>);
export const ExternalIcon  = mkIcon('external',<><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>);
export const MoreIcon      = mkIcon('more',    <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>);
export const ArrowUpIcon   = mkIcon('arrow-up',<><path d="M12 19V5M5 12l7-7 7 7"/></>);
export const KeyIcon       = mkIcon('key',     <><circle cx="8" cy="15" r="4"/><path d="m11 13 9-9M16 7l3 3"/></>);
export const FileIcon      = mkIcon('file',    <><path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5"/></>);
export const ClockIcon     = mkIcon('clock',   <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>);

/** General-purpose Icon dispatcher — matches original Icon component API */
export function Icon({ name, size = 16, stroke = 1.6, className = '', style = {} }: { name: string } & IconProps) {
  const p = { size, stroke, className, style };
  const map: Record<string, React.ComponentType<IconProps>> = {
    dashboard: DashboardIcon, server: VMIcon, plus: PlusIcon, tasks: TasksIcon,
    invoice: InvoiceIcon, bell: BellIcon, mail: MailIcon, users: UsersIcon,
    search: SearchIcon, settings: SettingsIcon, logout: LogoutIcon, lock: LockIcon,
    shield: ShieldIcon, 'chevron-right': ChevronRightIcon, 'chevron-down': ChevronDownIcon,
    'chevron-left': ChevronLeftIcon, x: XIcon, check: CheckIcon, play: PlayIcon,
    pause: PauseIcon, refresh: RefreshIcon, sun: SunIcon, moon: MoonIcon,
    activity: ActivityIcon, alert: AlertIcon, cpu: CpuIcon, database: DatabaseIcon,
    network: NetworkIcon, terminal: TerminalIcon, edit: EditIcon, trash: TrashIcon,
    eye: EyeIcon, download: DownloadIcon, external: ExternalIcon, more: MoreIcon,
    'arrow-up': ArrowUpIcon, key: KeyIcon, file: FileIcon, clock: ClockIcon,
  };
  const Comp = map[name];
  return Comp ? <Comp {...p}/> : null;
}
