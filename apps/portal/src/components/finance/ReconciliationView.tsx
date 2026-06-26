import React, { useState } from 'react'
import useInvoiceStore from '../../store/invoiceStore'
import useCustomerStore from '../../store/customerStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { formatMMK } from '../ui/ui'

export const ReconciliationView: React.FC = () => {
  const { invoices, markPaid } = useInvoiceStore()
  const { customers } = useCustomerStore()
  const { toast } = useUIStore()
  const [matches, setMatches] = useState<Record<string, string>>({})
  const txns = [
    { id: 'TX-9821', date: '2026-05-26', amount: 6120000, ref: 'KBZ TR-9821 / INV-0418 / YFG', method: 'KBZ Pay' },
    { id: 'TX-9819', date: '2026-05-22', amount: 5520000, ref: 'AYA Direct / MLC Co. May renewal', method: 'AYA Bank' },
    { id: 'TX-9817', date: '2026-05-21', amount: 2640000, ref: 'KBZ TR-9817 / Sittwe Marine', method: 'KBZ Pay' },
    { id: 'TX-9815', date: '2026-05-18', amount: 1920000, ref: 'CB Bank wire / Pyay Agri', method: 'CB Bank' },
    { id: 'TX-9812', date: '2026-05-15', amount: 480000, ref: 'KBZ TR-9812 / no reference', method: 'KBZ Pay' },
  ]
  const unmatchedInv = invoices.filter((i: any) => i.status === 'Pending' || i.status === 'Customer Transferred')

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
          <button className="btn" onClick={() => toast('Bank feed synced — 2 new transactions', 'ok')}><Icon name="refresh" size={13}/>Sync bank feed</button>
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
                const c = customers.find((c: any) => c.id === i.customer)
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
