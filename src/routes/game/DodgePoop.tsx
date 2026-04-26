import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameTimer } from '@/hooks/useGameTimer'
import { playCorrect } from '@/lib/audio'

const GAME_TIME = 30
const PLAYER_W = 48 // px
const POOP_SIZE = 36
const LANE_COUNT = 5

interface Poop {
  id: number
  lane: number // 0~LANE_COUNT-1
  y: number // px from top
  speed: number // px per frame tick
}

export default function DodgePoop() {
  useGameTimer()
  const { soundEnabled } = useSettingsStore()
  const [playerLane, setPlayerLane] = useState(Math.floor(LANE_COUNT / 2))
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [hit, setHit] = useState(false)

  const poopsRef = useRef<Poop[]>([])
  const [poops, setPoops] = useState<Poop[]>([])
  const nextId = useRef(0)
  const frameRef = useRef<number>(undefined)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const spawnRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const scoreRef = useRef(0)
  const playerLaneRef = useRef(playerLane)
  const runningRef = useRef(false)
  const areaRef = useRef<HTMLDivElement>(null)

  playerLaneRef.current = playerLane

  const getAreaHeight = () => areaRef.current?.clientHeight ?? 500

  const spawnPoop = useCallback(() => {
    if (!runningRef.current) return
    const lane = Math.floor(Math.random() * LANE_COUNT)
    const elapsed = GAME_TIME - (timerRef.current ? 1 : 0)
    const speedBoost = Math.min(elapsed * 0.1, 3)
    const p: Poop = {
      id: nextId.current++,
      lane,
      y: -POOP_SIZE,
      speed: 3 + Math.random() * 2 + speedBoost,
    }
    poopsRef.current = [...poopsRef.current, p]
  }, [])

  const gameLoop = useCallback(() => {
    if (!runningRef.current) return
    const areaH = getAreaHeight()
    const playerY = areaH - PLAYER_W - 8

    let hitDetected = false
    const alive: Poop[] = []

    for (const p of poopsRef.current) {
      const newY = p.y + p.speed
      if (newY > areaH + POOP_SIZE) {
        // passed bottom → survived → +1 point
        scoreRef.current += 1
        setScore(scoreRef.current)
        continue
      }
      // collision check
      if (
        p.lane === playerLaneRef.current &&
        newY + POOP_SIZE > playerY &&
        newY < playerY + PLAYER_W
      ) {
        hitDetected = true
        break
      }
      alive.push({ ...p, y: newY })
    }

    if (hitDetected) {
      runningRef.current = false
      clearInterval(timerRef.current)
      clearInterval(spawnRef.current)
      setHit(true)
      setFinished(true)
      poopsRef.current = []
      setPoops([])
      return
    }

    poopsRef.current = alive
    setPoops([...alive])
    frameRef.current = requestAnimationFrame(gameLoop)
  }, [])

  const start = () => {
    setStarted(true)
    setFinished(false)
    setHit(false)
    setScore(0)
    setTimeLeft(GAME_TIME)
    setPlayerLane(Math.floor(LANE_COUNT / 2))
    playerLaneRef.current = Math.floor(LANE_COUNT / 2)
    poopsRef.current = []
    setPoops([])
    nextId.current = 0
    scoreRef.current = 0
    runningRef.current = true

    frameRef.current = requestAnimationFrame(gameLoop)
    spawnRef.current = setInterval(spawnPoop, 600)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          runningRef.current = false
          clearInterval(timerRef.current)
          clearInterval(spawnRef.current)
          cancelAnimationFrame(frameRef.current!)
          if (soundEnabled) playCorrect()
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
      clearInterval(spawnRef.current)
      cancelAnimationFrame(frameRef.current!)
    }
  }, [])

  // Touch / click control: tap left half → move left, right half → move right
  const handleAreaTap = (e: React.PointerEvent) => {
    if (!runningRef.current) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const mid = rect.width / 2
    setPlayerLane((lane) => {
      const next = x < mid ? Math.max(0, lane - 1) : Math.min(LANE_COUNT - 1, lane + 1)
      playerLaneRef.current = next
      return next
    })
  }

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!runningRef.current) return
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayerLane((l) => {
          const next = Math.max(0, l - 1)
          playerLaneRef.current = next
          return next
        })
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayerLane((l) => {
          const next = Math.min(LANE_COUNT - 1, l + 1)
          playerLaneRef.current = next
          return next
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const laneWidth = 100 / LANE_COUNT

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-amber-50 to-orange-100 p-4 pt-[max(1rem,env(safe-area-inset-top))] overflow-hidden">
      <header className="flex items-center justify-between mb-2">
        <Link to="/game" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} /> 게임
        </Link>
        <h2 className="text-xl font-bold text-gray-700">💩 똥 피하기</h2>
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
              <div className="text-6xl mb-2">{hit ? '💥' : '🎉'}</div>
              <p className="text-3xl font-bold text-gray-700">
                {hit ? '으악! 맞았다!' : `${score}개 피했어요!`}
              </p>
              <p className="text-xl text-gray-500 mt-2">⭐ {score}점</p>
            </motion.div>
          )}
          <button
            onClick={start}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-2xl font-bold shadow-lg transition-colors"
          >
            {finished ? '다시 하기' : '시작!'}
          </button>
          {!finished && (
            <p className="text-gray-400 text-sm text-center">
              화면 왼쪽/오른쪽을 터치해서<br />💩를 피하세요!
            </p>
          )}
        </main>
      ) : (
        <>
          <div className="w-full max-w-xs mx-auto bg-amber-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${(timeLeft / GAME_TIME) * 100}%` }}
            />
          </div>
          <p className="text-center text-gray-500 text-sm mt-1">{timeLeft}초</p>

          <div
            ref={areaRef}
            onPointerDown={handleAreaTap}
            className="flex-1 relative mt-2 touch-manipulation select-none overflow-hidden rounded-2xl bg-gradient-to-b from-green-100 to-green-200 border-2 border-green-300"
          >
            {/* Lane guides */}
            {Array.from({ length: LANE_COUNT - 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-green-300/40"
                style={{ left: `${(i + 1) * laneWidth}%` }}
              />
            ))}

            {/* Poops */}
            {poops.map((p) => (
              <div
                key={p.id}
                className="absolute text-3xl"
                style={{
                  left: `${p.lane * laneWidth + laneWidth / 2}%`,
                  top: p.y,
                  transform: 'translateX(-50%)',
                  willChange: 'top',
                }}
              >
                💩
              </div>
            ))}

            {/* Player */}
            <div
              className="absolute text-4xl transition-all duration-100"
              style={{
                left: `${playerLane * laneWidth + laneWidth / 2}%`,
                bottom: 8,
                transform: 'translateX(-50%)',
              }}
            >
              🏃
            </div>

            {/* Left/Right indicators */}
            <div className="absolute bottom-2 left-2 text-2xl opacity-30 pointer-events-none">◀</div>
            <div className="absolute bottom-2 right-2 text-2xl opacity-30 pointer-events-none">▶</div>
          </div>
        </>
      )}
    </div>
  )
}
