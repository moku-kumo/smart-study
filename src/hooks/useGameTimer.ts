import { useEffect, useRef } from 'react'
import { useStudyTimeStore, canPlayGame } from '@/stores/studyTimeStore'
import { useNavigate } from 'react-router-dom'

/** 게임 컴포넌트에서 사용: 매 10초마다 게임 시간 기록, 시간 소진 시 /game으로 이동 */
export function useGameTimer() {
  const addGameSeconds = useStudyTimeStore((s) => s.addGameSeconds)
  const canPlay = useStudyTimeStore(canPlayGame)
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      addGameSeconds(10)
    }, 10_000)
    return () => clearInterval(intervalRef.current)
  }, [addGameSeconds])

  // 시간 소진 시 자동으로 게임 목록으로 이동
  useEffect(() => {
    if (!canPlay) {
      navigate('/game', { replace: true })
    }
  }, [canPlay, navigate])
}
