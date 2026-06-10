'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { customerApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { StatusPill } from '@/components/vms/vm-status-badge';
import type { Invoice } from '@/lib/types';

/* ─── Chevron ─────────────────────────────────────────────────────── */
function ChevronIcon({ down }: { down: boolean }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {down ? <polyline points="6 9 12 15 18 9"/> : <polyline points="18 15 12 9 6 15"/>}
    </svg>
  );
}

export default function InvoicesPage() {
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: customerApi.invoices });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const invList = invoices as Invoice[];
  const pending  = invList.filter(i => i.status === 'Pending' || i.status === 'Overdue');
  const overdue  = invList.filter(i => i.status === 'Overdue');
  const totalPaid = invList.reduce((a, i) => a + (i.status === 'Paid' ? i.totalAmount : 0), 0);

  const fmt = (n: number) => `MMK ${n.toLocaleString()}`;

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Invoices</h1>
        <p className="page-subtitle">{pending.length} pending · {invList.length} total</p>
      </div>

      {/* Summary metrics */}
      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="metric">
          <div className="label">Awaiting payment</div>
          <div className="value tnum" style={{ color: pending.length > 0 ? 'var(--warn)' : undefined }}>{pending.length}</div>
          <div className="trend">{invList.length} total</div>
        </div>
        <div className="metric">
          <div className="label">Total paid</div>
          <div className="value" style={{ fontSize: 18, color: 'var(--ok)' }}>{fmt(totalPaid)}</div>
          <div className="trend">all time</div>
        </div>
        <div className="metric">
          <div className="label">Overdue</div>
          <div className="value tnum" style={{ color: overdue.length > 0 ? 'var(--bad)' : undefined }}>{overdue.length}</div>
          <div className="trend">need attention</div>
        </div>
      </div>

      {/* Invoice list */}
      <div className="card">
        {invList.length === 0 && (
          <div className="empty" style={{ padding: '40px 0' }}>
            <div className="title">No invoices yet</div>
            <div className="sub">Invoices will appear here after your first billing cycle.</div>
          </div>
        )}

        {invList.map((inv, i) => (
          <div key={inv.id} style={{ borderTop: i > 0 ? '1px solid var(--line)' : undefined }}>
            {/* Row */}
            <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Invoice #{inv.invoiceNumber}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 1 }}>
                  Issued {formatDate(inv.issuedAt)} · Due {formatDate(inv.dueDate)}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, fontVariantNumeric: 'tabular-nums', minWidth: 80, textAlign: 'right' }}>
                {fmt(inv.totalAmount)}
              </div>
              <StatusPill status={inv.status}/>
              <button className="icon-btn" style={{ flexShrink: 0 }}><ChevronIcon down={expandedId !== inv.id}/></button>
            </div>

            {/* Line items */}
            {expandedId === inv.id && (
              <div style={{ padding: '0 18px 16px 18px', borderTop: '1px solid var(--line)' }}>
                <table className="tbl" style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'right', width: 60 }}>Qty</th>
                      <th style={{ textAlign: 'right', width: 100 }}>Unit price</th>
                      <th style={{ textAlign: 'right', width: 110 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inv as any).items?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>{item.description}</td>
                        <td className="mono text-sm" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{item.quantity}</td>
                        <td className="mono text-sm" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{fmt(item.unitPrice)}</td>
                        <td className="mono text-sm" style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--line)' }}>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, paddingTop: 8, fontSize: 12, color: 'var(--ink-2)' }}>Total</td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 700, paddingTop: 8 }}>{fmt(inv.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
                {(inv as any).notes && (
                  <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--ink-2)', fontStyle: 'italic' }}>{(inv as any).notes}</div>
                )}
                {(inv.status === 'Pending' || inv.status === 'Overdue') && (
                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    <button className="btn primary sm">Pay now →</button>
                    <button className="btn ghost sm">Download PDF</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
