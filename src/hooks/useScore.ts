import { useState, useCallback, useEffect, useRef } from 'react'
import { useStatsStore } from '@/stores/statsStore'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useScore(mode?: string) {
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const addSession = useStatsStore(s => s.addSession)
  const startTime = useRef(Date.now())
  const scoreRef = useRef(0)
  const totalRef = useRef(0)

  const addCorrect = useCallback(() => {
    setScore((s) => { scoreRef.current = s + 1; return s + 1 })
    setTotal((t) => { totalRef.current = t + 1; return t + 1 })
  }, [])

  const addWrong = useCallback(() => {
    setTotal((t) => { totalRef.current = t + 1; return t + 1 })
  }, [])

  const reset = useCallback(() => {
    setScore(0)
    setTotal(0)
    scoreRef.current = 0
    totalRef.current = 0
    startTime.current = Date.now()
  }, [])

  // 페이지 떠날 때 세션 기록 저장
  useEffect(() => {
    return () => {
      if (mode && totalRef.current > 0) {
        addSession({
          mode,
          date: todayKey(),
          correct: scoreRef.current,
          total: totalRef.current,
          durationSec: Math.round((Date.now() - startTime.current) / 1000),
        })
      }
    }
  }, [mode, addSession])

  return { score, total, addCorrect, addWrong, reset }
}
