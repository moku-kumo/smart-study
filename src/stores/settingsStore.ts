import { create } from 'zustand'
import { load, save } from '@/lib/storage'

interface SettingsState {
  soundEnabled: boolean
  timerEnabled: boolean
  difficulty: 1 | 2 | 3
  setSoundEnabled: (v: boolean) => void
  setTimerEnabled: (v: boolean) => void
  setDifficulty: (v: 1 | 2 | 3) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: load('soundEnabled', true),
  timerEnabled: load('timerEnabled', true),
  difficulty: load<1 | 2 | 3>('difficulty', 1),
  setSoundEnabled: (v) => {
    save('soundEnabled', v)
    set({ soundEnabled: v })
  },
  setTimerEnabled: (v) => {
    save('timerEnabled', v)
    set({ timerEnabled: v })
  },
  setDifficulty: (v) => {
    save('difficulty', v)
    set({ difficulty: v })
  },
}))
