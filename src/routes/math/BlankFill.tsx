import { useState, useCallback } from 'react'
import GameLayout from '@/components/game/GameLayout'
import OptionGrid from '@/components/game/OptionGrid'
import Feedback from '@/components/game/Feedback'
import { useScore } from '@/hooks/useScore'
import { useSettingsStore } from '@/stores/settingsStore'
import { randInt, shuffle } from '@/lib/random'
import { playCorrect, playWrong } from '@/lib/audio'

function generateProblem(difficulty: 1 | 2 | 3) {
  const len = difficulty === 1 ? 5 : difficulty === 2 ? 7 : 9
  const start = randInt(1, 10)
  const step = 1
  const seq = Array.from({ length: len }, (_, i) => start + i * step)
  const blankIdx = randInt(1, len - 2)
  const answer = seq[blankIdx]
  seq[blankIdx] = -1 // blank marker

  const options = new Set<number>([answer])
  while (options.size < 4) {
    options.add(randInt(Math.max(1, answer - 3), answer + 3))
  }

  return { seq, blankIdx, answer, options: shuffle([...options]) }
}

export default function BlankFill() {
  const { difficulty, timerEnabled, soundEnabled } = useSettingsStore()
  const { score, total, addCorrect, addWrong } = useScore()
  const [problem, setProblem] = useState(() => generateProblem(difficulty))
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)

  const next = useCallback(() => {
    setProblem(generateProblem(difficulty))
    setFeedback(null)
    setTimerKey((k) => k + 1)
  }, [difficulty])

  const handleSelect = (opt: number) => {
    if (feedback) return
    if (opt === problem.answer) {
      if (soundEnabled) playCorrect()
      addCorrect()
      setFeedback('correct')
    } else {
      if (soundEnabled) playWrong()
      addWrong()
      setFeedback('wrong')
    }
  }

  const handleTimeUp = () => {
    if (!feedback) {
      if (soundEnabled) playWrong()
      addWrong()
      setFeedback('wrong')
    }
  }

  return (
    <GameLayout
      title="⬜ 빈칸채우기"
      backTo="/math"
      backLabel="수학"
      score={score}
      total={total}
      timerEnabled={timerEnabled}
      timerSeconds={difficulty === 1 ? 15 : difficulty === 2 ? 10 : 7}
      timerKey={timerKey}
      onTimeUp={handleTimeUp}
    >
      <div className="flex gap-3 items-center mb-6">
        {problem.seq.map((n, i) => (
          <div
            key={i}
            className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl font-bold ${
              n === -1
                ? 'bg-yellow-200 border-2 border-yellow-400 text-yellow-600'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {n === -1 ? '?' : n}
          </div>
        ))}
      </div>

      {feedback ? (
        <Feedback type={feedback} onDone={next} />
      ) : (
        <OptionGrid options={problem.options} onSelect={handleSelect} columns={4} />
      )}
    </GameLayout>
  )
}
