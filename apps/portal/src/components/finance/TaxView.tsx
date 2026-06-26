import React from 'react'
import useInvoiceStore from '../../store/invoiceStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { formatMMK } from '../ui/ui'

export const TaxView: React.FC = () => {
  const { invoices } = useInvoiceStore()
  const { toast } = useUIStore()
  const totalRev = invoices.filter((i: any) => i.status === 'Payment Received').reduce((a: number, i: any) => a + i.amount, 0)
  const vatRate = 5
  const vatCollected = Math.round(totalRev * vatRate / (100 + vatRate))
  const monthly = [
    ['Dec 2025', 8420000, 421000],
    ['Jan 2026', 9180000, 459000],
    ['Feb 2026', 9520000, 476000],
    ['Mar 2026', 10240000, 512000],
    ['Apr 2026', 10960000, 548000],
    ['May 2026', totalRev, vatCollected],
  ]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tax / VAT report</h1>
          <p className="page-subtitle">Commercial tax tracking · Q2 2026</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Tax report (PDF) downloaded', 'info')}><Icon name="download" size={13}/>PDF report</button>
          <button className="btn" onClick={() => toast('IRD format file generated', 'info')}><Icon name="download" size={13}/>IRD format</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Q2 revenue</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(totalRev * 3)}</div></div>
        <div className="metric"><div className="label">VAT collected ({vatRate}%)</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(vatCollected * 3)}</div></div>
        <div className="metric"><div className="label">Filing due</div><div className="value tnum" style={{ fontSize: 20 }}>15 Jul</div><div className="trend">Q2 IRD submission</div></div>
        <div className="metric"><div className="label">Status</div><div className="value" style={{ fontSize: 16 }}><span className="pill ok"><span className="dot"/>On track</span></div></div>
      </div>

      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">Monthly breakdown</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Month</th><th className="right">Gross revenue</th><th className="right">Commercial tax (5%)</th><th className="right">Net revenue</th><th>Status</th></tr></thead>
            <tbody>
              {monthly.map(([m, rev, tax]) => (
                <tr key={m}>
                  <td className="fw-6">{m}</td>
                  <td className="right tnum">MMK {formatMMK(rev as number)}</td>
                  <td className="right tnum">MMK {formatMMK(tax as number)}</td>
                  <td className="right tnum">MMK {formatMMK((rev as number) - (tax as number))}</td>
                  <td><span className="pill ok"><span className="dot"/>Filed</span></td>
                </tr>
              ))}
              <tr style={{ background: 'var(--surface-2)' }}>
                <td className="fw-7">Total</td>
                <td className="right tnum fw-7">MMK {formatMMK(monthly.reduce((a: number, m: any) => a + m[1], 0))}</td>
                <td className="right tnum fw-7">MMK {formatMMK(monthly.reduce((a: number, m: any) => a + m[2], 0))}</td>
                <td className="right tnum fw-7">MMK {formatMMK(monthly.reduce((a: number, m: any) => a + m[1] - m[2], 0))}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Filing checklist · Q2 2026</h3></div>
        <div className="card-body">
          {[
            ['April invoices reconciled', true],
            ['May invoices reconciled', true],
            ['June invoices reconciled', false],
            ['Commercial tax form drafted', false],
            ['IRD portal submission', false],
            ['Payment to treasury', false],
          ].map(([l, done], i) => (
            <div key={i} className="flex center gap-2" style={{ padding: '6px 0' }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: done ? 'var(--ok)' : 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'white' }}>
                {done && <Icon name="check" size={11}/>}
              </span>
              <span className="text-sm" style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--ink-3)' : 'var(--ink)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
