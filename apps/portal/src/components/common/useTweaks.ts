import { useState } from 'react'

interface TweakState {
  role: string
  theme: string
  accent: string
  roleNames: Record<string, string>
}

export const useTweaks = (initial: TweakState) => {
  const [tw, setTw] = useState<TweakState>(initial)
  const setTweak = (keyOrEdits: keyof TweakState | Partial<TweakState>, value?: any) => {
    setTw(prev => {
      if (typeof keyOrEdits === 'object' && keyOrEdits !== null) {
        return { ...prev, ...keyOrEdits }
      }
      return { ...prev, [keyOrEdits]: value }
    })
  }
  return [tw, setTweak] as const
}

export type { TweakState }
