import React from 'react'
import Icon from '../../lib/icons'
import { Bars } from '../ui/ui'

export const InfoCard: React.FC<{ icon: string; title: string; rows: [string, string][]; mono?: boolean }> = ({ icon, title, rows, mono }) => (
  <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)' }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center' }}>
        <Icon name={icon} size={13}/>
      </div>
      <span className="fw-7 text-sm">{title}</span>
    </div>
    <div style={{ padding: '6px 16px' }}>
      {rows.map(([k, v], i) => {
        const empty = v === undefined || v === null || v === '' || v === '—'
        return (
          <div key={i} className="flex center between" style={{ padding: '9px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span className="text-sm text-mute">{k}</span>
            <span className={`text-sm fw-6 ${mono && !empty ? 'mono' : ''}`} style={{ textAlign: 'right', color: empty ? 'var(--ink-4)' : undefined }}>
              {empty ? 'Not provisioned yet' : v}
            </span>
          </div>
        )
      })}
    </div>
  </div>
)

export const UsageCard: React.FC<{ label: string; value: string; data: number[]; color?: string; sub?: string }> = ({ label, value, data, color, sub }) => (
  <div className="metric">
    <div className="label">{label}</div>
    <div className="flex center between">
      <div className="value tnum" style={{ fontSize: 20 }}>{value}</div>
    </div>
    <div className="mt-2">
      <Bars data={data} color={color} height={26}/>
    </div>
    {sub && <div className="trend">{sub}</div>}
  </div>
)

export const UsageDetailCard: React.FC<{ label: string; data: number[]; color?: string; unit: string; avg: number; peak: number }> = ({ label, data, color, unit, avg, peak }) => (
  <div className="card" style={{ borderColor: 'var(--line)' }}>
    <div className="card-body">
      <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label} · last 24h</div>
      <Bars data={data} color={color} height={80}/>
      <div className="grid-2 mt-3" style={{ gap: 12 }}>
        <div><div className="text-xs text-mute">Average</div><div className="tnum fw-6">{avg}{unit}</div></div>
        <div><div className="text-xs text-mute">Peak</div><div className="tnum fw-6">{peak}{unit}</div></div>
      </div>
    </div>
  </div>
)

export const IaaSCard: React.FC<{ children: React.ReactNode; selected: boolean; onClick: () => void; padding?: number }> = ({ children, selected, onClick, padding = 14 }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      textAlign: 'left',
      padding,
      background: selected ? 'var(--accent-soft)' : 'var(--surface)',
      border: '1.5px solid',
      borderColor: selected ? 'var(--accent)' : 'var(--line)',
      borderRadius: 10,
      cursor: 'pointer',
      transition: 'border-color 0.15s, background 0.15s, transform 0.05s',
      fontFamily: 'inherit',
      color: 'var(--ink)',
      boxShadow: selected ? '0 0 0 3px var(--accent-soft)' : 'none',
      width: '100%',
    }}
  >
    {children}
  </button>
)

export const SpecPill: React.FC<{ icon: string; value: number; unit: string }> = ({ icon, value, unit }) => (
  <div style={{ flex: 1, padding: '8px 6px', background: 'var(--surface-2)', borderRadius: 8, textAlign: 'center' }}>
    <Icon name={icon} size={13} className="text-mute"/>
    <div className="tnum fw-7" style={{ fontSize: 15, marginTop: 2 }}>{value}</div>
    <div className="text-xs text-mute">{unit}</div>
  </div>
)

export const SpecStepper: React.FC<{ label: string; icon: string; steps: number[]; value: number; unit: string; onChange: (v: number) => void }> = ({ label, icon, steps, value, unit, onChange }) => (
  <div>
    <div className="flex center between mb-2">
      <span className="fw-6 text-sm flex center gap-2"><Icon name={icon} size={13}/>{label}</span>
      <span className="tnum fw-7" style={{ fontSize: 15, color: 'var(--accent-strong)' }}>{value}{unit}</span>
    </div>
    <div className="flex gap-1 wrap">
      {steps.map(s => (
        <button key={s}
          onClick={() => onChange(s)}
          className={`filter-chip ${value === s ? 'active' : ''}`}
          style={{ minWidth: 52, justifyContent: 'center' }}>
          {s}{unit}
        </button>
      ))}
    </div>
  </div>
)

export const ReviewBlock: React.FC<{ icon: string; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-3)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={15}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div className="fw-6 text-sm">{value}</div>
    </div>
  </div>
)

export const SummaryLine: React.FC<{ icon: string; label: string; value: React.ReactNode; mono?: boolean }> = ({ icon, label, value, mono }) => (
  <div className="flex center between" style={{ padding: '5px 0', fontSize: 12 }}>
    <span className="text-mute flex center gap-2"><Icon name={icon} size={11}/>{label}</span>
    <span className={mono ? 'mono fw-6' : 'fw-6'} style={{ fontSize: 12, textAlign: 'right', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
  </div>
)
