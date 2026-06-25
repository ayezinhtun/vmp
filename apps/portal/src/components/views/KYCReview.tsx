// KYC Review — dedicated view for reviewing customer KYC submissions

import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { Avatar, StatusPill } from '../../lib/ui'

export const KYCReviewView: React.FC = () => {
  const { state, setKYC, toast } = useStore()
  const [tab, setTab] = useState('Pending')
  const [selected, setSelected] = useState<any>(null)
  const [note, setNote] = useState('')

  const pending = state.customers.filter((c: any) => c.kyc === 'Pending')
  const approved = state.customers.filter((c: any) => c.kyc === 'Approved')
  const rejected = state.customers.filter((c: any) => c.kyc === 'Rejected')

  const list = tab === 'Pending' ? pending : tab === 'Approved' ? approved : tab === 'Rejected' ? rejected : state.customers

  // auto-select first pending on first render
  useEffect(() => {
    if (!selected && list.length) setSelected(list[0])
    if (selected && !list.find((c: any) => c.id === selected.id)) setSelected(list[0] || null)
  }, [tab, list.length])

  const sel = selected ? state.customers.find((c: any) => c.id === selected.id) : null

  const decide = (id: string, decision: string) => {
    setKYC(id, decision)
    setNote('')
    toast(`KYC ${decision.toLowerCase()}`, decision === 'Approved' ? 'ok' : 'warn')
  }

  const docs = [
    { name: 'NRC — front', sub: 'PDF · 2.4 MB', tone: 'oklch(0.6 0.16 30)' },
    { name: 'NRC — back', sub: 'PDF · 2.1 MB', tone: 'oklch(0.55 0.16 230)' },
    { name: 'Company registration', sub: 'PDF · 1.1 MB', tone: 'oklch(0.55 0.17 285)' },
    { name: 'Director ID / selfie', sub: 'JPG · 840 KB', tone: 'var(--ok)' },
  ]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">KYC review</h1>
          <p className="page-subtitle">{pending.length} awaiting review · avg. response time 4.2 hours · {approved.length} approved this period</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('KYC report exported', 'info')}><Icon name="download" size={13}/>Export</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-4">
        {[
          { label: 'Awaiting review', value: pending.length, color: 'oklch(0.55 0.16 75)', icon: 'clock' },
          { label: 'Approved', value: approved.length, color: 'var(--ok)', icon: 'check' },
          { label: 'Rejected', value: rejected.length, color: 'var(--bad)', icon: 'x' },
          { label: 'Total customers', value: state.customers.length, color: 'var(--accent)', icon: 'users' },
        ].map(s => (
          <div key={s.label} className="metric">
            <div className="label flex center gap-2">
              <span style={{ width: 24, height: 24, borderRadius: 7, background: `${s.color}1a`, color: s.color, display: 'grid', placeItems: 'center' }}><Icon name={s.icon} size={13}/></span>
              {s.label}
            </div>
            <div className="value tnum" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-asym" style={{ alignItems: 'flex-start' }}>
        {/* Master list */}
        <div className="card">
          <div className="tabs">
            {['Pending', 'Approved', 'Rejected'].map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}<span className="count">{t === 'Pending' ? pending.length : t === 'Approved' ? approved.length : rejected.length}</span>
              </button>
            ))}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {list.map((c: any) => (
              <div key={c.id} onClick={() => setSelected(c)} style={{
                padding: '14px 18px', borderBottom: '1px solid var(--line)',
                display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer',
                background: sel?.id === c.id ? 'var(--accent-soft)' : 'transparent',
                transition: 'background 0.12s',
              }}>
                <Avatar name={c.name} size={38}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fw-6 text-sm">{c.name}</div>
                  <div className="text-xs text-mute" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company} · {c.id}</div>
                </div>
                <StatusPill status={c.kyc}/>
              </div>
            ))}
            {list.length === 0 && <div className="empty"><div className="title">All caught up</div><div className="sub">No {tab.toLowerCase()} submissions.</div></div>}
          </div>
        </div>

        {/* Detail / review panel */}
        <div className="card" style={{ position: 'sticky', top: 16 }}>
          {sel ? (
            <>
              <div className="card-head">
                <h3 className="card-title">Review submission</h3>
                <StatusPill status={sel.kyc}/>
              </div>
              <div className="card-body">
                {/* Applicant */}
                <div className="flex center gap-3 mb-3">
                  <Avatar name={sel.name} size={46}/>
                  <div style={{ flex: 1 }}>
                    <div className="fw-7" style={{ fontSize: 15 }}>{sel.name}</div>
                    <div className="text-xs text-mute">{sel.company}</div>
                  </div>
                </div>
                <dl className="dl">
                  <dt>Customer ID</dt><dd className="mono">{sel.id}</dd>
                  <dt>Email</dt><dd className="text-sm">{sel.email}</dd>
                  <dt>Phone</dt><dd className="mono text-sm">{sel.phone}</dd>
                  <dt>Type</dt><dd>{['Co','Ltd','Group','Holdings'].some((w: string) => (sel.company || '').includes(w)) ? 'Organization' : 'Individual'}</dd>
                  <dt>Submitted</dt><dd className="tnum">{sel.since}</dd>
                </dl>

                <div className="divider"/>
                <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Submitted documents</div>
                <div className="grid-2" style={{ gap: 8 }}>
                  {docs.map(d => (
                    <div key={d.name} onClick={() => toast(`Opening ${d.name}…`, 'info')} style={{
                      border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    }}>
                      <div style={{ height: 56, background: `${d.tone}14`, display: 'grid', placeItems: 'center', color: d.tone }}>
                        <Icon name="file" size={20}/>
                      </div>
                      <div style={{ padding: '7px 9px' }}>
                        <div className="fw-6" style={{ fontSize: 11.5 }}>{d.name}</div>
                        <div className="text-xs text-mute">{d.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {sel.kyc === 'Pending' && (
                  <>
                    <div className="divider"/>
                    <div className="field">
                      <label>Reviewer note</label>
                      <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note recorded with your decision…"/>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="btn accent" style={{ flex: 1 }} onClick={() => decide(sel.id, 'Approved')}><Icon name="check" size={12}/>Approve</button>
                      <button className="btn" onClick={() => { toast(`Re-upload requested from ${sel.email}`, 'info'); setNote(''); }}><Icon name="refresh" size={12}/>Re-upload</button>
                      <button className="btn danger" onClick={() => decide(sel.id, 'Rejected')}><Icon name="x" size={12}/>Reject</button>
                    </div>
                  </>
                )}
                {sel.kyc !== 'Pending' && (
                  <>
                    <div className="divider"/>
                    <div>KYC <strong>{sel.kyc.toLowerCase()}</strong> · reviewed by Min Khant</div>
                    {sel.kyc === 'Approved' && <button className="btn" style={{ flex: 1, marginTop: 12 }} onClick={() => decide(sel.id, 'Pending')}><Icon name="refresh" size={12}/>Re-open review</button>}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="card-body">
              <div className="empty"><div className="sub">Select a customer to review</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
