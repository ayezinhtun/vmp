import { useState, useCallback } from 'react'
import { MOCK } from '../lib/data'
import type { Activity } from '../types'

export interface ActivityStoreValue {
  activity: Activity[]
  logActivity: (text: string, kind?: string, actor?: string) => void
}

const useActivityStore = (): ActivityStoreValue => {
  const [activity, setActivity] = useState<Activity[]>(MOCK.ACTIVITY.map((a: Activity) => ({...a})))

  const logActivity = useCallback((text: string, kind = 'vm', actor = 'You') => {
    const now = new Date()
    const ts = `${now.toISOString().slice(0,10)} ${now.toTimeString().slice(0,5)}`
    setActivity(s => [{ ts, actor, kind, text }, ...s])
  }, [])

  return {
    activity,
    logActivity,
  }
}

export default useActivityStore
