import { useState, useCallback } from 'react'
import { MOCK } from '../lib/data'
import type { Invoice } from '../types'

export interface InvoiceStoreValue {
  invoices: Invoice[]
  addInvoice: (i: any) => string
  updateInvoice: (id: string, patch: any) => void
  markPaid: (id: string) => void
}

const useInvoiceStore = (): InvoiceStoreValue => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK.INVOICES.map((i: Invoice) => ({...i, vms: [...i.vms]})))

  const addInvoice = useCallback((i: any) => {
    const id = `INV-2026-${String(420 + Math.floor(Math.random() * 80)).padStart(4, '0')}`
    const newI = {
      id, status: 'Pending', method: '—', receipt: '—', currency: 'MMK',
      issued: new Date().toISOString().slice(0, 10),
      ...i,
    }
    setInvoices(s => [newI, ...s])
    return id
  }, [])

  const updateInvoice = useCallback((id: string, patch: any) => {
    setInvoices(s => s.map(i => i.id === id ? { ...i, ...patch } : i))
  }, [])

  const markPaid = useCallback((id: string) => {
    if (!invoices.find(i => i.id === id)) return
    updateInvoice(id, { status: 'Payment Received', receipt: `RCT-${id.slice(4)}` })
  }, [invoices, updateInvoice])

  return {
    invoices,
    addInvoice, updateInvoice, markPaid,
  }
}

export default useInvoiceStore
