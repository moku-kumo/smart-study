import { create } from 'zustand'
import { load, save } from '@/lib/storage'

interface ProgressState {
  stars: Record<string, number> // e.g. "math/addition": 5
  addStar: (mode: string) => void
  getStars: (mode: string) => number
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  stars: load<Record<string, number>>('stars', {}),
  addStar: (mode) => {
    const stars = { ...get().stars }
    stars[mode] = (stars[mode] ?? 0) + 1
    save('stars', stars)
    set({ stars })
  },
  getStars: (mode) => get().stars[mode] ?? 0,
}))
