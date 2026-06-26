import { useState, useCallback } from 'react'
import { MOCK } from '../lib/data'
import type { Task } from '../types'

export interface TaskStoreValue {
  tasks: Task[]
  addTask: (t: any) => string
  updateTask: (id: string, patch: any) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: string) => void
  advanceProvision: (id: string, parsedSpec?: any, addVM?: (vm: any) => string, updateVM?: (id: string, patch: any) => void) => void
  setProvisionStage: (id: string, stage: number) => void
}

const useTaskStore = (): TaskStoreValue => {
  const [tasks, setTasks] = useState<Task[]>(MOCK.TASKS.map((t: Task) => ({...t})))

  const addTask = useCallback((t: any) => {
    const id = `TSK-${3300 + Math.floor(Math.random() * 600)}`
    const newT = {
      id, status: 'Pending', priority: 'Normal', assignee: '—', team: 'Provisioning',
      created: new Date().toISOString().slice(0, 10),
      notes: '',
      ...t,
    }
    setTasks(s => [newT, ...s])
    return id
  }, [])

  const updateTask = useCallback((id: string, patch: any) => {
    setTasks(s => s.map(t => t.id === id ? { ...t, ...patch } : t))
  }, [])

  const advanceProvision = useCallback((id: string, parsedSpec?: any, addVM?: (vm: any) => string, updateVM?: (id: string, patch: any) => void) => {
    const t = tasks.find(x => x.id === id)
    if (!t) return
    const stage = (t.wfStage || 0) + 1
    const notes: any = {
      1: { team: 'Sales', msg: `Sales reviewing ${t.id} — KYC check in progress`, kind: 'task', status: 'In Progress' },
      2: { team: 'Engineering', msg: `KYC approved — Engineering notified`, kind: 'customer', status: 'In Progress' },
      3: { team: 'Engineering', msg: `System team provisioning VM`, kind: 'vm', status: 'In Progress' },
      4: { team: 'Network', msg: `Network team configuring firewall rules`, kind: 'vm', status: 'In Progress' },
      5: { team: 'Engineering', msg: `KT testing VM & uploading credentials`, kind: 'vm', status: 'In Progress' },
      6: { team: 'Customer', msg: `VM is ready — customer notified ✓`, kind: 'customer', status: 'Done' },
    }[stage]

    let patch: any = { wfStage: stage, status: notes?.status || t.status }

    if (stage === 3 && !t.createdVmId && parsedSpec && addVM) {
      const vmId = addVM(parsedSpec)
      patch.createdVmId = vmId
    }
    if (stage === 6 && t.createdVmId && updateVM) {
      updateVM(t.createdVmId, { status: 'Active', powerState: 'Running' })
    }

    setTasks(s => s.map(x => x.id === id ? { ...x, ...patch } : x))
  }, [tasks])

  const setProvisionStage = useCallback((id: string, stage: number) => {
    setTasks(s => s.map(x => x.id === id ? { ...x, wfStage: stage } : x))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(s => s.filter(t => t.id !== id))
  }, [])

  const moveTask = useCallback((id: string, status: string) => {
    const t = tasks.find(t => t.id === id)
    if (!t || t.status === status) return
    updateTask(id, { status })
  }, [tasks, updateTask])

  return {
    tasks,
    addTask, updateTask, deleteTask, moveTask, advanceProvision, setProvisionStage,
  }
}

export default useTaskStore
