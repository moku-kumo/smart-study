import { useState, useCallback } from 'react'
import GameLayout from '@/components/game/GameLayout'
import OptionGrid from '@/components/game/OptionGrid'
import Feedback from '@/components/game/Feedback'
import { useScore } from '@/hooks/useScore'
import { useSettingsStore } from '@/stores/settingsStore'
import { koreanWords, type KoreanWordEntry } from '@/data/koreanWords'
import { shuffle, pickRandom } from '@/lib/random'
import { playCorrect, playWrong } from '@/lib/audio'

function generateProblem() {
  const [correct, ...distractors] = pickRandom(koreanWords, 4) as [KoreanWordEntry, ...KoreanWordEntry[]]
  const options = shuffle([correct, ...distractors])
  return { correct, options }
}

export default function ReadWord() {
  const { timerEnabled, soundEnabled } = useSettingsStore()
  const { score, total, addCorrect, addWrong } = useScore()
  const [problem, setProblem] = useState(generateProblem)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)

  const next = useCallback(() => {
    setProblem(generateProblem())
    setFeedback(null)
    setTimerKey((k) => k + 1)
  }, [])

  const handleSelect = (opt: string) => {
    if (feedback) return
    if (opt === problem.correct.word) {
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
      title="📖 단어읽기"
      backTo="/korean"
      backLabel="국어"
      score={score}
      total={total}
      timerEnabled={timerEnabled}
      timerSeconds={12}
      timerKey={timerKey}
      onTimeUp={handleTimeUp}
    >
      <div className="text-center mb-4">
        <div className="text-8xl mb-2">{problem.correct.emoji}</div>
        <p className="text-gray-400 text-sm">이 그림의 이름을 찾아요!</p>
      </div>

      {feedback ? (
        <Feedback type={feedback} onDone={next} />
      ) : (
        <OptionGrid
          options={problem.options.map((o) => o.word)}
          onSelect={handleSelect}
          columns={2}
        />
      )}
    </GameLayout>
  )
}
