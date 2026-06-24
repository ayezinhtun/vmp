// Customer portal — sidebar layout with full features

import React, { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { Avatar, StatusPill, ExpiryCell, formatMMK, SecCheck } from '../../lib/ui'
import { CustRenewModal } from '../modals/CustomerVMModals'

interface CustomerPortalProps {}

const CustomerPortal: React.FC<CustomerPortalProps> = () => {
  const { state, addTask, toast } = useStore()
  const auth = (window as any).useAuth?.()
  const meId = auth?.user?.customerId || 'C-1043'
  const me = state.customers.find(c => c.id === meId) || state.customers.find(c => c.id === 'C-1043')
  if (!me) return <div className="content"><div className="empty"><div className="title">Account not found</div><div className="sub">Try signing out and back in.</div></div></div>
  const myVMs = state.vms.filter(v => v.customer === meId)
  const myInvs = state.invoices.filter(i => i.customer === meId)
  const myTickets = state.tickets.filter(t => t.customer === meId)

  const [view, setView] = useState('dashboard')
  const [detailVm, setDetailVm] = useState<any>(null)
  const [renewVm, setRenewVm] = useState<any>(null)

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
    if (me.kyc !== 'Approved' && ['request', 'vms'].includes(view)) {
      setView('dashboard')
    }
  }, [me.kyc, view])

  return (
    <div className="app">
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
          <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <Icon name="dashboard" className="nav-icon"/>
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${view === 'vms' ? 'active' : ''}`} onClick={() => setView('vms')} disabled={me.kyc !== 'Approved'}>
            <Icon name="server" className="nav-icon"/>
            <span>My VMs</span>
            {me.kyc !== 'Approved' && <Icon name="lock" size={11} style={{ marginLeft: 'auto', opacity: 0.6 }}/>}
          </button>
        </nav>
        <div className="nav-user">
          <Avatar name={me.name} size={28}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="who">{me.name}</div>
            <div className="role">{me.company}</div>
          </div>
          <button className="icon-btn" title="Sign out" onClick={() => { auth?.signout() }}><Icon name="logout"/></button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>Customer portal</span>
            <Icon name="chevron-right" size={12} className="sep"/>
            <strong>{view === 'dashboard' ? 'Dashboard' : 'My VMs'}</strong>
          </div>
          <div className="topbar-spacer"/>
          <div className="text-sm text-mute">{me.company} · <span className="mono">{me.id}</span></div>
        </div>

        {me.kyc !== 'Approved' && (
          <div style={{
            padding: '14px 28px',
            background: me.kyc === 'Rejected' ? 'var(--bad-soft)' : 'var(--warn-soft)',
            borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <Icon name={me.kyc === 'Rejected' ? 'alert' : 'shield'} size={16} style={{ color: me.kyc === 'Rejected' ? 'var(--bad)' : 'oklch(0.55 0.16 75)' }}/>
            <div style={{ flex: 1 }}>
              <div className="fw-7 text-sm" style={{ color: me.kyc === 'Rejected' ? 'var(--bad)' : 'oklch(0.4 0.13 75)' }}>
                {me.kyc === 'Rejected' ? 'KYC verification rejected' : 'Your account is under KYC review'}
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && <CustomerDashboard me={me} myVMs={myVMs} myInvs={myInvs} myTickets={myTickets} setView={setView} setDetailVm={setDetailVm}/>}
        {view === 'vms' && <CustomerVMListView myVMs={myVMs} setDetailVm={setDetailVm} setRenewVm={setRenewVm}/>}
        {detailVm && <CustomerVMDetail vm={detailVm} onClose={() => setDetailVm(null)} onRenew={() => setRenewVm(detailVm)}/>}
      </div>

      {renewVm && <CustRenewModal vm={renewVm} onClose={() => setRenewVm(null)} onSubmit={submitRenewalRequest}/>}
    </div>
  )
}

const CustomerDashboard: React.FC<any> = ({ me, myVMs, myInvs, myTickets, setView, setDetailVm }) => {
  const kycLocked = me.kyc !== 'Approved'
  const activeVMs = myVMs.filter((v: any) => v.status === 'Active').length
  const monthly = myVMs.filter((v: any) => v.status === 'Active').reduce((a: number, v: any) => a + v.priceMonth, 0)
  const openTickets = myTickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress')
  const pendingInv = myInvs.filter((i: any) => i.status !== 'Payment Received')

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Welcome back, {me.name.split(' ')[0]}</h1>
          <p className="page-subtitle">{me.company} · here's your service status today.</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setView('vms')} disabled={kycLocked}>
            {kycLocked && <Icon name="lock" size={11}/>}
            <Icon name="plus" size={13}/>View VMs
          </button>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="metric"><div className="label"><Icon name="server" size={13}/> Active VMs</div><div className="value tnum">{activeVMs}</div><div className="trend">{myVMs.length} total</div></div>
        <div className="metric"><div className="label"><Icon name="invoice" size={13}/> Monthly spend</div><div className="value tnum" style={{ fontSize: 20 }}>MMK {formatMMK(monthly)}</div><div className="trend">{pendingInv.length} pending invoice{pendingInv.length !== 1 ? 's' : ''}</div></div>
        <div className="metric"><div className="label"><Icon name="mail" size={13}/> Open tickets</div><div className="value tnum">{openTickets.length}</div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">My VMs</h3>
          <button className="btn sm" onClick={() => setView('vms')}>View all<Icon name="chevron-right" size={12}/></button>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>VM</th><th>Status</th><th>Spec</th><th>Public IP</th><th>Expires</th></tr></thead>
            <tbody>
              {myVMs.slice(0, 5).map((v: any) => (
                <tr key={v.id} onClick={() => setDetailVm(v)}>
                  <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                  <td><StatusPill status={v.status}/></td>
                  <td className="mono text-xs">{v.vcpu}c · {v.ram}GB · {v.storage}GB</td>
                  <td className="mono text-xs">{v.publicIp}</td>
                  <td><ExpiryCell date={v.expiry}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const CustomerVMListView: React.FC<any> = ({ myVMs, setDetailVm, setRenewVm }) => (
  <div className="content">
    <div className="page-head">
      <div>
        <h1 className="page-title">My VMs</h1>
        <p className="page-subtitle">{myVMs.length} virtual machines · click any row to see details</p>
      </div>
    </div>
    <div className="card">
      <div className="card-body flush">
        <table className="tbl">
          <thead><tr><th>VM</th><th>Status</th><th>Power</th><th>Spec</th><th>Public IP</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {myVMs.map((v: any) => (
              <tr key={v.id} onClick={() => setDetailVm(v)}>
                <td><div className="fw-6">{v.name}</div><div className="text-xs text-mute mono">{v.id}</div></td>
                <td><StatusPill status={v.status}/></td>
                <td><span className="pill"><Icon name={v.powerState === 'Running' ? 'play' : 'pause'} size={10}/>{v.powerState}</span></td>
                <td className="mono text-xs">{v.vcpu}c · {v.ram}GB · {v.storage}GB</td>
                <td className="mono">{v.publicIp}</td>
                <td><ExpiryCell date={v.expiry}/></td>
                <td className="right" onClick={e => e.stopPropagation()}>
                  <button className="btn sm" onClick={() => setRenewVm(v)}><Icon name="refresh" size={11}/>Renew</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

const CustomerVMDetail: React.FC<any> = ({ vm, onClose, onRenew }) => {
  const { state, startVM, stopVM, restartVM, toast } = useStore()
  const vmData = state.vms.find((v: any) => v.id === vm.id) || vm
  const [tab, setTab] = useState('overview')
  const isRunning = vmData.powerState === 'Running'

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="flex center gap-2 mb-1">
            <button className="btn ghost sm" onClick={onClose}><Icon name="chevron-left" size={12}/>Back to VMs</button>
            <span className="mono text-xs text-mute">{vmData.id}</span>
          </div>
          <h1 className="page-title">{vmData.name}</h1>
          <div className="flex gap-2 mt-2">
            <StatusPill status={vmData.status}/>
            <StatusPill status={vmData.type}/>
            <span className="pill"><Icon name={isRunning ? 'play' : 'pause'} size={10}/>{vmData.powerState}</span>
            <SecCheck on={vmData.security}/>
          </div>
        </div>
        <div className="page-actions">
          {isRunning
            ? <button className="btn" onClick={() => stopVM(vmData.id)}><Icon name="pause" size={12}/>Stop</button>
            : <button className="btn primary" onClick={() => startVM(vmData.id)}><Icon name="play" size={12}/>Start</button>
          }
          <button className="btn" onClick={() => restartVM(vmData.id)} disabled={!isRunning}><Icon name="refresh" size={12}/>Restart</button>
          <button className="btn accent" onClick={onRenew}><Icon name="refresh" size={12}/>Renew</button>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          {['overview', 'specs', 'network', 'credentials'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 14 }}>
              <div>
                <div className="text-xs text-mute fw-6 mb-2">Specification</div>
                <dl className="dl">
                  <dt>vCPU</dt><dd>{vmData.vcpu} cores</dd>
                  <dt>RAM</dt><dd>{vmData.ram} GB</dd>
                  <dt>Storage</dt><dd>{vmData.storage} GB SSD</dd>
                  <dt>Bandwidth</dt><dd>{vmData.bandwidth}</dd>
                  <dt>OS</dt><dd>{vmData.os}</dd>
                  <dt>Datacenter</dt><dd>{vmData.datacenter}</dd>
                </dl>
              </div>
              <div>
                <div className="text-xs text-mute fw-6 mb-2">Subscription</div>
                <dl className="dl">
                  <dt>Type</dt><dd>{vmData.type}</dd>
                  <dt>Period</dt><dd>{vmData.subscription}</dd>
                  <dt>Started</dt><dd>{vmData.start}</dd>
                  <dt>Expires</dt><dd>{vmData.expiry}</dd>
                  <dt>Monthly</dt><dd>MMK {formatMMK(vmData.priceMonth)}</dd>
                </dl>
              </div>
            </div>
          </div>
        )}

        {tab === 'network' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 24 }}>
              <div>
                <div className="text-xs text-mute fw-6 mb-2">Public access</div>
                <dl className="dl">
                  <dt>Public IPv4</dt><dd className="mono fw-6">{vmData.publicIp}</dd>
                  <dt>VLAN</dt><dd className="mono">{vmData.vlan}</dd>
                  <dt>Public access</dt><dd>{vmData.publicAccess ? <span className="pill ok"><span className="dot"/>Enabled</span> : <span className="pill"><span className="dot"/>Disabled</span>}</dd>
                  <dt>Firewall policy</dt><dd className="mono">{vmData.firewallPolicy}</dd>
                </dl>
              </div>
              <div>
                <div className="text-xs text-mute fw-6 mb-2">Port forwarding</div>
                <div className="text-mute mono">{vmData.portForward}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'credentials' && (
          <div className="card-body">
            <div style={{ padding: 12, background: 'var(--warn-soft)', borderRadius: 6, fontSize: 12, color: 'oklch(0.4 0.12 75)', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
              <Icon name="lock" size={14}/>
              <div>Credentials are encrypted at rest. Reveal logs an audit event.</div>
            </div>
            <table className="tbl">
              <thead><tr><th>Type</th><th>Username</th><th>Password</th><th></th></tr></thead>
              <tbody>
                <tr>
                  <td>root</td>
                  <td className="mono">root</td>
                  <td className="mono">••••••••••••••••</td>
                  <td className="right">
                    <button className="btn sm" onClick={() => toast('Password copied', 'ok')}><Icon name="check" size={11}/>Copy</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {tab === 'specs' && (
          <div className="card-body">
            <div className="grid-2" style={{ gap: 14 }}>
              <div>
                <div className="text-xs text-mute fw-6 mb-2">Instance</div>
                <dl className="dl">
                  <dt>VM ID</dt><dd className="mono">{vmData.id}</dd>
                  <dt>Hostname</dt><dd className="mono">{vmData.name}</dd>
                  <dt>Power state</dt><dd>{vmData.powerState}</dd>
                  <dt>Datacenter</dt><dd>{vmData.datacenter}</dd>
                  <dt>VLAN</dt><dd className="mono">{vmData.vlan}</dd>
                </dl>
              </div>
              <div>
                <div className="text-xs text-mute fw-6 mb-2">Hardware</div>
                <dl className="dl">
                  <dt>vCPU cores</dt><dd>{vmData.vcpu}</dd>
                  <dt>RAM</dt><dd>{vmData.ram} GB</dd>
                  <dt>Storage</dt><dd>{vmData.storage} GB SSD</dd>
                  <dt>Bandwidth</dt><dd>{vmData.bandwidth}</dd>
                  <dt>Operating system</dt><dd>{vmData.os}</dd>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerPortal
