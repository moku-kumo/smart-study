import { useState, useCallback } from 'react'
import GameLayout from '@/components/game/GameLayout'
import OptionGrid from '@/components/game/OptionGrid'
import Feedback from '@/components/game/Feedback'
import { useScore } from '@/hooks/useScore'
import { useSettingsStore } from '@/stores/settingsStore'
import { randInt, shuffle } from '@/lib/random'
import { playCorrect, playWrong } from '@/lib/audio'

function generateProblem(difficulty: 1 | 2 | 3) {
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 9 : 15
  const a = randInt(1, max)
  const b = randInt(1, max)
  const answer = a + b
  const options = new Set<number>([answer])
  while (options.size < 6) {
    options.add(randInt(Math.max(0, answer - 5), answer + 5))
  }
  return { a, b, answer, options: shuffle([...options]) }
}

export default function Addition() {
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
      title="➕ 더하기"
      backTo="/math"
      backLabel="수학"
      score={score}
      total={total}
      timerEnabled={timerEnabled}
      timerSeconds={difficulty === 1 ? 15 : difficulty === 2 ? 10 : 7}
      timerKey={timerKey}
      onTimeUp={handleTimeUp}
    >
      <div className="text-6xl font-bold text-gray-700 mb-4">
        {problem.a} + {problem.b} = ?
      </div>

      {feedback ? (
        <Feedback type={feedback} onDone={next} />
      ) : (
        <OptionGrid options={problem.options} onSelect={handleSelect} columns={3} />
      )}
    </GameLayout>
  )
}
