import { useSettingsStore } from '@/stores/settingsStore'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { soundEnabled, setSoundEnabled, timerEnabled, setTimerEnabled, difficulty, setDifficulty } =
    useSettingsStore()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => onOpenChange(false)}>
      <div
        className="bg-white rounded-3xl shadow-xl p-6 w-[320px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">⚙️ 설정</h2>

        <div className="space-y-5">
          {/* 소리 */}
          <label className="flex items-center justify-between">
            <span className="text-lg">🔊 소리</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-14 h-8 rounded-full transition-colors ${soundEnabled ? 'bg-green-400' : 'bg-gray-300'} relative`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
          </label>

          {/* 타이머 */}
          <label className="flex items-center justify-between">
            <span className="text-lg">⏱️ 타이머</span>
            <button
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={`w-14 h-8 rounded-full transition-colors ${timerEnabled ? 'bg-green-400' : 'bg-gray-300'} relative`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${timerEnabled ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
          </label>

          {/* 난이도 */}
          <div>
            <span className="text-lg block mb-2">⭐ 난이도</span>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl font-bold text-lg transition-colors ${
                    difficulty === d
                      ? 'bg-orange-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {'⭐'.repeat(d)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          className="mt-6 w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
