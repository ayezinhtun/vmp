// Customer portal — sidebar layout with full features
// Nav: Dashboard, Request VM, My VMs, My requests, Invoices, Support/Tickets, Account
// VM list opens a full Details page (not modal); tickets have create/update/view/status CRUD.
// Components extracted to components/customer-portal folder

import React, { useState, useEffect } from 'react'
import useCustomerStore from '../store/customerStore'
import useVMStore from '../store/vmStore'
import useInvoiceStore from '../store/invoiceStore'
import useTicketStore from '../store/ticketStore'
import useTaskStore from '../store/taskStore'
import useUIStore from '../store/uiStore'
import Icon from '../lib/icons'
import { Avatar } from '../components/ui/ui'
import { CustRenewModal } from '../components/modals/CustomerVMModals'
import { useAuth } from '../components/auth/Auth'
import RoleSwitcher from '../components/common/RoleSwitcher'
import { CustomerDashboard } from '../components/customer-portal/CustomerDashboard'
import { CustomerVMListView } from '../components/customer-portal/CustomerVMListView'
import { CustomerRequestsView } from '../components/customer-portal/CustomerRequestsView'
import { CustomerInvoicesView } from '../components/customer-portal/CustomerInvoicesView'
import { CustomerAccountView } from '../components/customer-portal/CustomerAccountView'
import { CustomerVMDetail } from '../components/customer-portal/CustomerVMDetail'
import { CustomerRequestVMView } from '../components/customer-portal/CustomerRequestVMView'
import { CustomerTicketsView } from '../components/customer-portal/CustomerTicketsView'
import { CustomerTicketDetail } from '../components/customer-portal/CustomerTicketDetail'
import { CustomerRequestDetail } from '../components/customer-portal/CustomerRequestDetail'
import { CustomerInvoiceDetail } from '../components/customer-portal/CustomerInvoiceDetail'

interface CustomerPortalProps {
  role?: string
  setRole?: (role: string) => void
  roleNames?: Record<string, string>
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ role = 'Customer', setRole, roleNames = {} }) => {
  const { customers } = useCustomerStore()
  const { vms } = useVMStore()
  const { invoices } = useInvoiceStore()
  const { tickets } = useTicketStore()
  const { tasks, addTask } = useTaskStore()
  const { toast } = useUIStore()
  const auth = useAuth()
  const meId = auth?.user?.customerId || 'C-1043'
  const me = customers.find((c: any) => c.id === meId) || customers.find((c: any) => c.id === 'C-1043')
  if (!me) return <div className="content"><div className="empty"><div className="title">Account not found</div><div className="sub">Try signing out and back in.</div></div></div>
  const myVMs = vms.filter((v: any) => v.customer === meId)
  const myInvs = invoices.filter((i: any) => i.customer === meId)
  const myTickets = tickets.filter((t: any) => t.customer === meId)
  const myRequests = tasks.filter((t: any) => t.customer === meId && t.notes && t.notes.includes('Customer-initiated'))

  const [view, setView] = useState('dashboard')
  const [detailVm, setDetailVm] = useState<any>(null)
  const [openTicket, setOpenTicket] = useState<any>(null)
  const [detailRequest, setDetailRequest] = useState<any>(null)
  const [detailInvoice, setDetailInvoice] = useState<any>(null)
  const [renewVm, setRenewVm] = useState<any>(null)

  const expiringSoon = myVMs.filter((v: any) => {
    if (!v.expiry || v.expiry === '—') return false
    const d = (new Date(v.expiry).getTime() - (window as any).MOCK.TODAY.getTime()) / 86400000
    return d >= 0 && d <= 14
  })
  const openTickets = myTickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress')
  const pendingInv = myInvs.filter((i: any) => i.status !== 'Payment Received')

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'request', label: 'Request VM', icon: 'plus', lockedByKyc: true },
    { id: 'vms', label: 'My VMs', icon: 'server', badge: myVMs.length || null, lockedByKyc: true },
    { id: 'requests', label: 'My requests', icon: 'tasks', badge: myRequests.length || null, lockedByKyc: true },
    { id: 'invoices', label: 'Invoices', icon: 'invoice', badge: pendingInv.length || null, lockedByKyc: true },
    { id: 'tickets', label: 'Support tickets', icon: 'mail', badge: openTickets.length || null },
  ]

  const submitRenewalRequest = (vm: any, months: number) => {
    addTask({
      title: `Customer renewal request — ${vm.name} (${months} months)`,
      customer: meId, vm: vm.id, type: 'Renewal', priority: 'Normal', status: 'Pending',
      team: 'Sales', subscription: `${months} months`,
      notes: `Customer-initiated renewal request via portal.`,
    })
    toast(`Renewal request submitted. Sales will be in touch.`, 'ok')
    setRenewVm(null)
  }

  useEffect(() => {
    if (me.kyc !== 'Approved' && ['request', 'vms', 'requests', 'invoices'].includes(view)) {
      setView('dashboard')
    }
  }, [me.kyc, view])

  return (
    <div className="app" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'white' }}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <div className="brand-name">VPS Myanmar</div>
            <div className="brand-sub">Customer portal</div>
          </div>
        </div>
        <nav className="nav">
          <div className="nav-section">Workspace</div>
          {items.map((it: any) => {
            const locked = it.lockedByKyc && me.kyc !== 'Approved'
            return (
              <button key={it.id}
                className={`nav-item ${view === it.id ? 'active' : ''}`}
                disabled={locked}
                onClick={() => { if (locked) return; setView(it.id); setDetailVm(null); setOpenTicket(null); setDetailRequest(null); setDetailInvoice(null) }}
                style={locked ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                title={locked ? `Locked — KYC ${me.kyc}` : ''}>
                <Icon name={it.icon} className="nav-icon"/>
                <span>{it.label}</span>
                {locked
                  ? <Icon name="lock" size={11} style={{ marginLeft: 'auto', opacity: 0.6 }}/>
                  : (it.badge && <span className="nav-badge">{it.badge}</span>)}
              </button>
            )
          })}
        </nav>
        <div className="nav-user" style={{ cursor: 'pointer' }} onClick={() => setView('account')}>
          <Avatar name={me.name} size={28}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="who">{me.name}</div>
            <div className="role">{me.company}</div>
          </div>
          <button className="icon-btn" title="Sign out" onClick={(e) => { e.stopPropagation(); auth?.signout() }}><Icon name="logout"/></button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>Customer portal</span>
            <Icon name="chevron-right" size={12} className="sep"/>
            {detailVm ? (
              <>
                <span style={{ cursor: 'pointer' }} onClick={() => setDetailVm(null)}>My VMs</span>
                <Icon name="chevron-right" size={12} className="sep"/>
                <strong>{detailVm.name}</strong>
              </>
            ) : openTicket ? (
              <>
                <span style={{ cursor: 'pointer' }} onClick={() => setOpenTicket(null)}>Support tickets</span>
                <Icon name="chevron-right" size={12} className="sep"/>
                <strong>{openTicket.id}</strong>
              </>
            ) : (
              <strong>{items.find((i: any) => i.id === view)?.label || 'Dashboard'}</strong>
            )}
          </div>
          <div className="topbar-spacer"/>
          <div className="text-sm text-mute">{me.company} · <span className="mono">{me.id}</span></div>
          <button className="icon-btn" title="Notifications"><Icon name="bell" size={15}/></button>
        </div>

        {me.kyc !== 'Approved' && !detailVm && !openTicket && !detailRequest && !detailInvoice && (
          <div style={{
            padding: '14px 28px',
            background: me.kyc === 'Rejected' ? 'var(--bad-soft)' : 'var(--warn-soft)',
            borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 14,
            animation: 'slideDown 0.3s ease-out',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: me.kyc === 'Rejected' ? 'var(--bad)' : 'oklch(0.55 0.16 75)',
              color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <Icon name={me.kyc === 'Rejected' ? 'alert' : 'shield'} size={16}/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="fw-7 text-sm" style={{ color: me.kyc === 'Rejected' ? 'var(--bad)' : 'oklch(0.4 0.13 75)' }}>
                {me.kyc === 'Rejected' ? 'KYC verification rejected' : 'Your account is under KYC review'}
              </div>
              <div className="text-xs mt-1" style={{ color: me.kyc === 'Rejected' ? 'oklch(0.4 0.12 25)' : 'oklch(0.45 0.12 75)', lineHeight: 1.5 }}>
                {me.kyc === 'Rejected'
                  ? 'Your documents didn\'t pass verification. Please re-upload via the Account page or contact your account manager.'
                  : 'Our team is reviewing your documents — usually within 1 business day. VM deployment and most features are locked until KYC is approved.'}
              </div>
            </div>
            <button className="btn" onClick={() => toast('Contact your account manager: Su Su — susu@vpsmm.co', 'info')}>
              <Icon name="mail" size={12}/>{me.kyc === 'Rejected' ? 'Contact support' : 'Check status'}
            </button>
          </div>
        )}

        <style>{`@keyframes slideDown { from { transform: translateY(-6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {expiringSoon.length > 0 && !detailVm && view !== 'request' && me.kyc === 'Approved' && (
          <div style={{ padding: '12px 28px', background: 'var(--warn-soft)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="alert" size={16} style={{ color: 'oklch(0.55 0.16 75)' }}/>
            <div className="text-sm" style={{ color: 'oklch(0.4 0.13 75)' }}>
              <span className="fw-6">{expiringSoon.length} VM{expiringSoon.length > 1 ? 's' : ''} expiring soon.</span> Renew now to avoid service interruption.
            </div>
            <div style={{ flex: 1 }}/>
            <button className="btn" onClick={() => setRenewVm(expiringSoon[0])}>Request renewal</button>
          </div>
        )}

        {detailVm
          ? <CustomerVMDetail vm={detailVm} onClose={() => setDetailVm(null)} onRenew={() => setRenewVm(detailVm)}/>
          : openTicket
            ? <CustomerTicketDetail ticket={openTicket} onClose={() => setOpenTicket(null)}/>
            : detailRequest
              ? <CustomerRequestDetail request={detailRequest} onClose={() => setDetailRequest(null)}/>
              : detailInvoice
                ? <CustomerInvoiceDetail invoice={detailInvoice} onClose={() => setDetailInvoice(null)}/>
                : (
                  <>
                    {view === 'dashboard' && <CustomerDashboard me={me} myVMs={myVMs} myInvs={myInvs} myTickets={myTickets} myRequests={myRequests} setView={setView} setDetailVm={setDetailVm} setOpenTicket={setOpenTicket}/>}
                    {view === 'request' && <CustomerRequestVMView me={me} setView={setView}/>}
                    {view === 'vms' && <CustomerVMListView myVMs={myVMs} setDetailVm={setDetailVm} setRenewVm={setRenewVm}/>}
                    {view === 'requests' && <CustomerRequestsView myRequests={myRequests} setDetailRequest={setDetailRequest}/>}
                    {view === 'invoices' && <CustomerInvoicesView myInvs={myInvs} setDetailInvoice={setDetailInvoice}/>}
                    {view === 'tickets' && <CustomerTicketsView me={me} myTickets={myTickets} setOpenTicket={setOpenTicket}/>}
                    {view === 'account' && <CustomerAccountView me={me}/>}
                  </>
                )
        }
      </div>

      {renewVm && <CustRenewModal vm={renewVm} onClose={() => setRenewVm(null)} onSubmit={submitRenewalRequest}/>}
      {setRole && <RoleSwitcher role={role} setRole={setRole} roleNames={roleNames}/>}
    </div>
  )
}

export default CustomerPortal
