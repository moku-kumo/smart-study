import { useEffect, useRef } from 'react'
import { useStudyTimeStore } from '@/stores/studyTimeStore'

/** 컴포넌트가 마운트된 동안 매 10초마다 공부 시간을 기록 */
export function useStudyTimer() {
  const addSeconds = useStudyTimeStore((s) => s.addSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      addSeconds(10)
    }, 10_000)
    return () => clearInterval(intervalRef.current)
  }, [addSeconds])
}
