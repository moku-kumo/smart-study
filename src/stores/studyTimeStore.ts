import { create } from 'zustand'
import { load, save } from '@/lib/storage'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 게임 잠금 해제 기준 (초) */
export const REQUIRED_STUDY_SECONDS = 300 // 5분

interface StudyTimeState {
  dailySeconds: Record<string, number>       // 공부 시간
  dailyGameSeconds: Record<string, number>   // 게임 시간
  addSeconds: (seconds: number) => void
  addGameSeconds: (seconds: number) => void
}

export const useStudyTimeStore = create<StudyTimeState>((set, get) => ({
  dailySeconds: load<Record<string, number>>('dailySeconds', {}),
  dailyGameSeconds: load<Record<string, number>>('dailyGameSeconds', {}),
  addSeconds: (seconds) => {
    const daily = { ...get().dailySeconds }
    const key = todayKey()
    daily[key] = (daily[key] ?? 0) + seconds
    save('dailySeconds', daily)
    set({ dailySeconds: daily })
  },
  addGameSeconds: (seconds) => {
    const daily = { ...get().dailyGameSeconds }
    const key = todayKey()
    daily[key] = (daily[key] ?? 0) + seconds
    save('dailyGameSeconds', daily)
    set({ dailyGameSeconds: daily })
  },
}))

/** 오늘 공부한 초 */
export function getTodaySeconds(state: StudyTimeState): number {
  return state.dailySeconds[todayKey()] ?? 0
}

/** 오늘 게임한 초 */
export function getTodayGameSeconds(state: StudyTimeState): number {
  return state.dailyGameSeconds[todayKey()] ?? 0
}

/** 게임 잠금 해제 여부 (5분 이상 공부) */
export function isGameUnlocked(state: StudyTimeState): boolean {
  return getTodaySeconds(state) >= REQUIRED_STUDY_SECONDS
}

/** 남은 게임 가능 시간 (초) — 공부시간 - 게임시간, 최소 0 */
export function getRemainingGameSeconds(state: StudyTimeState): number {
  const studied = getTodaySeconds(state)
  const played = getTodayGameSeconds(state)
  return Math.max(0, studied - played)
}

/** 게임 플레이 가능 여부 (잠금 해제 + 남은 시간 > 0) */
export function canPlayGame(state: StudyTimeState): boolean {
  return isGameUnlocked(state) && getRemainingGameSeconds(state) > 0
}
