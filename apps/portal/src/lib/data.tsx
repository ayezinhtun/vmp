// Mock data for VM Management Portal

export const TODAY = new Date('2026-05-27')

export const daysFromNow = (n: number) => {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

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

export const CUSTOMERS: Customer[] = [
  { id: 'C-1042', name: 'Aung Min Htet', company: 'Mandalay Logistics Co., Ltd', email: 'aung.mh@mlc.com.mm', phone: '+95 9 7716 4421', kyc: 'Approved', since: '2024-03-14', totalSpend: 4820000, salesperson: 'Su Su', status: 'Active', notes: 'Long-term client. Prefers Ubuntu 22.04. Pays via KBZ.' },
  { id: 'C-1043', name: 'Thiri Ko', company: 'Yangon Fintech Group', email: 'thiri@yfg.io', phone: '+95 9 9981 0023', kyc: 'Approved', since: '2024-07-02', totalSpend: 12400000, salesperson: 'Ko Naing', status: 'Active', notes: 'Heavy user. 6 production VMs. Renewal contact: Thiri directly.' },
  { id: 'C-1044', name: 'Phyo Wai', company: 'Bagan Hotels & Resorts', email: 'pwai@baganhotels.com', phone: '+95 9 4422 1187', kyc: 'Pending', since: '2026-05-22', totalSpend: 0, salesperson: 'Su Su', status: 'Active', notes: 'New signup. KYC document blurry — requested re-upload.' },
  { id: 'C-1045', name: 'Khin Mar Soe', company: 'Sittwe Marine Trading', email: 'kms@sittwemarine.co', phone: '+95 9 7700 8841', kyc: 'Approved', since: '2025-01-09', totalSpend: 2100000, salesperson: 'Ko Naing', status: 'Active', notes: '' },
  { id: 'C-1046', name: 'Zaw Lin Tun', company: 'NayPyiTaw Dev Studio', email: 'zaw@npdstudio.dev', phone: '+95 9 4400 5566', kyc: 'Approved', since: '2025-04-18', totalSpend: 1850000, salesperson: 'Su Su', status: 'Active', notes: 'Dev/staging environments only.' },
  { id: 'C-1047', name: 'Hnin Yu Wai', company: 'Pyay Agritech', email: 'hnin@pyayagri.mm', phone: '+95 9 7766 0091', kyc: 'Approved', since: '2025-09-30', totalSpend: 980000, salesperson: 'Ko Naing', status: 'Active', notes: '' },
  { id: 'C-1048', name: 'Min Thant', company: 'Taunggyi Cloud Co.', email: 'minthant@tgycloud.mm', phone: '+95 9 9988 3322', kyc: 'Rejected', since: '2026-05-15', totalSpend: 0, salesperson: 'Su Su', status: 'Inactive', notes: 'ID document mismatch with company registration.' },
  { id: 'C-1049', name: 'Ei Phyu', company: 'Mawlamyine Media', email: 'ei.phyu@mmedia.mm', phone: '+95 9 4411 7720', kyc: 'Approved', since: '2025-11-04', totalSpend: 640000, salesperson: 'Ko Naing', status: 'Active', notes: '' },
  { id: 'C-1050', name: 'Soe Moe Aung', company: 'Yangon SaaS Labs', email: 'sma@yslabs.io', phone: '+95 9 7788 2200', kyc: 'Pending', since: '2026-05-25', totalSpend: 0, salesperson: 'Su Su', status: 'Active', notes: 'KYC submitted 2 days ago. Awaiting admin review.' },
]

export const VMS: VM[] = [
  { id: 'VM-2087', name: 'mlc-erp-prod-01', customer: 'C-1042', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 8, ram: 32, storage: 500, bandwidth: '1 Gbps', os: 'Ubuntu 22.04 LTS', publicAccess: true, interconnect: ['VM-2088'], portForward: '443→443, 22→2222', publicIp: '203.81.64.122', vlan: 'VLAN-204', datacenter: 'Yangon DC1', node: 'pve-node-03', start: '2024-03-20', expiry: daysFromNow(180), firewallPolicy: 'fw-mlc-erp', backup: 'Daily 02:00, 7d retention', proxmoxFlag: 'P', security: true, notes: 'ERP production — high priority. Critical service.', subscription: '1 year', priceMonth: 280000 },
  { id: 'VM-2088', name: 'mlc-db-prod-01', customer: 'C-1042', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 4, ram: 16, storage: 1000, bandwidth: '1 Gbps', os: 'Ubuntu 22.04 LTS', publicAccess: false, interconnect: ['VM-2087'], portForward: '—', publicIp: '—', vlan: 'VLAN-204', datacenter: 'Yangon DC1', node: 'pve-node-03', start: '2024-03-20', expiry: daysFromNow(180), firewallPolicy: 'fw-mlc-db', backup: 'Daily 03:00, 14d retention', proxmoxFlag: 'P', security: true, notes: 'PostgreSQL primary.', subscription: '1 year', priceMonth: 180000 },
  { id: 'VM-2091', name: 'yfg-app-01', customer: 'C-1043', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 16, ram: 64, storage: 1000, bandwidth: '1 Gbps', os: 'Debian 12', publicAccess: true, interconnect: ['VM-2092', 'VM-2093'], portForward: '80→80, 443→443', publicIp: '203.81.64.130', vlan: 'VLAN-211', datacenter: 'Yangon DC1', node: 'pve-node-05', start: '2024-08-01', expiry: daysFromNow(7), firewallPolicy: 'fw-yfg-app', backup: 'Hourly snapshots, 48h retention', proxmoxFlag: 'P', security: true, notes: '', subscription: '6 months', priceMonth: 520000 },
  { id: 'VM-2092', name: 'yfg-db-01', customer: 'C-1043', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 8, ram: 32, storage: 2000, bandwidth: '1 Gbps', os: 'Ubuntu 22.04 LTS', publicAccess: false, interconnect: ['VM-2091'], portForward: '—', publicIp: '—', vlan: 'VLAN-211', datacenter: 'Yangon DC1', node: 'pve-node-05', start: '2024-08-01', expiry: daysFromNow(7), firewallPolicy: 'fw-yfg-db', backup: 'Daily 02:00, 30d retention', proxmoxFlag: 'P', security: true, notes: '', subscription: '6 months', priceMonth: 380000 },
  { id: 'VM-2093', name: 'yfg-cache-01', customer: 'C-1043', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 2, ram: 8, storage: 100, bandwidth: '1 Gbps', os: 'Alpine 3.19', publicAccess: false, interconnect: ['VM-2091'], portForward: '—', publicIp: '—', vlan: 'VLAN-211', datacenter: 'Yangon DC1', node: 'pve-node-05', start: '2024-08-01', expiry: daysFromNow(7), firewallPolicy: 'fw-yfg-cache', backup: 'None', proxmoxFlag: 'P', security: true, notes: 'Redis cache.', subscription: '6 months', priceMonth: 120000 },
  { id: 'VM-2104', name: 'baganhotels-trial', customer: 'C-1044', type: 'Trial', status: 'Pending', powerState: 'Stopped', vcpu: 4, ram: 8, storage: 100, bandwidth: '100 Mbps', os: 'Ubuntu 22.04 LTS', publicAccess: true, interconnect: [], portForward: '443→443', publicIp: 'pending', vlan: 'pending', datacenter: 'Yangon DC1', node: '—', start: '—', expiry: '—', firewallPolicy: 'pending', backup: 'None', proxmoxFlag: '', security: false, notes: 'Waiting on KYC approval.', subscription: '14-day trial', priceMonth: 0 },
  { id: 'VM-2099', name: 'sittwe-web-01', customer: 'C-1045', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 4, ram: 16, storage: 200, bandwidth: '500 Mbps', os: 'Rocky Linux 9', publicAccess: true, interconnect: [], portForward: '80→80, 443→443', publicIp: '203.81.64.155', vlan: 'VLAN-220', datacenter: 'Yangon DC1', node: 'pve-node-02', start: '2025-01-15', expiry: daysFromNow(30), firewallPolicy: 'fw-sittwe-web', backup: 'Daily 04:00, 7d retention', proxmoxFlag: 'P', security: true, notes: '', subscription: '1 year', priceMonth: 220000 },
  { id: 'VM-2095', name: 'npd-staging', customer: 'C-1046', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 4, ram: 16, storage: 200, bandwidth: '500 Mbps', os: 'Ubuntu 24.04 LTS', publicAccess: true, interconnect: ['VM-2096'], portForward: '443→443, 22→22', publicIp: '203.81.64.140', vlan: 'VLAN-215', datacenter: 'Yangon DC1', node: 'pve-node-04', start: '2025-05-01', expiry: daysFromNow(1), firewallPolicy: 'fw-npd-staging', backup: 'Weekly Sun 02:00, 4w retention', proxmoxFlag: 'P', security: true, notes: '', subscription: '1 year', priceMonth: 180000 },
  { id: 'VM-2096', name: 'npd-dev', customer: 'C-1046', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 2, ram: 8, storage: 100, bandwidth: '500 Mbps', os: 'Ubuntu 24.04 LTS', publicAccess: false, interconnect: ['VM-2095'], portForward: '—', publicIp: '—', vlan: 'VLAN-215', datacenter: 'Yangon DC1', node: 'pve-node-04', start: '2025-05-01', expiry: daysFromNow(1), firewallPolicy: 'fw-npd-dev', backup: 'None', proxmoxFlag: 'P', security: false, notes: 'Security review pending.', subscription: '1 year', priceMonth: 90000 },
  { id: 'VM-2101', name: 'pyay-agri-api', customer: 'C-1047', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 4, ram: 8, storage: 200, bandwidth: '500 Mbps', os: 'Debian 12', publicAccess: true, interconnect: [], portForward: '443→443', publicIp: '203.81.64.161', vlan: 'VLAN-225', datacenter: 'Yangon DC1', node: 'pve-node-02', start: '2025-10-01', expiry: daysFromNow(120), firewallPolicy: 'fw-pyay-api', backup: 'Daily 03:00, 14d retention', proxmoxFlag: 'P', security: true, notes: '', subscription: '1 year', priceMonth: 160000 },
  { id: 'VM-2089', name: 'mlc-staging', customer: 'C-1042', type: 'Paid', status: 'Suspended', powerState: 'Stopped', vcpu: 2, ram: 8, storage: 100, bandwidth: '500 Mbps', os: 'Ubuntu 22.04 LTS', publicAccess: false, interconnect: [], portForward: '—', publicIp: '203.81.64.123', vlan: 'VLAN-204', datacenter: 'Yangon DC1', node: 'pve-node-03', start: '2024-04-10', expiry: daysFromNow(-3), firewallPolicy: 'fw-mlc-staging', backup: 'None', proxmoxFlag: '', security: true, notes: 'Payment overdue 3 days. Suspended on schedule.', subscription: '1 year', priceMonth: 90000 },
  { id: 'VM-2107', name: 'mmedia-web', customer: 'C-1049', type: 'Paid', status: 'Active', powerState: 'Running', vcpu: 2, ram: 8, storage: 150, bandwidth: '500 Mbps', os: 'Ubuntu 22.04 LTS', publicAccess: true, interconnect: [], portForward: '80→80, 443→443', publicIp: '203.81.64.170', vlan: 'VLAN-230', datacenter: 'Yangon DC1', node: 'pve-node-02', start: '2025-11-08', expiry: daysFromNow(60), firewallPolicy: 'fw-mmedia', backup: 'Daily 04:30, 7d retention', proxmoxFlag: 'P', security: true, notes: '', subscription: '1 year', priceMonth: 140000 },
  { id: 'VM-2082', name: 'legacy-client-x', customer: 'C-1042', type: 'Paid', status: 'Expired', powerState: 'Stopped', vcpu: 2, ram: 4, storage: 50, bandwidth: '500 Mbps', os: 'CentOS 7', publicAccess: false, interconnect: [], portForward: '—', publicIp: '—', vlan: 'VLAN-204', datacenter: 'Yangon DC1', node: 'pve-node-01', start: '2023-08-01', expiry: daysFromNow(-10), firewallPolicy: '—', backup: 'None', proxmoxFlag: '', security: false, notes: 'Archive — pending termination.', subscription: 'Terminated', priceMonth: 0 },
  { id: 'VM-2110', name: 'ysl-prototype', customer: 'C-1050', type: 'Trial', status: 'Pending', powerState: 'Stopped', vcpu: 2, ram: 4, storage: 50, bandwidth: '100 Mbps', os: 'Ubuntu 24.04 LTS', publicAccess: true, interconnect: [], portForward: 'pending', publicIp: 'pending', vlan: 'pending', datacenter: 'Yangon DC1', node: '—', start: '—', expiry: '—', firewallPolicy: 'pending', backup: 'None', proxmoxFlag: '', security: false, notes: 'Provisioning blocked on KYC.', subscription: '14-day trial', priceMonth: 0 },
]

export const TASKS: Task[] = [
  { id: 'TSK-3201', title: 'Provision VM-2104 (baganhotels-trial)', customer: 'C-1044', vm: 'VM-2104', type: 'New', priority: 'Normal', assignee: 'Ko Thein', team: 'Provisioning', status: 'Blocked', subscription: '14-day trial', created: '2026-05-22', notes: 'Waiting on KYC approval before provisioning.' },
  { id: 'TSK-3202', title: 'Renewal: VM-2091, VM-2092, VM-2093 (YFG cluster)', customer: 'C-1043', vm: 'VM-2091', type: 'Renewal', priority: 'Urgent', assignee: 'Ko Naing', team: 'Sales', status: 'In Progress', subscription: '6 months', created: '2026-05-20', notes: 'Customer confirmed renewal. Invoice sent.' },
  { id: 'TSK-3203', title: 'Spec upgrade: VM-2087 (4→8 vCPU, 16→32 RAM)', customer: 'C-1042', vm: 'VM-2087', type: 'Upgrade', priority: 'Normal', assignee: 'Ko Thein', team: 'Provisioning', status: 'Done', subscription: '—', created: '2026-05-15', notes: 'Completed during maintenance window.' },
  { id: 'TSK-3204', title: 'Renewal reminder: VM-2095, VM-2096 (NPD)', customer: 'C-1046', vm: 'VM-2095', type: 'Renewal', priority: 'Urgent', assignee: 'Su Su', team: 'Sales', status: 'Pending', subscription: '1 year', created: '2026-05-26', notes: 'Expires tomorrow. Follow up with customer.' },
  { id: 'TSK-3205', title: 'Terminate VM-2082 (legacy-client-x)', customer: 'C-1042', vm: 'VM-2082', type: 'Terminate', priority: 'Normal', assignee: 'Ko Thein', team: 'Provisioning', status: 'In Progress', subscription: '—', created: '2026-05-17', notes: 'Interface disabled. Awaiting 7-day grace period.' },
  { id: 'TSK-3206', title: 'Provision VM-2110 (ysl-prototype)', customer: 'C-1050', vm: 'VM-2110', type: 'New', priority: 'Normal', assignee: '—', team: 'Provisioning', status: 'Pending', subscription: '14-day trial', created: '2026-05-25', notes: 'KYC submitted. Awaiting review.' },
  { id: 'TSK-3207', title: 'Backup config: VM-2099 (sittwe-web-01)', customer: 'C-1045', vm: 'VM-2099', type: 'New', priority: 'Normal', assignee: 'Ko Thein', team: 'Provisioning', status: 'Done', subscription: '—', created: '2026-05-10', notes: 'Daily backup configured.' },
]

export const INVOICES: Invoice[] = [
  { id: 'INV-2026-0418', customer: 'C-1043', vms: ['VM-2091', 'VM-2092', 'VM-2093'], amount: 6120000, currency: 'MMK', issued: '2026-05-18', due: '2026-05-28', status: 'Customer Transferred', method: 'KBZ Pay', receipt: 'RCT-2026-0418' },
  { id: 'INV-2026-0417', customer: 'C-1042', vms: ['VM-2087', 'VM-2088'], amount: 5520000, currency: 'MMK', issued: '2026-05-15', due: '2026-05-25', status: 'Payment Received', method: 'AYA Bank', receipt: 'RCT-2026-0417' },
  { id: 'INV-2026-0419', customer: 'C-1046', vms: ['VM-2095', 'VM-2096'], amount: 3240000, currency: 'MMK', issued: '2026-05-22', due: '2026-06-01', status: 'Pending', method: '—', receipt: '—' },
  { id: 'INV-2026-0416', customer: 'C-1045', vms: ['VM-2099'], amount: 2640000, currency: 'MMK', issued: '2026-05-10', due: '2026-05-20', status: 'Payment Received', method: 'KBZ Pay', receipt: 'RCT-2026-0416' },
  { id: 'INV-2026-0415', customer: 'C-1042', vms: ['VM-2089'], amount: 1080000, currency: 'MMK', issued: '2026-05-08', due: '2026-05-18', status: 'Overdue', method: '—', receipt: '—' },
  { id: 'INV-2026-0414', customer: 'C-1047', vms: ['VM-2101'], amount: 1920000, currency: 'MMK', issued: '2026-05-05', due: '2026-05-15', status: 'Payment Received', method: 'CB Bank', receipt: 'RCT-2026-0414' },
  { id: 'INV-2026-0413', customer: 'C-1049', vms: ['VM-2107'], amount: 1680000, currency: 'MMK', issued: '2026-04-28', due: '2026-05-08', status: 'Payment Received', method: 'KBZ Pay', receipt: 'RCT-2026-0413' },
]

export const ACTIVITY: Activity[] = [
  { ts: '2026-05-27 09:42', actor: 'cron', kind: 'alert', text: 'Expiry alert sent — VM-2095, VM-2096 expire in 1 day.' },
  { ts: '2026-05-27 09:14', actor: 'Ko Thein', kind: 'vm', text: 'VM-2089 suspended — payment overdue 3 days.' },
  { ts: '2026-05-27 08:50', actor: 'Su Su', kind: 'task', text: 'Created TSK-3204 — Renewal reminder for NPD.' },
  { ts: '2026-05-26 17:21', actor: 'Ko Naing', kind: 'finance', text: 'Invoice INV-2026-0418 marked Customer Transferred.' },
  { ts: '2026-05-26 14:08', actor: 'system', kind: 'alert', text: 'KYC submission — C-1050 (Yangon SaaS Labs).' },
  { ts: '2026-05-26 11:33', actor: 'Ko Thein', kind: 'vm', text: 'VM-2087 spec upgrade completed (4→8 vCPU).' },
  { ts: '2026-05-26 10:02', actor: 'Su Su', kind: 'customer', text: 'C-1044 KYC rejected — document re-upload requested.' },
  { ts: '2026-05-25 16:45', actor: 'cron', kind: 'alert', text: 'Expiry alert sent — VM-2091/92/93 expire in 7 days.' },
  { ts: '2026-05-25 15:19', actor: 'Ko Thein', kind: 'vm', text: 'VM-2099 backup schedule updated to daily 04:00.' },
  { ts: '2026-05-25 09:00', actor: 'system', kind: 'finance', text: 'Invoice INV-2026-0419 generated for C-1046.' },
]

export const TEAM: TeamMember[] = [
  { id: 'U-01', name: 'Ko Thein', email: 'kothein@vpsmm.co', role: 'Engineer', team: 'Provisioning', last: '2 min ago', status: 'Active' },
  { id: 'U-02', name: 'Su Su', email: 'susu@vpsmm.co', role: 'Sales', team: 'Sales', last: '14 min ago', status: 'Active' },
  { id: 'U-03', name: 'Ko Naing', email: 'konaing@vpsmm.co', role: 'Sales', team: 'Sales', last: '1 hr ago', status: 'Active' },
  { id: 'U-04', name: 'Daw Aye', email: 'aye.f@vpsmm.co', role: 'Finance', team: 'Finance', last: '3 hr ago', status: 'Active' },
  { id: 'U-05', name: 'Min Khant', email: 'mkhant@vpsmm.co', role: 'Admin', team: 'Management', last: '8 hr ago', status: 'Active' },
  { id: 'U-06', name: 'Aye Chan', email: 'ayechan@vpsmm.co', role: 'Engineer', team: 'Network', last: '1 day ago', status: 'Active' },
]

export const ALERTS: Alert[] = [
  { id: 'AL-001', sev: 'urgent', title: 'VM-2095, VM-2096 expire in 1 day', body: 'NPD Dev Studio cluster — no renewal confirmed yet.', ts: '2 hr ago', read: false, type: 'expiry' },
  { id: 'AL-002', sev: 'warn', title: 'VM-2091/92/93 expire in 7 days', body: 'YFG cluster — invoice sent, awaiting payment.', ts: '1 day ago', read: false, type: 'expiry' },
  { id: 'AL-003', sev: 'info', title: 'KYC pending review: C-1050', body: 'Yangon SaaS Labs submitted KYC. Documents look complete.', ts: '1 day ago', read: false, type: 'kyc' },
  { id: 'AL-004', sev: 'urgent', title: 'INV-2026-0415 overdue', body: 'C-1042 payment 9 days late. VM-2089 suspended.', ts: '2 days ago', read: true, type: 'finance' },
  { id: 'AL-005', sev: 'info', title: 'New task assigned: TSK-3204', body: 'Renewal reminder for NPD Dev Studio.', ts: '2 days ago', read: true, type: 'task' },
  { id: 'AL-006', sev: 'info', title: 'Google Form submission received', body: 'New VM request from C-1043 (Yangon Fintech Group).', ts: '3 days ago', read: true, type: 'form' },
]

;(window as any).MOCK = { CUSTOMERS, VMS, TASKS, INVOICES, ACTIVITY, TEAM, ALERTS, TODAY, daysFromNow }
