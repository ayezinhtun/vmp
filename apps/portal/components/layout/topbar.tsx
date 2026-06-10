'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useWebSocketStatus } from '@/hooks/useWebSocketStatus';
import { BellIcon, SearchIcon, ChevronRightIcon, SunIcon, MoonIcon } from '@/components/layout/icons';
import { useState, useEffect } from 'react';

const CRUMBS: Record<string, string[]> = {
  '/dashboard': ['Customer portal', 'Dashboard'],
  '/vms':       ['Customer portal', 'My VMs'],
  '/deploy':    ['Customer portal', 'Deploy VM'],
  '/requests':  ['Customer portal', 'My requests'],
  '/invoices':  ['Customer portal', 'Invoices'],
  '/tickets':   ['Customer portal', 'Support tickets'],
  '/account':   ['Customer portal', 'Account'],
};

export function Topbar() {
  const pathname  = usePathname();
  const customer  = useAuth(s => s.customer);
  const connected = useWebSocketStatus();
  const [theme, setTheme] = useState<'light'|'dark'>('light');

  // Persist theme to <html class="dark">
  useEffect(() => {
    const stored = localStorage.getItem('vmp-theme') as 'light'|'dark' | null;
    if (stored) { setTheme(stored); document.documentElement.classList.toggle('dark', stored === 'dark'); }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('vmp-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  // Find matching crumb entry
  const crumbs = Object.entries(CRUMBS).find(([k]) => pathname === k || (k !== '/' && pathname.startsWith(k)))?.[1]
    ?? ['Customer portal', pathname.split('/').pop() ?? ''];

  return (
    <div className="topbar">
      {/* Breadcrumbs */}
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <ChevronRightIcon size={12} className="sep"/>}
            {i === crumbs.length - 1 ? <strong>{c}</strong> : <span>{c}</span>}
          </span>
        ))}
      </div>

      <div className="topbar-spacer"/>

      {/* Search */}
      <div className="search">
        <SearchIcon size={14} className="search-icon"/>
        <input placeholder="Search VMs, invoices, tickets…" readOnly style={{ cursor: 'pointer' }}/>
        <span className="kbd">⌘K</span>
      </div>

      {/* WebSocket live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: connected ? 'var(--ok)' : 'var(--warn)',
          animation: connected ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
        }}/>
        <span style={{ color: connected ? 'var(--ok)' : 'var(--warn)', fontWeight: 600 }}>
          {connected ? 'Live' : 'Reconnecting…'}
        </span>
      </div>

      {/* Company / ID */}
      {customer && (
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
          {customer.company} · <span style={{ fontFamily: 'var(--mono)' }}>{customer.id?.slice(-6)}</span>
        </div>
      )}

      {/* Theme toggle */}
      <button className="icon-btn" onClick={toggleTheme} title="Toggle dark mode">
        {theme === 'dark' ? <SunIcon size={15}/> : <MoonIcon size={15}/>}
      </button>

      {/* Notifications */}
      <button className="icon-btn" title="Notifications">
        <BellIcon size={15}/>
        {/* dot shows if unread */}
      </button>
    </div>
  );
}
