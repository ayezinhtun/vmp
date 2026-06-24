// AI Chat widget — floating across all roles, talks to Claude API

import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'

interface Message {
  who: 'user' | 'bot'
  text: string
}

interface AIChatWidgetProps {
  role: string
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ role }) => {
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { who: 'bot', text: `Hi! I'm the VPS Myanmar assistant. How can I help you today?` },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [unread, setUnread] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight)
  }, [messages, open])

  useEffect(() => {
    if (open) setUnread(0)
  }, [open])

  const suggestions = role === 'Customer'
    ? ['How do I request a new VM?', 'How can I renew my VM?', 'Where can I see my invoices?', 'How do I open a support ticket?']
    : role === 'Sales'
      ? ['Show me pending customer requests', 'How do I follow up on a renewal?', 'Where can I see overdue invoices?']
      : role === 'Engineer'
        ? ['How do I provision a new VM?', 'Where is the backup schedule?', 'How do I patch a VM?']
        : role === 'Finance'
          ? ['Show overdue invoices', 'How do I reconcile a payment?', 'Where is the tax report?']
          : ['How does the role system work?', 'Where is the audit log?', 'Show me system health']

  const buildContext = () => {
    const customerCtx = role === 'Customer'
      ? `The current user is a customer (Thiri Ko, Yangon Fintech Group, ID C-1043). They have ${state.vms.filter(v => v.customer === 'C-1043').length} VMs and ${state.invoices.filter(i => i.customer === 'C-1043').length} invoices.`
      : `The current user is on the ${role} team.`
    return `You are the helpful assistant for "VPS Myanmar", a Myanmar-based cloud VPS provider. Be concise (2-4 sentences), warm and professional. ${customerCtx}

Portal layout:
- Customer portal sidebar: Dashboard, Request VM, My VMs, My requests, Invoices, Support tickets, Account
- VM management: customers can Start/Stop/Restart, Snapshot, Renew, Upgrade specs, Change Plan
- Support tickets: customers create with priority, sales responds, both can close
- Admin side: Dashboard, VM records, Provisioning kanban, Customers, KYC review, Finance/Invoices, Reports, Alerts, Team & roles, API keys, System health
- Payment methods: KBZ Pay, AYA Bank, CB Bank, Yoma Bank (MMK currency)
- KYC: required for paid VMs, admin reviews documents

When users ask "how to X", give a 1-2 sentence direction pointing to the right page. Don't include preamble like "Sure, here's how". Don't markdown-format unless listing steps.`
  }

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || pending) return
    setInput('')
    setMessages(m => [...m, { who: 'user', text: msg }])
    setPending(true)

    try {
      const history = messages.slice(-6).map(m => `${m.who === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
      const prompt = `${buildContext()}\n\nConversation so far:\n${history}\n\nUser: ${msg}\n\nReply (keep it short — 2-4 sentences max):`
      const reply = await (window as any).claude.complete(prompt)
      setMessages(m => [...m, { who: 'bot', text: reply.trim() }])
      if (!open) setUnread(u => u + 1)
    } catch (e) {
      setMessages(m => [...m, { who: 'bot', text: `Sorry — I'm having trouble reaching the AI service right now. Please try again in a moment, or contact your account manager.` }])
    } finally {
      setPending(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div data-ai-chat style={{ position: 'fixed', bottom: 24, right: 200, zIndex: 998 }}>
      {open && !minimized && (
        <div style={{
          position: 'absolute',
          bottom: 56, right: 0,
          width: 380, height: 540, maxHeight: '80vh',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'aiIn 0.22s ease-out',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), oklch(0.65 0.18 290))',
              display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 14.5 7 20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="fw-7 text-sm">VPS Assistant</div>
              <div className="text-xs text-mute" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }}/>
                AI · online · {role} mode
              </div>
            </div>
            <button className="icon-btn" onClick={() => setMinimized(true)} title="Minimize"><Icon name="chevron-down" size={14}/></button>
            <button className="icon-btn" onClick={() => setOpen(false)} title="Close"><Icon name="x" size={14}/></button>
          </div>

          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.who === 'user' ? 'flex-end' : 'flex-start',
                animation: 'msgIn 0.2s ease-out',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '9px 12px',
                  background: m.who === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                  color: m.who === 'user' ? 'var(--accent-fg)' : 'var(--ink)',
                  borderRadius: m.who === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  fontSize: 12.5, lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>{m.text}</div>
              </div>
            ))}
            {pending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 14px', background: 'var(--surface-2)',
                  borderRadius: '12px 12px 12px 4px',
                  display: 'flex', gap: 4,
                }}>
                  <span className="ai-dot"/><span className="ai-dot"/><span className="ai-dot"/>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && !pending && (
            <div style={{ padding: '8px 14px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {suggestions.map(s => (
                <button key={s} className="filter-chip" onClick={() => send(s)} style={{ fontSize: 11 }}>{s}</button>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask me anything…"
              disabled={pending}
              style={{
                flex: 1, padding: '8px 12px',
                border: '1px solid var(--line)', borderRadius: 8,
                background: 'var(--surface-2)',
                fontSize: 12.5, outline: 'none',
              }}
            />
            <button className="btn accent" style={{ padding: '7px 11px' }} onClick={() => send()} disabled={!input.trim() || pending}>
              <Icon name="chevron-right" size={13}/>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => { setOpen(true); setMinimized(false) }}
        title="Ask the assistant"
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          background: 'linear-gradient(135deg, var(--accent), oklch(0.6 0.18 290))',
          color: 'white',
          border: 'none', borderRadius: 999,
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
          fontFamily: 'var(--font)', fontWeight: 600, fontSize: 12.5,
          opacity: open && !minimized ? 0 : 1,
          pointerEvents: open && !minimized ? 'none' : 'auto',
          transition: 'opacity 0.2s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 14.5 7 20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1z"/></svg>
        <span>Ask AI</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--bad)', color: 'white',
            fontSize: 10, fontWeight: 700,
            minWidth: 18, height: 18, borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            border: '2px solid var(--bg)',
          }}>{unread}</span>
        )}
      </button>

      <style>{`
        @keyframes aiIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes aiPulse { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        .ai-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink-3); animation: aiPulse 1.2s ease-in-out infinite; }
        .ai-dot:nth-child(2) { animation-delay: 0.15s; }
        .ai-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
    </div>
  )
}

export default AIChatWidget
