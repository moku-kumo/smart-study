import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameTimer } from '@/hooks/useGameTimer'
import { playCorrect } from '@/lib/audio'

const GAME_TIME = 30
const PLAYER_SIZE = 40 // px
const POOP_SIZE = 32 // px
const PLAYER_SPEED = 6 // px per frame
const HIT_SHRINK = 0.6 // 충돌 판정을 실제 크기의 60%로

interface Poop {
  id: number
  x: number // px from left
  y: number // px from top
  speed: number // px per frame
}

export default function DodgePoop() {
  useGameTimer()
  const { soundEnabled } = useSettingsStore()
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [hit, setHit] = useState(false)

  // All game state in refs for rAF loop
  const playerXRef = useRef(0)
  const [playerX, setPlayerX] = useState(0)
  const poopsRef = useRef<Poop[]>([])
  const [renderPoops, setRenderPoops] = useState<Poop[]>([])
  const nextId = useRef(0)
  const frameRef = useRef<number>(undefined)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const spawnRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const scoreRef = useRef(0)
  const runningRef = useRef(false)
  const areaRef = useRef<HTMLDivElement>(null)
  const elapsedRef = useRef(0)

  // Movement: track which direction is being held
  const moveDir = useRef(0) // -1 left, 0 none, 1 right
  // Touch drag tracking
  const touchStartX = useRef(0)
  const playerStartX = useRef(0)
  const dragging = useRef(false)

  const getArea = () => {
    const el = areaRef.current
    return { w: el?.clientWidth ?? 300, h: el?.clientHeight ?? 500 }
  }

  // 시간에 따라 스폰 간격, 속도, 동시 개수 증가
  const getDifficulty = () => {
    const t = elapsedRef.current
    if (t < 5) return { interval: 500, speed: 2.5, burst: 1 }
    if (t < 10) return { interval: 380, speed: 3, burst: 1 }
    if (t < 15) return { interval: 300, speed: 3.5, burst: 2 }
    if (t < 20) return { interval: 250, speed: 4, burst: 2 }
    if (t < 25) return { interval: 200, speed: 4.5, burst: 3 }
    return { interval: 150, speed: 5, burst: 3 }
  }

  const spawnPoop = useCallback(() => {
    if (!runningRef.current) return
    const { w } = getArea()
    const margin = POOP_SIZE
    const { speed, burst } = getDifficulty()
    for (let i = 0; i < burst; i++) {
      const p: Poop = {
        id: nextId.current++,
        x: margin + Math.random() * (w - margin * 2),
        y: -POOP_SIZE - i * 20,
        speed: speed + Math.random() * 1.5,
      }
      poopsRef.current = [...poopsRef.current, p]
    }
  }, [])

  const gameLoop = useCallback(() => {
    if (!runningRef.current) return
    const { w, h } = getArea()

    // Move player
    if (moveDir.current !== 0) {
      playerXRef.current = Math.max(
        0,
        Math.min(w - PLAYER_SIZE, playerXRef.current + moveDir.current * PLAYER_SPEED),
      )
      setPlayerX(playerXRef.current)
    }

    const px = playerXRef.current
    const py = h - PLAYER_SIZE - 8
    // Shrunk hitbox for forgiving collision
    const hs = (PLAYER_SIZE * (1 - HIT_SHRINK)) / 2
    const pLeft = px + hs
    const pRight = px + PLAYER_SIZE - hs
    const pTop = py + hs
    const pBottom = py + PLAYER_SIZE - hs

    let hitDetected = false
    const alive: Poop[] = []

    for (const p of poopsRef.current) {
      const newY = p.y + p.speed
      if (newY > h + POOP_SIZE) {
        scoreRef.current += 1
        setScore(scoreRef.current)
        continue
      }
      // AABB collision
      const poopHs = (POOP_SIZE * (1 - HIT_SHRINK)) / 2
      const oLeft = p.x - POOP_SIZE / 2 + poopHs
      const oRight = p.x + POOP_SIZE / 2 - poopHs
      const oTop = newY - POOP_SIZE / 2 + poopHs
      const oBottom = newY + POOP_SIZE / 2 - poopHs

      if (pLeft < oRight && pRight > oLeft && pTop < oBottom && pBottom > oTop) {
        hitDetected = true
        break
      }
      alive.push({ ...p, y: newY })
    }

    if (hitDetected) {
      runningRef.current = false
      clearInterval(timerRef.current)
      clearTimeout(spawnRef.current)
      setHit(true)
      setFinished(true)
      poopsRef.current = []
      setRenderPoops([])
      return
    }

    poopsRef.current = alive
    setRenderPoops([...alive])
    frameRef.current = requestAnimationFrame(gameLoop)
  }, [])

  const start = () => {
    const { w } = getArea()
    const startX = (w - PLAYER_SIZE) / 2
    playerXRef.current = startX
    setPlayerX(startX)
    setStarted(true)
    setFinished(false)
    setHit(false)
    setScore(0)
    setTimeLeft(GAME_TIME)
    poopsRef.current = []
    setRenderPoops([])
    nextId.current = 0
    scoreRef.current = 0
    moveDir.current = 0
    elapsedRef.current = 0
    runningRef.current = true

    frameRef.current = requestAnimationFrame(gameLoop)

    // 동적 스폰: 매 초마다 난이도에 맞게 스폰 간격 재설정
    const scheduleSpawn = () => {
      if (!runningRef.current) return
      spawnPoop()
      const { interval } = getDifficulty()
      spawnRef.current = setTimeout(scheduleSpawn, interval + Math.random() * 100)
    }
    spawnRef.current = setTimeout(scheduleSpawn, 400)

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1
      setTimeLeft((t) => {
        if (t <= 1) {
          runningRef.current = false
          clearInterval(timerRef.current)
          clearTimeout(spawnRef.current)
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
      clearTimeout(spawnRef.current)
      cancelAnimationFrame(frameRef.current!)
    }
  }, [])

  // Touch: drag to move player directly
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!runningRef.current) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragging.current = true
    touchStartX.current = e.clientX
    playerStartX.current = playerXRef.current
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !runningRef.current) return
    const { w } = getArea()
    const dx = e.clientX - touchStartX.current
    const newX = Math.max(0, Math.min(w - PLAYER_SIZE, playerStartX.current + dx))
    playerXRef.current = newX
    setPlayerX(newX)
  }

  const handlePointerUp = () => {
    dragging.current = false
  }

  // Keyboard: hold arrow keys
  useEffect(() => {
    const keys = new Set<string>()
    const update = () => {
      if (keys.has('ArrowLeft') || keys.has('a')) moveDir.current = -1
      else if (keys.has('ArrowRight') || keys.has('d')) moveDir.current = 1
      else moveDir.current = 0
    }
    const down = (e: KeyboardEvent) => { keys.add(e.key); update() }
    const up = (e: KeyboardEvent) => { keys.delete(e.key); update() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

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
              손가락을 드래그해서<br />💩를 피하세요!
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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex-1 relative mt-2 touch-none select-none overflow-hidden rounded-2xl bg-gradient-to-b from-green-100 to-green-200 border-2 border-green-300"
          >
            {/* Poops */}
            {renderPoops.map((p) => (
              <div
                key={p.id}
                className="absolute pointer-events-none"
                style={{
                  left: p.x,
                  top: p.y,
                  width: POOP_SIZE,
                  height: POOP_SIZE,
                  transform: 'translate(-50%, -50%)',
                  fontSize: POOP_SIZE - 4,
                  lineHeight: 1,
                  textAlign: 'center',
                  willChange: 'top',
                }}
              >
                💩
              </div>
            ))}

            {/* Player - 뽀로로 */}
            <img
              src={import.meta.env.BASE_URL + 'images/pororo.png'}
              alt="뽀로로"
              className="absolute pointer-events-none"
              draggable={false}
              style={{
                left: playerX,
                bottom: 8,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                objectFit: 'contain',
                transform: 'translateX(-50%)',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
