import React, { useState } from 'react'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'

interface ApiKeysViewProps {
  openModal: (kind: string, props?: any) => void
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({ openModal }) => {
  const { toast } = useUIStore()
  const [keys, setKeys] = useState([
    { id: 'k-001', name: 'Internal — Provisioning bot', key: 'vpsmm_live_a8x9...c3k4', created: '2026-01-12', lastUsed: '2 min ago', scopes: ['vm:write', 'task:write'] },
    { id: 'k-002', name: 'Proxmox sync worker', key: 'vpsmm_live_p7q2...m1n8', created: '2026-02-04', lastUsed: '14s ago', scopes: ['vm:read', 'vm:write'] },
    { id: 'k-003', name: 'Finance — billing export', key: 'vpsmm_live_f4r6...t9w2', created: '2026-03-22', lastUsed: '1d ago', scopes: ['invoice:read'] },
    { id: 'k-004', name: 'Old portal (deprecated)', key: 'vpsmm_live_o2k1...d8s5', created: '2025-08-15', lastUsed: '3 months ago', scopes: ['*:read'] },
  ])
  const [hooks, setHooks] = useState([
    { id: 'wh-001', url: 'https://hooks.slack.com/services/T0.../B0.../xy', events: ['vm.suspended', 'invoice.overdue'], status: 'Active', last200: '14 min ago' },
    { id: 'wh-002', url: 'https://msteams.vpsmm.co/webhook/incoming', events: ['kyc.submitted', 'task.created'], status: 'Active', last200: '32 min ago' },
    { id: 'wh-003', url: 'https://internal.vpsmm.co/audit/sink', events: ['*'], status: 'Failing', last200: '2 days ago' },
  ])
  const [show, setShow] = useState<string | null>(null)

  const revoke = (id: string) => {
    setKeys(keys.filter((k: any) => k.id !== id))
    toast('API key revoked', 'bad')
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">API keys & webhooks</h1>
          <p className="page-subtitle">{keys.length} active keys · {hooks.length} webhook destinations</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => openModal('newapikey', { onAdd: (k: any) => { const id = `k-${String(keys.length + 1).padStart(3, '0')}`; setKeys([{ id, name: k.name, scopes: k.scopes, key: `vpsmm_live_${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`, created: new Date().toISOString().slice(0, 10), lastUsed: 'never' }, ...keys]); } })}><Icon name="plus" size={13}/>New API key</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">API keys</h3></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Key</th><th>Scopes</th><th>Created</th><th>Last used</th><th></th></tr></thead>
            <tbody>
              {keys.map((k: any) => (
                <tr key={k.id}>
                  <td className="fw-6">{k.name}</td>
                  <td className="mono text-xs" style={{ cursor: 'pointer' }} onClick={() => setShow(show === k.id ? null : k.id)}>
                    {show === k.id ? 'vpsmm_live_a8x9b2c4d3kf5jh6...' : k.key}
                  </td>
                  <td><div className="flex gap-1 wrap">{k.scopes.map((s: string) => <span key={s} className="id-tag">{s}</span>)}</div></td>
                  <td className="tnum text-sm">{k.created}</td>
                  <td className="text-sm text-mute">{k.lastUsed}</td>
                  <td className="right"><button className="btn sm danger" onClick={() => revoke(k.id)}>Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Webhooks</h3>
          <button className="btn sm" onClick={() => { setHooks([...hooks, { id: 'wh-' + String(hooks.length + 1).padStart(3, '0'), url: 'https://hooks.new-endpoint.local/incoming', events: ['vm.created'], status: 'Active', last200: 'never' }]); toast('Webhook endpoint added', 'ok'); }}><Icon name="plus" size={11}/>Add endpoint</button>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Endpoint URL</th><th>Events</th><th>Status</th><th>Last 200</th><th></th></tr></thead>
            <tbody>
              {hooks.map((h: any) => (
                <tr key={h.id}>
                  <td className="mono text-xs" style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.url}</td>
                  <td><div className="flex gap-1 wrap">{h.events.map((e: string) => <span key={e} className="id-tag">{e}</span>)}</div></td>
                  <td><span className={`pill ${h.status === 'Active' ? 'ok' : 'bad'}`}><span className="dot"/>{h.status}</span></td>
                  <td className="text-sm text-mute">{h.last200}</td>
                  <td className="right">
                    <button className="btn sm" onClick={() => toast(`Test event sent to ${h.id}`, 'info')}>Test</button>
                    <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => toast('Webhook editor opened', 'info')}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
