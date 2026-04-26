import { useState, useCallback } from 'react'
import GameLayout from '@/components/game/GameLayout'
import OptionGrid from '@/components/game/OptionGrid'
import Feedback from '@/components/game/Feedback'
import { useScore } from '@/hooks/useScore'
import { useSettingsStore } from '@/stores/settingsStore'
import { randInt, shuffle } from '@/lib/random'
import { playCorrect, playWrong } from '@/lib/audio'

function generateProblem(difficulty: 1 | 2 | 3) {
  const step = difficulty === 1 ? 5 : difficulty === 2 ? randInt(2, 5) : randInt(2, 10)
  const start = randInt(0, 10) * step
  const len = 5
  const seq = Array.from({ length: len }, (_, i) => start + i * step)
  const answer = seq[len - 1]
  seq[len - 1] = -1 // blank at end

  const options = new Set<number>([answer])
  while (options.size < 4) {
    const fake = answer + (randInt(0, 1) === 0 ? 1 : -1) * randInt(1, 3) * step
    if (fake > 0) options.add(fake)
  }
  // fill remaining if needed
  while (options.size < 4) {
    options.add(randInt(Math.max(1, answer - 20), answer + 20))
  }

  return { seq, answer, step, options: shuffle([...options]) }
}

export default function Pattern() {
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
      title="🧩 패턴채우기"
      backTo="/math"
      backLabel="수학"
      score={score}
      total={total}
      timerEnabled={timerEnabled}
      timerSeconds={difficulty === 1 ? 15 : difficulty === 2 ? 10 : 7}
      timerKey={timerKey}
      onTimeUp={handleTimeUp}
    >
      <p className="text-sm text-gray-400 mb-2">+{problem.step}씩 커져요</p>
      <div className="flex gap-3 items-center mb-6">
        {problem.seq.map((n, i) => (
          <div
            key={i}
            className={`w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-bold ${
              n === -1
                ? 'bg-orange-200 border-2 border-orange-400 text-orange-600'
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
