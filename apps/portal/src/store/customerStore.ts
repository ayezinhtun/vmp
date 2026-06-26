import { useState, useCallback, useEffect } from 'react'
import { MOCK } from '../lib/data'

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

export interface CustomerStoreValue {
  customers: Customer[]
  addCustomer: (c: any) => string
  updateCustomer: (id: string, patch: any) => void
  setKYC: (id: string, decision: string) => void
}

const CUSTOMERS_KEY = '__vpsmm_customers_v1'

const loadPersistedCustomers = () => {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || 'null') } catch { return null }
}

const useCustomerStore = (): CustomerStoreValue => {
  const persisted = loadPersistedCustomers()
  const [customers, setCustomers] = useState<Customer[]>(persisted || MOCK.CUSTOMERS.map((c: Customer) => ({...c})))

  useEffect(() => {
    try { localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers)) } catch {}
  }, [customers])

  const addCustomer = useCallback((c: any) => {
    const maxNum = customers.reduce((m, x) => { const n = parseInt((x.id || '').replace(/\D/g, '')); return n > m ? n : m; }, 1099)
    const id = `C-${maxNum + 1}`
    const newC = {
      id, totalSpend: 0, status: 'Active', kyc: 'Pending', notes: '',
      since: new Date().toISOString().slice(0, 10),
      ...c,
    }
    setCustomers(s => [newC, ...s])
    return id
  }, [customers])

  const updateCustomer = useCallback((id: string, patch: any) => {
    setCustomers(s => s.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [])

  const setKYC = useCallback((id: string, decision: string) => {
    updateCustomer(id, { kyc: decision })
  }, [updateCustomer])

  return {
    customers,
    addCustomer, updateCustomer, setKYC,
  }
}

export default useCustomerStore
