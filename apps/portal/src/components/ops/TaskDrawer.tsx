import React, { useState } from 'react'
import useTaskStore from '../../store/taskStore'
import useCustomerStore from '../../store/customerStore'
import useTeamStore from '../../store/teamStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { StatusPill } from '../ui/ui'

interface TaskDrawerProps {
  taskId: string
  onClose: () => void
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ taskId, onClose }) => {
  const { tasks, updateTask, advanceProvision } = useTaskStore()
  const { customers } = useCustomerStore()
  const { team } = useTeamStore()
  const { toast } = useUIStore()
  const t = tasks.find((x: any) => x.id === taskId)
  if (!t) return null
  const c = customers.find((cust: any) => cust.id === t.customer)

  const [salesData, setSalesData] = useState({
    assignee: t.assignee || '—',
    priority: t.priority || 'Normal',
    status: t.status,
    salesNotes: (t as any).salesNotes || '',
    eta: (t as any).eta || '',
    internalNotes: (t as any).internalNotes || '',
  })

  // Parse customer-submitted notes block
  const customerNotes = (t.notes || '').split('\n').filter(Boolean)
  const meta: Record<string, string> = {}
  customerNotes.forEach(l => {
    const m = l.match(/^(\w[\w\s]*?):\s*(.+)$/)
    if (m) meta[m[1].trim()] = m[2].trim()
  })

  const save = () => {
    updateTask(t.id, salesData)
    toast(`${t.id} updated · customer notified`, 'ok')
  }

  const isCustomerSubmitted = (t.notes || '').includes('Customer-initiated')

  const WF = [
    { label: 'Submitted', team: 'Customer', icon: 'mail', desc: 'Request received via portal' },
    { label: 'Sales review & KYC', team: 'Sales', icon: 'shield', desc: 'Verify customer & documents' },
    { label: 'KYC approved → notify Eng', team: 'VPS Portal', icon: 'check', desc: 'Provisioning task created' },
    { label: 'System: provision VM', team: 'Engineering', icon: 'server', desc: 'Build VM per specs' },
    { label: 'Network: firewall rules', team: 'Network', icon: 'shield', desc: 'Configure firewall & ports' },
    { label: 'KT: test & credentials', team: 'Engineering', icon: 'key', desc: 'Test VM, upload credentials' },
    { label: 'VM Ready ✓', team: 'Customer', icon: 'check', desc: 'Customer notified & can access' },
  ]
  const wfStage = (t as any).wfStage || 0

  const teamColor: Record<string, string> = {
    Customer: 'var(--info)',
    Sales: 'oklch(0.6 0.16 30)',
    'VPS Portal': 'var(--accent)',
    Engineering: 'var(--ok)',
    Network: 'oklch(0.55 0.17 285)'
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: 'min(860px, 95vw)' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="flex center between mb-2">
            <div className="flex center gap-2">
              <span className="mono text-sm text-mute">{t.id}</span>
              {isCustomerSubmitted && <span className="pill accent"><span className="dot"/>Customer-submitted</span>}
            </div>
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.title}</h2>
          <div className="flex gap-2 mt-2">
            <StatusPill status={salesData.status}/>
            <span className="pill subtle">{t.type}</span>
            <span className={`pill ${salesData.priority === 'Urgent' ? 'bad' : 'subtle'}`}>{salesData.priority}</span>
            <span className="pill subtle"><Icon name="building" size={10}/>{c?.company}</span>
            <span className="pill subtle">Created {t.created}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {/* Workflow stage tracker */}
          {(isCustomerSubmitted || t.type === 'New') && (
            <div className="card mb-4">
              <div className="card-head">
                <h3 className="card-title">Provisioning workflow</h3>
                <span className="pill accent"><span className="dot"/>Step {Math.min(wfStage + 1, WF.length)} of {WF.length}</span>
              </div>
              <div className="card-body">
                <div className="flex col gap-2">
                  {WF.map((w, i) => {
                    const active = i === wfStage
                    const color = teamColor[w.team] || 'var(--ink-3)'
                    return (
                      <div key={w.label} className="flex center gap-3" style={{ opacity: i <= wfStage ? 1 : 0.4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < wfStage ? 'var(--ok)' : i === wfStage ? 'var(--accent)' : 'var(--surface-3)', color: i <= wfStage ? '#fff' : 'var(--ink-3)', display: 'grid', placeItems: 'center', fontSize: 11 }}>
                          {i < wfStage ? <Icon name="check" size={11}/> : <Icon name={w.icon} size={11}/>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="flex center gap-2">
                            <div className="fw-6 text-sm">{w.label}</div>
                            <span className="pill subtle" style={{ fontSize: 9.5, background: `${color}1a`, color }}>{w.team}</span>
                            {active && <span className="pill warn" style={{ fontSize: 9.5 }}>Current</span>}
                          </div>
                          <div className="text-xs text-mute mt-1">{w.desc}</div>
                          {active && i > 0 && (
                            <button className="btn sm accent mt-2" onClick={() => advanceProvision(t.id)}>
                              <Icon name="check" size={11}/>
                              {i === WF.length - 1 ? 'Complete — notify customer' : `Mark done → ${WF[i + 1].team}`}
                            </button>
                          )}
                          {active && i === 0 && (
                            <button className="btn sm accent mt-2" onClick={() => advanceProvision(t.id)}>
                              <Icon name="play" size={11}/>Start Sales review
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Customer info card */}
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Customer info</h3></div>
            <div className="card-body">
              <div className="grid-2" style={{ gap: 16 }}>
                <div>
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Customer</div>
                  <dl className="dl">
                    <dt>Customer</dt><dd>{c?.company}</dd>
                    <dt>Contact</dt><dd>{c?.name}</dd>
                    <dt>Email</dt><dd className="mono text-sm">{c?.email}</dd>
                  </dl>
                </div>
                <div>
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Request type</div>
                  <dl className="dl">
                    <dt>Type</dt><dd>{t.type}</dd>
                    <dt>Subscription</dt><dd>{(t as any).subscription || '—'}</dd>
                    <dt>Submitted</dt><dd className="tnum">{t.created}</dd>
                  </dl>
                </div>
              </div>
              {Object.keys(meta).length > 0 && (
                <>
                  <div className="divider"/>
                  <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Configuration submitted by customer</div>
                  <dl className="dl">
                    {Object.entries(meta).map(([k, v]) => (
                      <React.Fragment key={k}>
                        <dt>{k}</dt>
                        <dd>
                          <input
                            value={v}
                            disabled
                            readOnly
                            style={{
                              width: '100%', padding: '4px 8px',
                              border: '1px solid var(--line)', borderRadius: 4,
                              background: 'var(--surface-3)', color: 'var(--ink-2)',
                              fontFamily: /Hostname|Spec|OS|Plan/i.test(k) ? 'var(--mono)' : 'inherit',
                              fontSize: 12, cursor: 'not-allowed',
                            }}
                          />
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </>
              )}
            </div>
          </div>

          {/* Sales workspace */}
          <div className="card mb-4">
            <div className="card-head">
              <h3 className="card-title">Sales workspace</h3>
              <button className="btn sm accent" onClick={save}><Icon name="check" size={11}/>Save changes</button>
            </div>
            <div className="card-body">
              <div className="flex col gap-3">
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Assigned person</label>
                    <select value={salesData.assignee} onChange={e => setSalesData({ ...salesData, assignee: e.target.value })}>
                      <option value="—">— Unassigned —</option>
                      {team.map((m: any) => <option key={m.id} value={m.name}>{m.name} · {m.role}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Priority</label>
                    <div className="flex gap-2">
                      {['Low', 'Normal', 'Urgent'].map(p => (
                        <button key={p}
                          className={`filter-chip ${salesData.priority === p ? 'active' : ''}`}
                          onClick={() => setSalesData({ ...salesData, priority: p })}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>Status</label>
                  <div className="flex gap-2 wrap">
                    {['Pending', 'In Progress', 'Blocked', 'Done'].map(s => (
                      <button key={s}
                        className={`filter-chip ${salesData.status === s ? 'active' : ''}`}
                        onClick={() => setSalesData({ ...salesData, status: s })}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Quote / ETA</label>
                    <input value={salesData.eta} onChange={e => setSalesData({ ...salesData, eta: e.target.value })} placeholder="e.g. MMK 540,000 · ready by 31 May"/>
                  </div>
                  <div className="field">
                    <label>Customer-facing notes</label>
                    <input value={salesData.salesNotes} onChange={e => setSalesData({ ...salesData, salesNotes: e.target.value })} placeholder="Will be shown to customer"/>
                  </div>
                </div>
                <div className="field">
                  <label>Internal notes (not visible to customer)</label>
                  <textarea rows={3} value={salesData.internalNotes} onChange={e => setSalesData({ ...salesData, internalNotes: e.target.value })} placeholder="Migration risks, pricing context, engineering hand-off…"/>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-head"><h3 className="card-title">Quick actions</h3></div>
            <div className="card-body">
              <div className="flex gap-2 wrap">
                <button className="btn" onClick={() => toast(`Email sent to ${c?.email}`, 'ok')}><Icon name="mail" size={12}/>Email customer</button>
                <button className="btn" onClick={() => toast('Quote PDF generated', 'ok')}><Icon name="invoice" size={12}/>Generate quote</button>
                <button className="btn" onClick={() => { setSalesData({ ...salesData, status: 'In Progress' }); updateTask(t.id, { status: 'In Progress' }); toast('Task moved to In Progress', 'info'); }}><Icon name="play" size={12}/>Start work</button>
                <button className="btn" onClick={() => toast('Customer notified — request needs more info', 'warn')}><Icon name="alert" size={12}/>Request more info</button>
                <button className="btn accent" onClick={() => { updateTask(t.id, { status: 'Done' }); toast('Marked done · customer notified', 'ok'); }}><Icon name="check" size={12}/>Mark done</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
