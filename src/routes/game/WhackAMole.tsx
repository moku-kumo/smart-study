import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [active, setActive] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const moleRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const showMole = useCallback(() => {
    const idx = Math.floor(Math.random() * GRID)
    setActive(idx)
    moleRef.current = setTimeout(() => {
      setActive(null)
      if (!finished) moleRef.current = setTimeout(showMole, 300 + Math.random() * 400)
    }, 800 + Math.random() * 600)
  }, [finished])

  const start = () => {
    setStarted(true)
    setFinished(false)
    setScore(0)
    setTimeLeft(GAME_TIME)
    showMole()
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          clearTimeout(moleRef.current)
          setActive(null)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(moleRef.current)
    }
  }, [])

  const whack = (idx: number) => {
    if (idx === active) {
      if (soundEnabled) playCorrect()
      setScore((s) => s + 1)
      setActive(null)
    }
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
          <div className="w-full max-w-xs bg-green-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-1000"
              style={{ width: `${(timeLeft / GAME_TIME) * 100}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm">{timeLeft}초</p>

          <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-4">
            {Array.from({ length: GRID }).map((_, i) => (
              <button
                key={i}
                onClick={() => whack(i)}
                className="aspect-square rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl transition-all active:scale-95"
              >
                <AnimatePresence>
                  {active === i && (
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
              </button>
            ))}
          </div>
        </main>
      )}
    </div>
  )
}
