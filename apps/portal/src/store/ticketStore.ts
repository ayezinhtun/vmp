import { useState, useCallback } from 'react'

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

export interface TicketStoreValue {
  tickets: Ticket[]
  addTicket: (t: any) => string
  updateTicket: (id: string, patch: any) => void
  setTicketStatus: (id: string, status: string) => void
  replyTicket: (id: string, who: string, body: string) => void
  deleteTicket: (id: string) => void
}

const useTicketStore = (): TicketStoreValue => {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'TKT-2026-118', customer: 'C-1043', subject: 'SSL certificate renewal question', body: 'Hi team, my certificate for yfg-app-01 expires next month. Can you walk me through renewal?', priority: 'Normal', status: 'In Progress', created: '2026-05-25 10:30', updated: '2026-05-26 14:08', assignee: 'Ko Naing', replies: [
      { who: 'Ko Naing', when: '2026-05-25 11:15', body: 'Hi Thiri, we manage the cert via Let\'s Encrypt with auto-renewal. I\'ll send the runbook link.' },
      { who: 'Thiri Ko', when: '2026-05-26 09:42', body: 'Thanks! Could we schedule a 15-min call to walk through it?' },
      { who: 'Ko Naing', when: '2026-05-26 14:08', body: 'Sure — booked 30 May 10:00 ICT. Calendar invite sent.' },
    ]},
    { id: 'TKT-2026-115', customer: 'C-1043', subject: 'Storage upgrade for yfg-db-01', body: 'We\'re running low on disk space. Can we add 500 GB to yfg-db-01?', priority: 'Normal', status: 'Resolved', created: '2026-05-12 09:00', updated: '2026-05-13 16:20', assignee: 'Ko Naing', replies: [
      { who: 'Ko Naing', when: '2026-05-12 10:00', body: 'Confirmed. Scheduling spec change for tonight\'s maintenance window.' },
      { who: 'Ko Naing', when: '2026-05-13 16:20', body: 'Done — storage upgraded to 2 TB. Invoice adjusted accordingly.' },
    ]},
    { id: 'TKT-2026-110', customer: 'C-1042', subject: 'Backup retention policy', body: 'Need to extend backup retention to 30 days for compliance.', priority: 'Urgent', status: 'Open', created: '2026-05-26 15:00', updated: '2026-05-26 15:00', assignee: '—', replies: [] },
  ])

  const addTicket = useCallback((t: any) => {
    const id = `TKT-2026-${String(120 + Math.floor(Math.random() * 80)).padStart(3, '0')}`
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const newT = { id, status: 'Open', priority: 'Normal', assignee: '—', created: now, updated: now, replies: [], ...t }
    setTickets(s => [newT, ...s])
    return id
  }, [])

  const updateTicket = useCallback((id: string, patch: any) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    setTickets(s => s.map(t => t.id === id ? { ...t, ...patch, updated: now } : t))
  }, [])

  const setTicketStatus = useCallback((id: string, status: string) => {
    updateTicket(id, { status })
  }, [updateTicket])

  const replyTicket = useCallback((id: string, who: string, body: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    setTickets(s => s.map(t => t.id === id
      ? { ...t, updated: now, replies: [...t.replies, { who, when: now, body }] }
      : t))
  }, [])

  const deleteTicket = useCallback((id: string) => {
    setTickets(s => s.filter(t => t.id !== id))
  }, [])

  return {
    tickets,
    addTicket, updateTicket, setTicketStatus, replyTicket, deleteTicket,
  }
}

export default useTicketStore
