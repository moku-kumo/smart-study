import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCorrect, playWrong } from '@/lib/audio'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameTimer } from '@/hooks/useGameTimer'
import { randInt } from '@/lib/random'

/* ── 유사 이모지 쌍 (아이가 헷갈릴 만한 것들) ── */
const PAIRS: [string, string][] = [
  ['🐶', '🐕'],
  ['🐱', '🐈'],
  ['🌸', '🌺'],
  ['🍎', '🍏'],
  ['⭐', '🌟'],
  ['🐻', '🧸'],
  ['🌙', '🌛'],
  ['🐰', '🐇'],
  ['🦋', '🪻'],
  ['🍊', '🍑'],
  ['🐸', '🐢'],
  ['🌻', '🌼'],
  ['🎈', '🎆'],
  ['🐟', '🐠'],
  ['🍓', '🍒'],
  ['🐧', '🐦'],
  ['🏠', '🏡'],
  ['⚽', '🏀'],
  ['🚗', '🚙'],
  ['🎵', '🎶'],
  ['🍕', '🍔'],
  ['🐷', '🐽'],
  ['🌈', '🌊'],
  ['🍦', '🧁'],
]

interface Level {
  gridSize: number  // 4, 9, 16, 25
  cols: number
  base: string
  odd: string
  oddIndex: number
  cells: string[]
}

function generateLevel(round: number): Level {
  // 라운드가 올라갈수록 그리드가 커짐
  const gridSizes = [
    { size: 4, cols: 2 },   // 2×2
    { size: 9, cols: 3 },   // 3×3
    { size: 16, cols: 4 },  // 4×4
    { size: 16, cols: 4 },
    { size: 25, cols: 5 },  // 5×5
  ]
  const tier = Math.min(round, gridSizes.length - 1)
  const { size, cols } = gridSizes[tier]

  const pair = PAIRS[randInt(0, PAIRS.length - 1)]
  const [base, odd] = Math.random() > 0.5 ? pair : [pair[1], pair[0]]
  const oddIndex = randInt(0, size - 1)

  const cells = Array.from({ length: size }, (_, i) => (i === oddIndex ? odd : base))

  return { gridSize: size, cols, base, odd, oddIndex, cells }
}

export default function SpotDiff() {
  useGameTimer()
  const { soundEnabled } = useSettingsStore()
  const [round, setRound] = useState(0)
  const [level, setLevel] = useState(() => generateLevel(0))
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [tappedIdx, setTappedIdx] = useState<number | null>(null)

  const next = useCallback(() => {
    const nextRound = round + 1
    setRound(nextRound)
    setLevel(generateLevel(nextRound))
    setFeedback(null)
    setTappedIdx(null)
  }, [round])

  const handleTap = (idx: number) => {
    if (feedback) return
    setTappedIdx(idx)

    if (idx === level.oddIndex) {
      if (soundEnabled) playCorrect()
      const bonus = streak >= 2 ? 5 : 0
      setScore((s) => s + 10 + bonus)
      setStreak((s) => s + 1)
      setFeedback('correct')
    } else {
      if (soundEnabled) playWrong()
      setStreak(0)
      setFeedback('wrong')
    }
  }

  // 셀 크기 계산
  const cellSize = level.cols <= 3 ? 'text-5xl w-20 h-20' : level.cols <= 4 ? 'text-4xl w-16 h-16' : 'text-3xl w-13 h-13'

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
      <header className="flex items-center justify-between mb-4">
        <Link to="/game" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} /> 게임
        </Link>
        <h2 className="text-xl font-bold text-gray-700">🔍 다른 그림 찾기</h2>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500">⭐{score}</span>
        </div>
      </header>

      <div className="text-center mb-4">
        <p className="text-gray-500 text-sm">
          하나만 다른 그림을 찾아요!
          {streak >= 2 && <span className="ml-2 text-orange-500 font-bold">🔥 {streak}연속!</span>}
        </p>
        <p className="text-xs text-gray-400 mt-1">라운드 {round + 1}</p>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        <div
          className="grid gap-2 p-4 bg-white rounded-3xl shadow-lg"
          style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)` }}
        >
          {level.cells.map((emoji, i) => {
            const isOdd = i === level.oddIndex
            const showResult = feedback !== null
            const isTapped = i === tappedIdx

            return (
              <motion.button
                key={`${round}-${i}`}
                onClick={() => handleTap(i)}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0, rotate: -10 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  ...(showResult && isOdd
                    ? { boxShadow: '0 0 0 3px #22c55e', borderRadius: '16px' }
                    : {}),
                  ...(showResult && isTapped && !isOdd
                    ? { boxShadow: '0 0 0 3px #ef4444', borderRadius: '16px' }
                    : {}),
                }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
                className={`${cellSize} flex items-center justify-center rounded-2xl transition-colors ${
                  showResult
                    ? isOdd
                      ? 'bg-green-50'
                      : isTapped
                        ? 'bg-red-50'
                        : 'bg-gray-50'
                    : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                {emoji}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              {feedback === 'correct' ? (
                <div>
                  <span className="text-5xl">🎉</span>
                  <p className="text-green-500 font-bold mt-1">
                    잘 찾았어요! +{10 + (streak > 2 ? 5 : 0)}점
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-5xl">😅</span>
                  <p className="text-red-400 font-bold mt-1">아쉬워요! 다른 건 {level.odd} 이에요</p>
                </div>
              )}
              <button
                onClick={next}
                className="mt-3 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
              >
                다음 문제 →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
