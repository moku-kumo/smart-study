import { useState, useCallback, useEffect } from 'react'
import GameLayout from '@/components/game/GameLayout'
import OptionGrid from '@/components/game/OptionGrid'
import Feedback from '@/components/game/Feedback'
import { useScore } from '@/hooks/useScore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSpeech } from '@/hooks/useSpeech'
import { jamoList, type JamoEntry } from '@/data/koreanJamo'
import { shuffle, pickRandom } from '@/lib/random'
import { playCorrect, playWrong } from '@/lib/audio'

function generateProblem() {
  const [correct, ...distractors] = pickRandom(jamoList, 4) as [JamoEntry, ...JamoEntry[]]
  const options = shuffle([correct, ...distractors])
  return { correct, options }
}

export default function Jamo() {
  const { timerEnabled, soundEnabled } = useSettingsStore()
  const { score, total, addCorrect, addWrong } = useScore()
  const { speak } = useSpeech()
  const [problem, setProblem] = useState(generateProblem)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)

  useEffect(() => {
    speak(problem.correct.sound, 'ko-KR')
  }, [problem.correct.sound, speak])

  const next = useCallback(() => {
    setProblem(generateProblem())
    setFeedback(null)
    setTimerKey((k) => k + 1)
  }, [])

  const handleSelect = (opt: string) => {
    if (feedback) return
    if (opt === problem.correct.char) {
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
      title="ㄱㅏ 자음/모음"
      backTo="/korean"
      backLabel="국어"
      score={score}
      total={total}
      timerEnabled={timerEnabled}
      timerSeconds={10}
      timerKey={timerKey}
      onTimeUp={handleTimeUp}
    >
      <div className="text-center mb-4">
        <p className="text-sm text-gray-400 mb-1">
          이 소리의 글자를 찾아요! ({problem.correct.type === 'consonant' ? '자음' : '모음'})
        </p>
        <div className="text-6xl font-bold text-purple-500 mb-2">
          "{problem.correct.name}"
        </div>
      </div>

      {feedback ? (
        <Feedback type={feedback} onDone={next} />
      ) : (
        <OptionGrid
          options={problem.options.map((o) => o.char)}
          onSelect={handleSelect}
          columns={4}
        />
      )}
    </GameLayout>
  )
}
