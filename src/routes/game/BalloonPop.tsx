import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCorrect } from '@/lib/audio'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameTimer } from '@/hooks/useGameTimer'
import { randInt } from '@/lib/random'

interface Balloon {
  id: number
  x: number // 0~80 (%)
  color: string
  emoji: string
  speed: number // px/s
  y: number
}

const COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400',
  'bg-pink-400', 'bg-purple-400', 'bg-orange-400',
]
const EMOJIS = ['🎈', '🎈', '🎈', '⭐', '🌟', '💎']
const GAME_TIME = 30

export default function BalloonPop() {
  useGameTimer()
  const { soundEnabled } = useSettingsStore()
  const [score, setScore] = useState(0)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const nextId = useRef(0)
  const frameRef = useRef<number>(undefined)
  const lastTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const spawnRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const spawn = useCallback(() => {
    const b: Balloon = {
      id: nextId.current++,
      x: randInt(5, 80),
      color: COLORS[randInt(0, COLORS.length - 1)],
      emoji: EMOJIS[randInt(0, EMOJIS.length - 1)],
      speed: 60 + Math.random() * 80,
      y: 110, // start below screen
    }
    setBalloons((prev) => [...prev, b])
  }, [])

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time
    const dt = (time - lastTimeRef.current) / 1000
    lastTimeRef.current = time

    setBalloons((prev) =>
      prev
        .map((b) => ({ ...b, y: b.y - b.speed * dt }))
        .filter((b) => b.y > -15)
    )
    frameRef.current = requestAnimationFrame(animate)
  }, [])

  const start = () => {
    setStarted(true)
    setFinished(false)
    setScore(0)
    setTimeLeft(GAME_TIME)
    setBalloons([])
    nextId.current = 0
    lastTimeRef.current = 0

    frameRef.current = requestAnimationFrame(animate)
    spawnRef.current = setInterval(spawn, 700)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          clearInterval(spawnRef.current)
          cancelAnimationFrame(frameRef.current!)
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
      clearInterval(spawnRef.current)
      cancelAnimationFrame(frameRef.current!)
    }
  }, [])

  const pop = (id: number) => {
    if (soundEnabled) playCorrect()
    setScore((s) => s + 1)
    setBalloons((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-sky-100 to-sky-300 p-4 pt-[max(1rem,env(safe-area-inset-top))] overflow-hidden relative">
      <header className="flex items-center justify-between mb-4 relative z-10">
        <Link to="/game" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} /> 게임
        </Link>
        <h2 className="text-xl font-bold text-gray-700">🎈 풍선 터뜨리기</h2>
        <div className="text-lg font-bold text-orange-500">⭐ {score}</div>
      </header>

      {!started || finished ? (
        <main className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
          {finished && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-2">🎊</div>
              <p className="text-3xl font-bold text-gray-700">{score}개 터뜨렸어요!</p>
            </motion.div>
          )}
          <button
            onClick={start}
            className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-2xl font-bold shadow-lg transition-colors"
          >
            {finished ? '다시 하기' : '시작!'}
          </button>
        </main>
      ) : (
        <>
          <div className="w-full max-w-xs mx-auto bg-sky-200 rounded-full h-3 overflow-hidden relative z-10">
            <div
              className="h-full bg-sky-500 transition-all duration-1000"
              style={{ width: `${(timeLeft / GAME_TIME) * 100}%` }}
            />
          </div>
          <p className="text-center text-gray-500 text-sm mt-1 relative z-10">{timeLeft}초</p>

          <div className="flex-1 relative mt-4">
            <AnimatePresence>
              {balloons.map((b) => (
                <motion.button
                  key={b.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => pop(b.id)}
                  className="absolute text-4xl active:scale-150 transition-transform"
                  style={{
                    left: `${b.x}%`,
                    bottom: `${b.y}%`,
                  }}
                >
                  {b.emoji}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
