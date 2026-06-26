import { useState, useCallback } from 'react'
import { MOCK } from '../lib/data'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  team: string
  last: string
  status: string
}

export interface TeamStoreValue {
  team: TeamMember[]
  addMember: (m: any) => void
  updateMember: (id: string, patch: any) => void
  removeMember: (id: string) => void
}

const useTeamStore = (): TeamStoreValue => {
  const [team, setTeam] = useState<TeamMember[]>(MOCK.TEAM.map((t: TeamMember) => ({...t})))

  const addMember = useCallback((m: any) => {
    const id = `U-${String(team.length + 1).padStart(2, '0')}`
    setTeam(s => [...s, { id, last: 'just now', status: 'Active', ...m }])
  }, [team])

  const updateMember = useCallback((id: string, patch: any) => {
    setTeam(s => s.map(m => m.id === id ? { ...m, ...patch } : m))
  }, [])

  const removeMember = useCallback((id: string) => {
    setTeam(s => s.filter(m => m.id !== id))
  }, [])

  return {
    team,
    addMember, updateMember, removeMember,
  }
}

export default useTeamStore
