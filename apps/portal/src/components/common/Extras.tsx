// Command palette (⌘K), keyboard shortcuts overlay, calendar of expiries

import React, { useState, useEffect, useRef } from 'react'
import useVMStore from '../../store/vmStore'
import useCustomerStore from '../../store/customerStore'
import useInvoiceStore from '../../store/invoiceStore'
import Icon from '../../lib/icons'
import { formatMMK, StatusPill } from '../ui/ui'

interface CommandPaletteProps {
  onClose: () => void
  setView: (view: string) => void
  openVM: (id: string) => void
  openCust: (id: string) => void
  openModal: (modal: string, data?: any) => void
}

interface CommandItem {
  type: string
  label: string
  sub?: string
  action: () => void
  icon: string
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, setView, openVM, openCust, openModal }) => {
  const { vms } = useVMStore()
  const { customers } = useCustomerStore()
  const { invoices } = useInvoiceStore()
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => { inputRef.current?.focus() }, [])

  const items: CommandItem[] = [
    ...vms.map((v: any) => ({ type: 'VM', label: v.name, sub: `${v.id} · ${customers.find((c: any) => c.id === v.customer)?.company}`, action: () => { openVM(v.id); onClose() }, icon: 'server' })),
    ...customers.map((c: any) => ({ type: 'Customer', label: c.company, sub: `${c.name} · ${c.id}`, action: () => { openCust(c.id); onClose() }, icon: 'building' })),
    ...invoices.map((i: any) => ({ type: 'Invoice', label: i.id, sub: `MMK ${formatMMK(i.amount)} · ${customers.find((c: any) => c.id === i.customer)?.company}`, action: () => { setView('finance'); onClose() }, icon: 'invoice' })),
    { type: 'Action', label: 'New VM', sub: 'Start provisioning wizard', action: () => { openModal('newvm'); onClose() }, icon: 'plus' },
    { type: 'Action', label: 'New customer', sub: 'Add a new customer account', action: () => { openModal('newcust'); onClose() }, icon: 'plus' },
    { type: 'Action', label: 'New task', sub: 'Create provisioning task', action: () => { openModal('newtask'); onClose() }, icon: 'plus' },
    { type: 'Action', label: 'Compose email', sub: 'Open the email composer', action: () => { openModal('email'); onClose() }, icon: 'mail' },
    { type: 'Navigate', label: 'Dashboard', action: () => { setView('dashboard'); onClose() }, icon: 'dashboard' },
    { type: 'Navigate', label: 'VM records', action: () => { setView('vms'); onClose() }, icon: 'server' },
    { type: 'Navigate', label: 'Provisioning', action: () => { setView('tasks'); onClose() }, icon: 'tasks' },
    { type: 'Navigate', label: 'Calendar', action: () => { setView('calendar'); onClose() }, icon: 'clock' },
    { type: 'Navigate', label: 'Customers', action: () => { setView('customers'); onClose() }, icon: 'users' },
    { type: 'Navigate', label: 'KYC review', action: () => { setView('kyc'); onClose() }, icon: 'shield' },
    { type: 'Navigate', label: 'Invoices', action: () => { setView('finance'); onClose() }, icon: 'invoice' },
    { type: 'Navigate', label: 'Reports', action: () => { setView('reports'); onClose() }, icon: 'box' },
    { type: 'Navigate', label: 'Alerts', action: () => { setView('alerts'); onClose() }, icon: 'bell' },
    { type: 'Navigate', label: 'Activity log', action: () => { setView('activity'); onClose() }, icon: 'activity' },
    { type: 'Navigate', label: 'Network & IPs', action: () => { setView('network'); onClose() }, icon: 'network' },
    { type: 'Navigate', label: 'Team & roles', action: () => { setView('team'); onClose() }, icon: 'lock' },
    { type: 'Navigate', label: 'System settings', action: () => { setView('settings'); onClose() }, icon: 'settings' },
  ]

  const filtered = q
    ? items.filter(i => [i.label, i.sub || '', i.type].join(' ').toLowerCase().includes(q.toLowerCase())).slice(0, 12)
    : items.filter(i => i.type === 'Action' || i.type === 'Navigate').slice(0, 10)

  const [selected, setSelected] = useState(0)
  useEffect(() => { setSelected(0) }, [q])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(filtered.length - 1, s + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(0, s - 1)) }
    if (e.key === 'Enter') { e.preventDefault(); filtered[selected]?.action() }
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 100 }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 600,
        background: 'var(--surface)', borderRadius: 12,
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="search" size={16} className="text-mute"/>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search VMs, customers, invoices, or jump to a page…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--ink)' }}
          />
          <span className="kbd" style={{ position: 'static', transform: 'none' }}>esc</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {filtered.length === 0 && <div className="empty"><div className="sub">No matches.</div></div>}
          {filtered.map((it, i) => (
            <div key={i}
              onMouseEnter={() => setSelected(i)}
              onClick={it.action}
              style={{
                padding: '10px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
                background: selected === i ? 'var(--surface-3)' : 'transparent',
              }}
            >
              <div style={{ width: 26, height: 26, background: 'var(--surface-3)', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                <Icon name={it.icon} size={14}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fw-6 text-sm">{it.label}</div>
                {it.sub && <div className="text-xs text-mute" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.sub}</div>}
              </div>
              <span className="pill subtle" style={{ fontSize: 10 }}>{it.type}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 18px', borderTop: '1px solid var(--line)', display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-3)' }}>
          <span><span className="kbd" style={{ position: 'static', transform: 'none' }}>↑↓</span> navigate</span>
          <span><span className="kbd" style={{ position: 'static', transform: 'none' }}>↵</span> select</span>
          <div style={{ flex: 1 }}/>
          <span><span className="kbd" style={{ position: 'static', transform: 'none' }}>⌘K</span> open anywhere</span>
        </div>
      </div>
    </div>
  )
}

// ── Keyboard shortcuts overlay ────────────────────────────────────────────
interface ShortcutsModalProps {
  onClose: () => void
}

const Modal: React.FC<{ title: string; onClose: () => void; size?: number; children: React.ReactNode }> = ({ title, onClose, size = 520, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: size }}>
      <div className="modal-head">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
)

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => (
  <Modal title="Keyboard shortcuts" onClose={onClose} size={520}>
    <div className="grid-2" style={{ gap: 18 }}>
      {[
        { sec: 'Navigation', items: [['⌘K', 'Command palette'], ['G then D', 'Go to dashboard'], ['G then V', 'Go to VMs'], ['G then C', 'Go to customers'], ['G then T', 'Go to tasks'], ['G then F', 'Go to invoices']] },
        { sec: 'Actions', items: [['N then V', 'New VM'], ['N then C', 'New customer'], ['N then T', 'New task'], ['N then I', 'New invoice'], ['?', 'Show this panel'], ['Esc', 'Close panel/modal']] },
      ].map(g => (
        <div key={g.sec}>
          <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{g.sec}</div>
          <div className="flex col gap-2">
            {g.items.map(([k, l]) => (
              <div key={k} className="flex center between">
                <span className="text-sm">{l}</span>
                <span style={{ display: 'flex', gap: 3 }}>
                  {k.split(' ').map((kk, i) => (
                    <span key={i} className="kbd" style={{ position: 'static', transform: 'none' }}>{kk}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Modal>
)

// ── Calendar view of expiries ─────────────────────────────────────────────
interface CalendarViewProps {
  openVM: (id: string) => void
}

const CalendarView: React.FC<CalendarViewProps> = ({ openVM }) => {
  const { vms } = useVMStore()
  const { customers } = useCustomerStore()
  const today: Date = (window as any).MOCK.TODAY
  const [monthOffset, setMonthOffset] = useState(0)
  const base = new Date(today)
  base.setDate(1)
  base.setMonth(base.getMonth() + monthOffset)

  const monthName = base.toLocaleString('en', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
  const firstDay = base.getDay()

  const byDate: Record<number, any[]> = {}
  vms.forEach((v: any) => {
    if (!v.expiry || v.expiry === '—') return
    const d = new Date(v.expiry)
    if (d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear()) {
      const key = d.getDate()
      ;(byDate[key] = byDate[key] || []).push(v)
    }
  })

  const monthVMs = vms.filter((v: any) => {
    if (!v.expiry || v.expiry === '—') return false
    const d = new Date(v.expiry)
    return d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear()
  })
  const monthRevenue = monthVMs.reduce((a, v) => a + v.priceMonth * 12, 0)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Expiry calendar</h1>
          <p className="page-subtitle">{monthVMs.length} VMs expiring this month · MMK {formatMMK(monthRevenue)} renewal value</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setMonthOffset(monthOffset - 1)}><Icon name="chevron-left" size={12}/></button>
          <span className="fw-6" style={{ minWidth: 140, textAlign: 'center' }}>{monthName}</span>
          <button className="btn" onClick={() => setMonthOffset(monthOffset + 1)}><Icon name="chevron-right" size={12}/></button>
          <button className="btn" onClick={() => setMonthOffset(0)}>Today</button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '110px' }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`pad-${i}`} style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}/>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = base.getMonth() === today.getMonth() && base.getFullYear() === today.getFullYear() && day === today.getDate()
            const vms = byDate[day] || []
            return (
              <div key={day} style={{
                borderRight: (i + firstDay + 1) % 7 === 0 ? 'none' : '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                padding: 6,
                display: 'flex', flexDirection: 'column', gap: 3,
                background: isToday ? 'var(--accent-soft)' : 'transparent',
                overflow: 'hidden',
              }}>
                <div className="text-xs fw-6" style={{ color: isToday ? 'var(--accent-strong)' : 'var(--ink-3)' }}>{day}</div>
                {vms.slice(0, 3).map(v => {
                  const diffDays = v.expiry ? Math.ceil((new Date(v.expiry).getTime() - today.getTime()) / 86400000) : 0
                  const sev = diffDays < 0 ? 'bad' : diffDays <= 7 ? 'warn' : 'accent'
                  return (
                    <div key={v.id} onClick={() => openVM(v.id)} style={{
                      padding: '2px 6px',
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 600,
                      background: `var(--${sev === 'bad' ? 'bad' : sev === 'warn' ? 'warn' : 'accent'}-soft)`,
                      color: sev === 'bad' ? 'var(--bad)' : sev === 'warn' ? 'oklch(0.45 0.13 75)' : 'var(--accent-strong)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{v.name}</div>
                  )
                })}
                {vms.length > 3 && <div className="text-xs text-mute">+{vms.length - 3} more</div>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 card">
        <div className="card-head"><h3 className="card-title">This month's renewals</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Date</th><th>VM</th><th>Customer</th><th className="right">Renewal value (1y)</th><th>Status</th></tr></thead>
            <tbody>
              {monthVMs.sort((a, b) => new Date(a.expiry || '').getTime() - new Date(b.expiry || '').getTime()).map((v: any) => {
                const c = customers.find((c: any) => c.id === v.customer)
                return (
                  <tr key={v.id} onClick={() => openVM(v.id)}>
                    <td className="tnum text-sm">{v.expiry}</td>
                    <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                    <td className="text-sm">{c?.company}</td>
                    <td className="right tnum fw-6">MMK {formatMMK(v.priceMonth * 12)}</td>
                    <td><StatusPill status={v.status}/></td>
                  </tr>
                )
              })}
              {monthVMs.length === 0 && <tr><td colSpan={5}><div className="empty"><div className="sub">No renewals this month.</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export { CommandPalette, ShortcutsModal, CalendarView }
