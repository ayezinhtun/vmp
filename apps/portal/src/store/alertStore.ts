import { useState, useCallback } from 'react'
import { MOCK } from '../lib/data'
import type { Alert } from '../types'

export interface AlertStoreValue {
  alerts: Alert[]
  markAlertRead: (id: string) => void
  markAllAlertsRead: () => void
}

const useAlertStore = (): AlertStoreValue => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK.ALERTS.map((a: Alert) => ({...a})))

  const markAlertRead = useCallback((id: string) => {
    setAlerts(s => s.map(a => a.id === id ? { ...a, read: true } : a))
  }, [])

  const markAllAlertsRead = useCallback(() => {
    setAlerts(s => s.map(a => ({ ...a, read: true })))
  }, [])

  return {
    alerts,
    markAlertRead, markAllAlertsRead,
  }
}

export default useAlertStore
