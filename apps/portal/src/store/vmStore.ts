import { useState, useCallback } from 'react'
import { MOCK } from '../lib/data'

export interface VM {
  id: string
  name: string
  customer: string
  type: string
  status: string
  powerState: string
  vcpu: number
  ram: number
  storage: number
  bandwidth: string
  os: string
  publicAccess: boolean
  interconnect: string[]
  portForward: string
  publicIp: string
  vlan: string
  datacenter: string
  node: string
  start: string
  expiry: string
  firewallPolicy: string
  backup: string
  proxmoxFlag: string
  security: boolean
  notes: string
  subscription: string
  priceMonth: number
  tags?: string[]
}

export interface VMStoreValue {
  vms: VM[]
  addVM: (vm: any) => string
  updateVM: (id: string, patch: any) => void
  deleteVM: (id: string) => void
  setVMStatus: (id: string, status: string, powerState?: string) => void
  renew: (id: string, months?: number) => void
  bulkAction: (ids: string[], action: string) => void
  startVM: (id: string) => void
  stopVM: (id: string) => void
  restartVM: (id: string) => void
  snapshotVM: (id: string, name?: string) => void
  updateVMTags: (id: string, tags: string[]) => void
  updateVMNotes: (id: string, notes: string) => void
}

const useVMStore = (): VMStoreValue => {
  const [vms, setVms] = useState<VM[]>(MOCK.VMS.map((v: VM) => ({...v, interconnect: [...v.interconnect], tags: (v as any).tags || []})))

  const addVM = useCallback((vm: any) => {
    const maxNum = vms.reduce((m, v) => { const n = parseInt((v.id || '').replace(/\D/g, '')); return n > m ? n : m; }, 2199)
    const id = `VM-${maxNum + 1}`
    const newVM = { id, ...vm }
    setVms(s => [newVM, ...s])
    return id
  }, [vms])

  const updateVM = useCallback((id: string, patch: any) => {
    setVms(s => s.map(v => v.id === id ? { ...v, ...patch } : v))
  }, [])

  const deleteVM = useCallback((id: string) => {
    setVms(s => s.filter(v => v.id !== id))
  }, [])

  const setVMStatus = useCallback((id: string, status: string, powerState?: string) => {
    updateVM(id, { status, ...(powerState ? { powerState } : {}) })
  }, [updateVM])

  const renew = useCallback((id: string, months = 12) => {
    const vm = vms.find(v => v.id === id)
    if (!vm) return
    const base = vm.expiry && vm.expiry !== '—' ? new Date(vm.expiry) : new Date(MOCK.TODAY)
    base.setMonth(base.getMonth() + months)
    updateVM(id, { expiry: base.toISOString().slice(0, 10), status: 'Active', powerState: 'Running' })
  }, [vms, updateVM])

  const bulkAction = useCallback((ids: string[], action: string) => {
    if (action === 'suspend') ids.forEach(id => setVMStatus(id, 'Suspended', 'Stopped'))
    if (action === 'activate') ids.forEach(id => setVMStatus(id, 'Active', 'Running'))
    if (action === 'terminate') ids.forEach(id => setVMStatus(id, 'Expired', 'Stopped'))
    if (action === 'renew') {
      const newExpiry = new Date(MOCK.TODAY)
      newExpiry.setFullYear(newExpiry.getFullYear() + 1)
      ids.forEach(id => updateVM(id, { expiry: newExpiry.toISOString().slice(0, 10), status: 'Active' }))
    }
  }, [setVMStatus, updateVM])

  const startVM = useCallback((id: string) => {
    const vm = vms.find(v => v.id === id)
    updateVM(id, { powerState: 'Running', status: vm?.status === 'Suspended' ? 'Active' : vm?.status })
  }, [vms, updateVM])

  const stopVM = useCallback((id: string) => {
    updateVM(id, { powerState: 'Stopped' })
  }, [updateVM])

  const restartVM = useCallback((_id: string) => {
  }, [])

  const snapshotVM = useCallback((_id: string, _name?: string) => {
  }, [])

  const updateVMTags = useCallback((id: string, tags: string[]) => updateVM(id, { tags }), [updateVM])
  const updateVMNotes = useCallback((id: string, notes: string) => updateVM(id, { notes }), [updateVM])

  return {
    vms,
    addVM, updateVM, deleteVM, setVMStatus, renew, bulkAction,
    startVM, stopVM, restartVM, snapshotVM, updateVMTags, updateVMNotes,
  }
}

export default useVMStore
