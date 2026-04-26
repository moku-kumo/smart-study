import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCorrect } from '@/lib/audio'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameTimer } from '@/hooks/useGameTimer'

const GRID = 9 // 3x3
const GAME_TIME = 30 // 30초

export default function WhackAMole() {
  useGameTimer()
  const { soundEnabled } = useSettingsStore()
  const [score, setScore] = useState(0)
  const [actives, setActives] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [popups, setPopups] = useState<{ id: number; slot: number; points: number }[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const moleTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const runningRef = useRef(false)
  const scoreRef = useRef(0)
  const elapsedRef = useRef(0)
  const popupId = useRef(0)

  // 난이도에 따라 동시 두더지 수, 표시 시간, 간격 결정
  const getDifficulty = () => {
    const t = elapsedRef.current
    if (t < 5) return { maxMoles: 1, showTime: 1000, gap: 600 }      // 0~5초: 1마리, 느림
    if (t < 12) return { maxMoles: 1, showTime: 700, gap: 400 }      // 5~12초: 1마리, 빠름
    if (t < 20) return { maxMoles: 2, showTime: 650, gap: 350 }      // 12~20초: 2마리
    return { maxMoles: 3, showTime: 550, gap: 250 }                   // 20초~: 3마리
  }

  const pickRandomSlots = (count: number, exclude: Set<number>) => {
    const available = Array.from({ length: GRID }, (_, i) => i).filter((i) => !exclude.has(i))
    const picks: number[] = []
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const idx = Math.floor(Math.random() * available.length)
      picks.push(available[idx])
      available.splice(idx, 1)
    }
    return picks
  }

  const showMoles = () => {
    if (!runningRef.current) return
    const { maxMoles, showTime, gap } = getDifficulty()

    setActives((prev) => {
      // 몇 마리 더 보여줄지 (현재 활성 수 고려)
      const toAdd = Math.max(1, maxMoles - prev.size)
      const slots = pickRandomSlots(toAdd, prev)
      const next = new Set(prev)

      for (const slot of slots) {
        next.add(slot)
        // 각 두더지 개별 타이머: 일정 시간 후 사라짐
        const hideDelay = showTime + Math.random() * 300
        const timer = setTimeout(() => {
          if (!runningRef.current) return
          setActives((s) => {
            const n = new Set(s)
            n.delete(slot)
            return n
          })
          moleTimers.current.delete(slot)
        }, hideDelay)
        moleTimers.current.set(slot, timer)
      }

      return next
    })

    // 다음 웨이브 예약
    if (runningRef.current) {
      const nextGap = gap + Math.random() * 200
      setTimeout(showMoles, nextGap)
    }
  }

  const start = () => {
    setStarted(true)
    setFinished(false)
    setScore(0)
    scoreRef.current = 0
    elapsedRef.current = 0
    setTimeLeft(GAME_TIME)
    setActives(new Set())
    moleTimers.current.forEach((t) => clearTimeout(t))
    moleTimers.current.clear()
    runningRef.current = true

    // 첫 두더지 약간 딜레이 후 시작
    setTimeout(showMoles, 500)

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1
      setTimeLeft((t) => {
        if (t <= 1) {
          runningRef.current = false
          clearInterval(timerRef.current)
          moleTimers.current.forEach((tm) => clearTimeout(tm))
          moleTimers.current.clear()
          setActives(new Set())
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      runningRef.current = false
      clearInterval(timerRef.current)
      moleTimers.current.forEach((t) => clearTimeout(t))
    }
  }, [])

  const whack = (idx: number) => {
    setActives((prev) => {
      if (!prev.has(idx)) return prev
      if (soundEnabled) playCorrect()
      scoreRef.current += 1
      setScore(scoreRef.current)
      // +1 팝업 효과
      const pid = popupId.current++
      setPopups((p) => [...p, { id: pid, slot: idx, points: 1 }])
      setTimeout(() => setPopups((p) => p.filter((v) => v.id !== pid)), 700)
      // 해당 두더지 타이머 취소
      const timer = moleTimers.current.get(idx)
      if (timer) {
        clearTimeout(timer)
        moleTimers.current.delete(idx)
      }
      const next = new Set(prev)
      next.delete(idx)
      return next
    })
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-green-50 to-lime-50 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between mb-4">
        <Link to="/game" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} /> 게임
        </Link>
        <h2 className="text-xl font-bold text-gray-700">🐹 두더지잡기</h2>
        <div className="text-lg font-bold text-orange-500">⭐ {score}</div>
      </header>

      {!started || finished ? (
        <main className="flex-1 flex flex-col items-center justify-center gap-6">
          {finished && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-2">🎉</div>
              <p className="text-3xl font-bold text-gray-700">{score}마리 잡았어요!</p>
            </motion.div>
          )}
          <button
            onClick={start}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-2xl font-bold shadow-lg transition-colors"
          >
            {finished ? '다시 하기' : '시작!'}
          </button>
        </main>
      ) : (
        <main className="flex-1 flex flex-col items-center gap-4">
          <div className="w-full max-w-sm bg-green-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-1000"
              style={{ width: `${(timeLeft / GAME_TIME) * 100}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm">{timeLeft}초</p>

          <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-2 touch-manipulation">
            {Array.from({ length: GRID }).map((_, i) => (
              <button
                key={i}
                onPointerDown={() => whack(i)}
                className="aspect-square rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-5xl select-none touch-manipulation active:scale-95 transition-transform relative overflow-visible"
              >
                <AnimatePresence>
                  {actives.has(i) && (
                    <motion.span
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      🐹
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {popups.filter((p) => p.slot === i).map((p) => (
                    <motion.span
                      key={p.id}
                      initial={{ y: 0, opacity: 1, scale: 1 }}
                      animate={{ y: -50, opacity: 0, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 text-lg font-black text-orange-500 pointer-events-none z-10 drop-shadow-md"
                    >
                      +{p.points}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </main>
      )}
    </div>
  )
}
