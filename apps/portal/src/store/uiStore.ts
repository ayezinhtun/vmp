import { useState, useCallback, useRef } from 'react'
import type { Toast } from '../types'

export interface UIStoreValue {
  toast: (msg: string, kind?: string, action?: any) => void
  toasts: Toast[]
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>
}

const useUIStore = (): UIStoreValue => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(1)

  const toast = useCallback((msg: string, kind = 'info', action?: any) => {
    const id = toastIdRef.current++
    setToasts(t => [...t, { id, msg, kind, action }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200)
  }, [])

  return {
    toast, toasts, setToasts,
  }
}

export default useUIStore
