import React from 'react'
import useInvoiceStore from '../../store/invoiceStore'
import useCustomerStore from '../../store/customerStore'
import useVMStore from '../../store/vmStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { StatusPill, formatMMK } from '../ui/ui'

interface CustomerInvoiceDetailProps {
  invoice: any
  onClose: () => void
}

export const CustomerInvoiceDetail: React.FC<CustomerInvoiceDetailProps> = ({ invoice: initial, onClose }) => {
  const { invoices } = useInvoiceStore()
  const { customers } = useCustomerStore()
  const { vms } = useVMStore()
  const { toast } = useUIStore()
  const inv = invoices.find((i: any) => i.id === initial.id) || initial;
  const c = customers.find((c: any) => c.id === inv.customer);
  const invoiceVMs = vms.filter((v: any) => inv.vms.includes(v.id));
  const baseMonthly = invoiceVMs.reduce((a: number, v: any) => a + v.priceMonth, 0);
  const months = baseMonthly > 0 ? Math.max(1, Math.round(inv.amount / baseMonthly)) : 1;

  return (
    <div className="content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to invoices</button>
            <span className="mono text-xs text-mute">{inv.id}</span>
          </div>
          <h1 className="page-title">Invoice {inv.id}</h1>
          <div className="flex gap-2 mt-2">
            <StatusPill status={inv.status}/>
            <span className="pill subtle">Issued {inv.issued}</span>
            <span className="pill subtle">Due {inv.due}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => toast(`Downloaded ${inv.id}.pdf`, 'info')}><Icon name="download" size={12}/>PDF</button>
          <button className="btn" onClick={() => window.print && window.print()}><Icon name="file" size={12}/>Print</button>
          {inv.status !== 'Payment Received' && (
            <button className="btn accent" onClick={() => toast('Payment instructions emailed', 'ok')}><Icon name="check" size={12}/>Pay now</button>
          )}
        </div>
      </div>

      <div className="grid-asym" style={{ gap: 24 }}>
        <div className="flex col" style={{ gap: 16 }}>
          {/* Invoice paper */}
          <div className="card">
            <div className="card-body" style={{ padding: 28 }}>
              <div className="flex between mb-4">
                <div>
                  <div className="brand-mark" style={{ width: 40, height: 40, fontSize: 18, marginBottom: 8 }}>V</div>
                  <div className="fw-7" style={{ fontSize: 14 }}>VPS Myanmar Co., Ltd</div>
                  <div className="text-xs text-mute">No. 142, Strand Road, Yangon</div>
                  <div className="text-xs text-mute">accounts@vpsmm.co · +95 1 2345 678</div>
                </div>
                <div className="right">
                  <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Invoice</div>
                  <div className="mono fw-7" style={{ fontSize: 14 }}>{inv.id}</div>
                  <div className="text-xs text-mute mt-2">Currency: {inv.currency}</div>
                </div>
              </div>

              <div className="grid-2 mb-4" style={{ gap: 16 }}>
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 6 }}>
                  <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Billed to</div>
                  <div className="fw-7 text-sm">{c?.company}</div>
                  <div className="text-xs text-mute">{c?.name}</div>
                  <div className="text-xs text-mute">{c?.email}</div>
                  <div className="text-xs text-mute mono">{c?.id}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 6 }}>
                  <div className="text-xs text-mute fw-6 mb-1" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Payment terms</div>
                  <div className="text-sm"><span className="text-mute">Issued:</span> <span className="fw-6 tnum">{inv.issued}</span></div>
                  <div className="text-sm"><span className="text-mute">Due date:</span> <span className="fw-6 tnum">{inv.due}</span></div>
                  <div className="text-sm"><span className="text-mute">Method:</span> <span className="fw-6">{inv.method}</span></div>
                  {inv.receipt !== '—' && <div className="text-sm"><span className="text-mute">Receipt #:</span> <span className="mono fw-6">{inv.receipt}</span></div>}
                </div>
              </div>

              <table className="tbl" style={{ marginBottom: 16 }}>
                <thead>
                  <tr><th>Service</th><th>VM</th><th className="right">Months</th><th className="right">Unit / mo</th><th className="right">Total</th></tr>
                </thead>
                <tbody>
                  {vms.map((v: any) => (
                    <tr key={v.id}>
                      <td>
                        <div className="fw-6">{v.name}</div>
                        <div className="text-xs text-mute">{v.vcpu} vCPU · {v.ram}GB RAM · {v.storage}GB SSD · {v.os}</div>
                      </td>
                      <td className="mono text-xs">{v.id}</td>
                      <td className="right tnum">{months}</td>
                      <td className="right tnum">MMK {formatMMK(v.priceMonth)}</td>
                      <td className="right tnum fw-6">MMK {formatMMK(v.priceMonth * months)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex" style={{ justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 280 }}>
                  <div className="flex between" style={{ padding: '6px 0' }}>
                    <span className="text-mute">Subtotal</span>
                    <span className="tnum">MMK {formatMMK(inv.amount)}</span>
                  </div>
                  <div className="flex between" style={{ padding: '6px 0' }}>
                    <span className="text-mute">Tax (commercial)</span>
                    <span className="tnum text-mute">MMK 0</span>
                  </div>
                  <div className="divider" style={{ margin: '6px 0' }}/>
                  <div className="flex between" style={{ padding: '6px 0' }}>
                    <span className="fw-7">Amount due</span>
                    <span className="tnum fw-7" style={{ fontSize: 18 }}>MMK {formatMMK(inv.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="divider"/>
              <div className="text-xs text-mute">
                <strong>Payment methods:</strong> KBZ Pay (09 7710 12345), AYA Bank (00 220 11 22 33), CB Bank (00 451 22 33 44), Yoma Bank (00 510 99 88 77). Please include invoice number in the transfer reference.
              </div>
              <div className="text-xs text-mute mt-2">
                <strong>Notes:</strong> Service continues uninterrupted upon payment confirmation. Late payments may result in service suspension after 7 days grace period.
              </div>
            </div>
          </div>
        </div>

        <div className="flex col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Payment status</h3></div>
            <div className="card-body">
              <div style={{ padding: 14, background: inv.status === 'Payment Received' ? 'var(--ok-soft)' : inv.status === 'Overdue' ? 'var(--bad-soft)' : 'var(--warn-soft)', borderRadius: 8 }}>
                <div className="fw-7" style={{ color: inv.status === 'Payment Received' ? 'var(--ok)' : inv.status === 'Overdue' ? 'var(--bad)' : 'oklch(0.5 0.14 75)' }}>{inv.status}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>
                  {inv.status === 'Payment Received' && `Receipt: ${inv.receipt}`}
                  {inv.status === 'Pending' && 'Awaiting your transfer'}
                  {inv.status === 'Customer Transferred' && 'Confirming with bank'}
                  {inv.status === 'Overdue' && 'Past due — please pay urgently'}
                </div>
              </div>
              {inv.status !== 'Payment Received' && (
                <button className="btn primary w-full mt-3" onClick={() => toast('Upload screenshot dialog', 'info')}>
                  <Icon name="attach" size={12}/>Upload payment proof
                </button>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Quick actions</h3></div>
            <div className="card-body">
              <div className="flex col gap-2">
                <button className="btn" onClick={() => toast(`Downloaded ${inv.id}.pdf`, 'info')}><Icon name="download" size={12}/>Download PDF</button>
                <button className="btn" onClick={() => toast('Forwarded to your accountant', 'info')}><Icon name="mail" size={12}/>Forward to accountant</button>
                <button className="btn" onClick={() => toast('Dispute opened with billing', 'warn')}><Icon name="alert" size={12}/>Dispute invoice</button>
              </div>
            </div>
          </div>
          {vms.length > 0 && (
            <div className="card">
              <div className="card-head"><h3 className="card-title">Linked VMs</h3></div>
              <div className="card-body" style={{ padding: '6px 14px' }}>
                {vms.map((v: any) => (
                  <div key={v.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                    <div className="fw-6 text-sm">{v.name}</div>
                    <div className="text-xs text-mute mono">{v.id} · {v.publicIp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
