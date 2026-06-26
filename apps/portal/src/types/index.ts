// Shared type definitions for VM Management Portal

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  kyc: string
  since: string
  totalSpend: number
  salesperson: string
  status: string
  notes: string
}

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
}

export interface Task {
  id: string
  title: string
  customer: string
  vm: string
  type: string
  priority: string
  assignee: string
  team: string
  status: string
  subscription: string
  created: string
  notes: string
  wfStage?: number
  createdVmId?: string
}

export interface Invoice {
  id: string
  customer: string
  vms: string[]
  amount: number
  currency: string
  issued: string
  due: string
  status: string
  method: string
  receipt: string
}

export interface Activity {
  ts: string
  actor: string
  kind: string
  text: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  team: string
  last: string
  status: string
}

export interface Alert {
  id: string
  sev: string
  title: string
  body: string
  ts: string
  read: boolean
  type: string
}

export interface Ticket {
  id: string
  customer: string
  subject: string
  body: string
  priority: string
  status: string
  created: string
  updated: string
  assignee: string
  replies: Array<{ who: string; when: string; body: string }>
}

export interface Toast {
  id: number
  msg: string
  kind: string
  action?: any
}
