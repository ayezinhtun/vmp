// Finance extra features: Aging Receivables, Reconciliation, Recurring Billing, Tax/VAT Report

import React, { useState } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { StatusPill, formatMMK } from '../../lib/ui'

// 1. AGING RECEIVABLES (30/60/90+)
export const AgingView: React.FC = () => {
  const { state, markPaid } = useStore()
  const TODAY = (window as any).MOCK.TODAY
  const buckets: Record<string, any[]> = { current: [], '0-30': [], '31-60': [], '61-90': [], '90+': [] }
  state.invoices.filter((i: any) => i.status !== 'Payment Received').forEach((i: any) => {
    const days = Math.ceil((TODAY - new Date(i.due)) / 86400000)
    if (days < 0) buckets.current.push({ ...i, days })
    else if (days <= 30) buckets['0-30'].push({ ...i, days })
    else if (days <= 60) buckets['31-60'].push({ ...i, days })
    else if (days <= 90) buckets['61-90'].push({ ...i, days })
    else buckets['90+'].push({ ...i, days })
  })
  const total = (b: any[]) => b.reduce((a: number, i: any) => a + i.amount, 0)
  const all = [...buckets.current, ...buckets['0-30'], ...buckets['31-60'], ...buckets['61-90'], ...buckets['90+']]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Aging receivables</h1>
          <p className="page-subtitle">{all.length} unpaid invoices · MMK {formatMMK(total(all))} outstanding</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Aging report exported', 'info')}><Icon name="download" size={13}/>Export</button>
          <button className="btn primary" onClick={() => useStore().toast(`Sent ${all.length} payment reminders`, 'ok')}><Icon name="mail" size={13}/>Bulk reminder</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">Current</div><div className="value tnum" style={{ fontSize: 18, color: 'var(--ok)' }}>MMK {formatMMK(total(buckets.current))}</div><div className="trend">{buckets.current.length} invoices</div></div>
        <div className="metric"><div className="label">0–30 days</div><div className="value tnum" style={{ fontSize: 18, color: 'oklch(0.55 0.16 75)' }}>MMK {formatMMK(total(buckets['0-30']))}</div><div className="trend">{buckets['0-30'].length} invoices</div></div>
        <div className="metric"><div className="label">31–60 days</div><div className="value tnum" style={{ fontSize: 18, color: 'oklch(0.55 0.16 35)' }}>MMK {formatMMK(total(buckets['31-60']))}</div><div className="trend">{buckets['31-60'].length} invoices</div></div>
        <div className="metric"><div className="label">90+ days</div><div className="value tnum" style={{ fontSize: 18, color: 'var(--bad)' }}>MMK {formatMMK(total(buckets['90+']) + total(buckets['61-90']))}</div><div className="trend">{buckets['90+'].length + buckets['61-90'].length} invoices</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">All unpaid invoices</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th>Age</th><th className="right">Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {all.map((i: any) => {
                const c = state.customers.find((c: any) => c.id === i.customer)
                const bucket = i.days < 0 ? 'Current' : i.days <= 30 ? '0-30d' : i.days <= 60 ? '31-60d' : i.days <= 90 ? '61-90d' : '90+d'
                const color = i.days < 0 ? 'ok' : i.days <= 30 ? 'warn' : 'bad'
                return (
                  <tr key={i.id}>
                    <td className="mono fw-6">{i.id}</td>
                    <td><div className="fw-6 text-sm">{c?.company}</div></td>
                    <td className="tnum text-sm">{i.due}</td>
                    <td><span className={`pill ${color}`}><span className="dot"/>{bucket}</span></td>
                    <td className="right tnum fw-6">MMK {formatMMK(i.amount)}</td>
                    <td><StatusPill status={i.status}/></td>
                    <td className="right">
                      <button className="btn sm" onClick={() => useStore().toast(`Reminder sent to ${c?.company}`, 'info')}>Remind</button>
                      <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => markPaid(i.id)}>Mark paid</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// 2. RECONCILIATION — match bank transactions to invoices
export const ReconciliationView: React.FC = () => {
  const { state, markPaid, toast } = useStore()
  const [matches, setMatches] = useState<Record<string, string>>({})
  const txns = [
    { id: 'TX-9821', date: '2026-05-26', amount: 6120000, ref: 'KBZ TR-9821 / INV-0418 / YFG', method: 'KBZ Pay' },
    { id: 'TX-9819', date: '2026-05-22', amount: 5520000, ref: 'AYA Direct / MLC Co. May renewal', method: 'AYA Bank' },
    { id: 'TX-9817', date: '2026-05-21', amount: 2640000, ref: 'KBZ TR-9817 / Sittwe Marine', method: 'KBZ Pay' },
    { id: 'TX-9815', date: '2026-05-18', amount: 1920000, ref: 'CB Bank wire / Pyay Agri', method: 'CB Bank' },
    { id: 'TX-9812', date: '2026-05-15', amount: 480000, ref: 'KBZ TR-9812 / no reference', method: 'KBZ Pay' },
  ]
  const unmatchedInv = state.invoices.filter((i: any) => i.status === 'Pending' || i.status === 'Customer Transferred')

  const match = (txId: string, invId: string) => {
    setMatches({ ...matches, [txId]: invId })
    markPaid(invId)
    toast(`Matched ${txId} → ${invId}`, 'ok')
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Payment reconciliation</h1>
          <p className="page-subtitle">Match bank transactions to invoices · {txns.length - Object.keys(matches).length} unmatched</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => useStore().toast('Bank feed synced — 2 new transactions', 'ok')}><Icon name="refresh" size={13}/>Sync bank feed</button>
        </div>
      </div>

      <div className="grid-asym">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Bank transactions</h3></div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Txn</th><th>Date</th><th>Method</th><th>Reference</th><th className="right">Amount</th><th>Match</th></tr></thead>
              <tbody>
                {txns.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="mono fw-6">{tx.id}</td>
                    <td className="tnum text-sm">{tx.date}</td>
                    <td><span className="pill subtle">{tx.method}</span></td>
                    <td className="text-xs mono" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.ref}</td>
                    <td className="right tnum fw-6">MMK {formatMMK(tx.amount)}</td>
                    <td>
                      {matches[tx.id]
                        ? <span className="pill ok"><Icon name="check" size={10}/>{matches[tx.id]}</span>
                        : (() => {
                            const candidate = unmatchedInv.find((i: any) => i.amount === tx.amount)
                            return candidate
                              ? <button className="btn sm accent" onClick={() => match(tx.id, candidate.id)}>Match {candidate.id}</button>
                              : <span className="pill warn"><span className="dot"/>No match</span>
                          })()
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Reconciliation summary</h3></div>
          <div className="card-body">
            <div className="flex col gap-3 text-sm">
              <div className="flex between"><span className="text-mute">Bank deposits</span><span className="tnum fw-6">MMK {formatMMK(txns.reduce((a: number, t: any) => a + t.amount, 0))}</span></div>
              <div className="flex between"><span className="text-mute">Matched to invoices</span><span className="tnum fw-6" style={{ color: 'var(--ok)' }}>{Object.keys(matches).length} of {txns.length}</span></div>
              <div className="flex between"><span className="text-mute">Unmatched amount</span><span className="tnum fw-6" style={{ color: 'var(--warn)' }}>MMK 480,000</span></div>
              <div className="divider"/>
              <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Open invoices</div>
              {unmatchedInv.slice(0, 4).map((i: any) => {
                const c = state.customers.find((c: any) => c.id === i.customer)
                return (
                  <div key={i.id} className="flex between text-xs">
                    <span>{i.id}<span className="text-mute"> · {c?.company}</span></span>
                    <span className="tnum fw-6">{formatMMK(i.amount)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 3. RECURRING BILLING
export const RecurringView: React.FC = () => {
  const { state, toast } = useStore()
  const cycles = state.vms.filter((v: any) => v.status === 'Active').map((v: any) => {
    const c = state.customers.find((c: any) => c.id === v.customer)
    return {
      ...v,
      customerName: c?.company,
      nextBill: (() => { const d = new Date(v.expiry); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })(),
      autoRenew: true,
    }
  })

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Recurring billing</h1>
          <p className="page-subtitle">{cycles.length} active subscriptions · MMK {formatMMK(cycles.reduce((a: number, v: any) => a + v.priceMonth, 0))} monthly recurring</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast('Billing schedule exported', 'info')}><Icon name="download" size={13}/>Export schedule</button>
          <button className="btn primary" onClick={() => toast(`Generated ${cycles.length} invoices for next cycle`, 'ok')}><Icon name="refresh" size={13}/>Generate invoices</button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label">MRR</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.reduce((a: number, v: any) => a + v.priceMonth, 0))}</div></div>
        <div className="metric"><div className="label">ARR (projected)</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.reduce((a: number, v: any) => a + v.priceMonth, 0) * 12)}</div></div>
        <div className="metric"><div className="label">Auto-renew on</div><div className="value tnum">{cycles.length}</div><div className="trend">All subscriptions</div></div>
        <div className="metric"><div className="label">Next 7 days billing</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(cycles.filter((v: any) => { const d = (new Date(v.nextBill) - (window as any).MOCK.TODAY) / 86400000; return d >= 0 && d <= 7; }).reduce((a: number, v: any) => a + v.priceMonth, 0))}</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Billing schedule</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>VM</th><th>Customer</th><th className="right">Monthly</th><th>Next bill</th><th>Renewal</th><th>Auto-renew</th><th></th></tr></thead>
            <tbody>
              {cycles.sort((a: any, b: any) => new Date(a.nextBill).getTime() - new Date(b.nextBill).getTime()).map((v: any) => (
                <tr key={v.id}>
                  <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                  <td className="text-sm">{v.customerName}</td>
                  <td className="right tnum">MMK {formatMMK(v.priceMonth)}</td>
                  <td className="tnum text-sm">{v.nextBill}</td>
                  <td className="tnum text-sm">{v.expiry}</td>
                  <td><span className="toggle on"/></td>
                  <td className="right"><button className="btn sm" onClick={() => toast(`Invoice generated for ${v.name}`, 'ok')}>Bill now</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// 4. TAX / VAT REPORT
export const TaxView: React.FC = () => {
  const { state } = useStore()
  const totalRev = state.invoices.filter((i: any) => i.status === 'Payment Received').reduce((a: number, i: any) => a + i.amount, 0)
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
          <button className="btn" onClick={() => useStore().toast('Tax report (PDF) downloaded', 'info')}><Icon name="download" size={13}/>PDF report</button>
          <button className="btn" onClick={() => useStore().toast('IRD format file generated', 'info')}><Icon name="download" size={13}/>IRD format</button>
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
                  <td className="right tnum">MMK {formatMMK(rev)}</td>
                  <td className="right tnum">MMK {formatMMK(tax)}</td>
                  <td className="right tnum">MMK {formatMMK(rev - tax)}</td>
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
