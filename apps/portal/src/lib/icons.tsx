import React from 'react'

interface IconProps {
  name: string
  size?: number
  stroke?: number
  className?: string
  style?: React.CSSProperties
}

// Tiny inline SVG icons — stroke style, 16px default
const Icon: React.FC<IconProps> = ({ name, size = 16, stroke = 1.6, className = '', style = {} }) => {
  const props: React.SVGProps<SVGSVGElement> = {
    width: size, height: size,
    viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className, style,
  }
  switch (name) {
    case 'dashboard': return <svg {...props}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
    case 'server': return <svg {...props}><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><circle cx="7" cy="7.5" r=".6" fill="currentColor"/><circle cx="7" cy="16.5" r=".6" fill="currentColor"/></svg>
    case 'tasks': return <svg {...props}><rect x="3" y="5" width="6" height="14" rx="1.5"/><rect x="11" y="5" width="6" height="9" rx="1.5"/><path d="M19 5h2v6"/></svg>
    case 'users': return <svg {...props}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.5.3 4.5 1.8 5 5"/></svg>
    case 'invoice': return <svg {...props}><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>
    case 'bell': return <svg {...props}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 14.5c.4-.2.6-.6.6-1V10.5c0-.4-.2-.8-.6-1l-1.6-.6-1-2.4.7-1.6c.2-.4.1-.8-.2-1l-1.8-1.8c-.3-.3-.7-.4-1-.2l-1.6.7-2.4-1L9.5 1c-.2-.4-.6-.6-1-.6H5.5"/></svg>
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case 'plus': return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>
    case 'filter': return <svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></svg>
    case 'download': return <svg {...props}><path d="M12 3v13M6 12l6 5 6-5M4 21h16"/></svg>
    case 'check': return <svg {...props}><path d="m5 12 5 5L20 7"/></svg>
    case 'x': return <svg {...props}><path d="m6 6 12 12M6 18 18 6"/></svg>
    case 'chevron-right': return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>
    case 'chevron-down': return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>
    case 'chevron-left': return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>
    case 'more': return <svg {...props}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>
    case 'lock': return <svg {...props}><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
    case 'shield': return <svg {...props}><path d="M12 3 4 6v6c0 4 3.5 7.5 8 9 4.5-1.5 8-5 8-9V6l-8-3z"/><path d="l8.5 12 2.5 2.5L16 10"/></svg>
    case 'globe': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
    case 'network': return <svg {...props}><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v3M12 11l-5.5 5.5M12 11l5.5 5.5"/></svg>
    case 'database': return <svg {...props}><ellipse cx="12" cy="5" rx="8" ry="2.5"/><path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5M4 11v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6"/></svg>
    case 'activity': return <svg {...props}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
    case 'alert': return <svg {...props}><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18v.5"/></svg>
    case 'mail': return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 6 9-6"/></svg>
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'key': return <svg {...props}><circle cx="8" cy="15" r="4"/><path d="m11 13 9-9M16 7l3 3"/></svg>
    case 'cpu': return <svg {...props}><rect x="5" y="5" width="14" height="14" rx="1.5"/><rect x="9" y="9" width="6" height="6"/><path d="M5 9H2M5 15H2M22 9h-3M22 15h-3M9 5V2M15 5V2M9 22v-3M15 22v-3"/></svg>
    case 'box': return <svg {...props}><path d="m3 7 9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></svg>
    case 'edit': return <svg {...props}><path d="M5 17v3h3l10-10-3-3L5 17z"/><path d="m14 7 3 3"/></svg>
    case 'trash': return <svg {...props}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg>
    case 'play': return <svg {...props}><path d="m7 5 12 7-12 7V5z"/></svg>
    case 'pause': return <svg {...props}><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
    case 'refresh': return <svg {...props}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4"/></svg>
    case 'arrow-up': return <svg {...props}><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    case 'arrow-down': return <svg {...props}><path d="M12 5v14M5 12l7 7 7-7"/></svg>
    case 'external': return <svg {...props}><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>
    case 'menu': return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    case 'eye': return <svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'logout': return <svg {...props}><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 17l5-5-5-5M21 12H9"/></svg>
    case 'file': return <svg {...props}><path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5"/></svg>
    case 'attach': return <svg {...props}><path d="m21 12-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/></svg>
    case 'building': return <svg {...props}><rect x="4" y="3" width="16" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>
    case 'sliders': return <svg {...props}><path d="M4 6h11M19 6h1M4 12h6M14 12h6M4 18h14M18 18h2"/><circle cx="17" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg>
    case 'terminal': return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></svg>
    case 'sun': return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>
    case 'moon': return <svg {...props}><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10z"/></svg>
    default: return null
  }
}

export default Icon
