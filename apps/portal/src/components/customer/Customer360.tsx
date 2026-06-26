import React from 'react'
import useCustomerStore from '../../store/customerStore'
import useVMStore from '../../store/vmStore'
import useInvoiceStore from '../../store/invoiceStore'
import useTicketStore from '../../store/ticketStore'
import useTaskStore from '../../store/taskStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { Avatar, StatusPill, formatMMK } from '../ui/ui'

interface Customer360Props {
  customer: any
  onClose: () => void
  openCust: (id: string) => void
}

export const Customer360: React.FC<Customer360Props> = ({ customer, onClose, openCust }) => {
  const { customers, updateCustomer, setKYC } = useCustomerStore()
  const { vms } = useVMStore()
  const { invoices } = useInvoiceStore()
  const { tickets } = useTicketStore()
  const { tasks } = useTaskStore()
  const { toast } = useUIStore()
  const c = customers.find((x: any) => x.id === customer.id) || customer
  const customerVMs = vms.filter((v: any) => v.customer === c.id)
  const customerInvoices = invoices.filter((i: any) => i.customer === c.id)
  const customerTickets = tickets.filter((t: any) => t.customer === c.id)

  const ltv = c.totalSpend
  const mrr = customerVMs.filter((v: any) => v.status === 'Active').reduce((a: number, v: any) => a + v.priceMonth, 0)
  const openTickets = customerTickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress').length
  const overdueInv = customerInvoices.filter((i: any) => i.status === 'Overdue').length

  // Health score (0-100)
  const health = Math.round(
    (c.status === 'Active' ? 30 : 0) +
    (c.kyc === 'Approved' ? 20 : c.kyc === 'Pending' ? 10 : 0) +
    Math.min(20, customerVMs.filter((v: any) => v.status === 'Active').length * 5) +
    (overdueInv === 0 ? 15 : 0) +
    Math.min(15, 15 - openTickets * 3)
  )
  const healthColor = health >= 70 ? 'var(--ok)' : health >= 40 ? 'var(--warn)' : 'var(--bad)'
  const healthLabel = health >= 70 ? 'Healthy' : health >= 40 ? 'At risk' : 'Critical'

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: 'min(900px, 95vw)' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
          <div className="flex center between mb-2">
            <span className="mono text-sm text-mute">{c.id}</span>
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
          </div>
          <div className="flex center gap-3">
            <Avatar name={c.name} size={56}/>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.name}</h2>
              <div className="text-sm text-mute mt-1">{c.company} · {c.email} · {c.phone}</div>
              <div className="flex gap-2 mt-2">
                <StatusPill status={c.kyc}/>
                <StatusPill status={c.status}/>
                <span className="pill"><span className="dot" style={{ background: healthColor }}/>Health: {health}/100 · {healthLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {/* 360° KPIs */}
          <div className="grid-4 mb-4">
            <div className="metric"><div className="label">Lifetime value</div><div className="value tnum" style={{ fontSize: 18 }}>MMK {formatMMK(ltv)}</div></div>
            <div className="metric"><div className="label">Monthly recurring</div><div className="value tnum" style={{ fontSize: 18 }}>MMK {formatMMK(mrr)}</div></div>
            <div className="metric"><div className="label">Active VMs</div><div className="value tnum">{customerVMs.filter((v: any) => v.status === 'Active').length}</div><div className="trend">{customerVMs.length} total</div></div>
            <div className="metric"><div className="label">Open issues</div><div className="value tnum" style={{ fontSize: 18, color: openTickets > 0 || overdueInv > 0 ? 'var(--bad)' : 'var(--ok)' }}>{openTickets + overdueInv}</div><div className="trend">{openTickets} tickets · {overdueInv} overdue inv</div></div>
          </div>

          {/* Account actions */}
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Account actions</h3></div>
            <div className="card-body">
              <div className="flex gap-2 wrap">
                <button className="btn" onClick={() => toast(`Impersonating ${c.name} — switch role to Customer to see their view`, 'info')}><Icon name="eye" size={12}/>Impersonate</button>
                <button className="btn" onClick={() => toast(`Password reset email sent to ${c.email}`, 'ok')}><Icon name="key" size={12}/>Reset password</button>
                <button className="btn" onClick={() => toast(`Welcome email re-sent to ${c.email}`, 'info')}><Icon name="mail" size={12}/>Resend welcome</button>
                {c.kyc === 'Pending' && <>
                  <button className="btn accent" onClick={() => setKYC(c.id, 'Approved')}><Icon name="check" size={12}/>Approve KYC</button>
                  <button className="btn danger" onClick={() => setKYC(c.id, 'Rejected')}><Icon name="x" size={12}/>Reject KYC</button>
                </>}
                {c.status === 'Active'
                  ? <button className="btn" onClick={() => { updateCustomer(c.id, { status: 'Inactive' }); toast(`${c.name} suspended`, 'warn'); }}><Icon name="pause" size={12}/>Suspend account</button>
                  : <button className="btn primary" onClick={() => { updateCustomer(c.id, { status: 'Active' }); toast(`${c.name} reactivated`, 'ok'); }}><Icon name="play" size={12}/>Reactivate</button>
                }
                <button className="btn" onClick={() => toast('Customer data export queued (24h)', 'info')}><Icon name="download" size={12}/>Export data (GDPR)</button>
                <button className="btn danger" onClick={() => toast('Account deletion requires Admin password confirmation', 'warn')}><Icon name="trash" size={12}/>Delete account</button>
              </div>
            </div>
          </div>

          {/* All-data tabs as collapsed lists */}
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="card">
              <div className="card-head"><h3 className="card-title">VMs ({customerVMs.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>VM</th><th>Status</th><th>MMK/mo</th></tr></thead>
                  <tbody>
                    {customerVMs.slice(0, 5).map((v: any) => (
                      <tr key={v.id}><td><div className="fw-6 text-xs">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td><td><StatusPill status={v.status}/></td><td className="tnum text-xs">{formatMMK(v.priceMonth)}</td></tr>
                    ))}
                    {customerVMs.length === 0 && <tr><td colSpan={3}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No VMs</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3 className="card-title">Invoices ({customerInvoices.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Invoice</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {customerInvoices.slice(0, 5).map((i: any) => (
                      <tr key={i.id}><td className="mono text-xs">{i.id}</td><td className="tnum text-xs">MMK {formatMMK(i.amount)}</td><td><StatusPill status={i.status}/></td></tr>
                    ))}
                    {customerInvoices.length === 0 && <tr><td colSpan={3}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No invoices</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3 className="card-title">Support tickets ({tickets.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Subject</th><th>Status</th></tr></thead>
                  <tbody>
                    {tickets.slice(0, 5).map((t: any) => (
                      <tr key={t.id}><td><div className="fw-6 text-xs">{t.subject}</div><div className="text-xs text-mute mono">{t.id}</div></td><td><StatusPill status={t.status}/></td></tr>
                    ))}
                    {tickets.length === 0 && <tr><td colSpan={2}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No tickets</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3 className="card-title">Tasks / requests ({tasks.length})</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead><tr><th>Task</th><th>Status</th></tr></thead>
                  <tbody>
                    {tasks.slice(0, 5).map((t: any) => (
                      <tr key={t.id}><td><div className="fw-6 text-xs" style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div><div className="text-xs text-mute mono">{t.id}</div></td><td><StatusPill status={t.status}/></td></tr>
                    ))}
                    {tasks.length === 0 && <tr><td colSpan={2}><div className="text-mute text-sm" style={{ padding: 12, textAlign: 'center' }}>No tasks</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Open full profile link */}
          <div className="text-center mt-4">
            <button className="btn" onClick={() => { onClose(); openCust(c.id); }}>Open full profile<Icon name="external" size={11}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}
