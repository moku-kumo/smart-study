import { useSettingsStore, type AdditionDifficulty, type AlphabetMode, type JamoFilter } from '@/stores/settingsStore'
import { useLocation } from 'react-router-dom'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-14 h-8 rounded-full transition-colors ${on ? 'bg-green-400' : 'bg-gray-300'} relative`}
    >
      <span
        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  )
}

function SegmentButton<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 min-w-[60px] py-2 rounded-xl font-bold text-sm transition-colors ${
            value === o.value
              ? 'bg-orange-400 text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const store = useSettingsStore()
  const location = useLocation()
  const path = location.pathname

  if (!open) return null

  const isMath = path.includes('/math')
  const isAddition = path.includes('/addition')
  const isBlank = path.includes('/blank')
  const isPattern = path.includes('/pattern')
  const isEnglish = path.includes('/english')
  const isAlphabet = path.includes('/alphabet')
  const isPicture = path.includes('/picture')
  const isListen = path.includes('/listen')
  const isKorean = path.includes('/korean')
  const isJamo = path.includes('/jamo')
  const isWord = path.includes('/word') || path.includes('/batchim')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => onOpenChange(false)}>
      <div
        className="bg-white rounded-3xl shadow-xl p-6 w-[340px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-5 text-center">⚙️ 설정</h2>

        <div className="space-y-4">
          {/* ─── 공통 설정 ─── */}
          <label className="flex items-center justify-between">
            <span className="text-lg">🔊 소리</span>
            <Toggle on={store.soundEnabled} onToggle={() => store.setSoundEnabled(!store.soundEnabled)} />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-lg">⏱️ 타이머</span>
            <Toggle on={store.timerEnabled} onToggle={() => store.setTimerEnabled(!store.timerEnabled)} />
          </label>

          {store.timerEnabled && (
            <div>
              <span className="text-sm text-gray-500">제한시간: {store.timerSeconds}초</span>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={store.timerSeconds}
                onChange={(e) => store.setTimerSeconds(Number(e.target.value))}
                className="w-full mt-1 accent-orange-400"
              />
            </div>
          )}

          {/* ─── 수학: 더하기 ─── */}
          {(isAddition || (isMath && !isBlank && !isPattern)) && (
            <div className="border-t pt-3">
              <span className="text-lg block mb-2">🧮 더하기 난이도</span>
              <SegmentButton<AdditionDifficulty>
                options={[
                  { value: 'easy', label: '쉬움 (1~5)' },
                  { value: 'normal', label: '보통 (0~10)' },
                  { value: 'hard', label: '어려움 (0~20)' },
                ]}
                value={store.additionDifficulty}
                onChange={store.setAdditionDifficulty}
              />
            </div>
          )}

          {/* ─── 수학: 빈칸채우기 ─── */}
          {(isBlank || (isMath && !isAddition && !isPattern)) && (
            <div className="border-t pt-3">
              <span className="text-lg block mb-2">✏️ 빈칸채우기</span>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">숫자범위: {store.patternSettings.minNum}~{store.patternSettings.maxNum}</span>
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      type="number"
                      min={1}
                      max={store.patternSettings.maxNum - 5}
                      value={store.patternSettings.minNum}
                      onChange={(e) => store.setPatternSettings({ minNum: Math.max(1, Number(e.target.value)) })}
                      className="w-20 border rounded-lg px-2 py-1 text-center"
                    />
                    <span>~</span>
                    <input
                      type="number"
                      min={store.patternSettings.minNum + 5}
                      max={100}
                      value={store.patternSettings.maxNum}
                      onChange={(e) => store.setPatternSettings({ maxNum: Math.min(100, Number(e.target.value)) })}
                      className="w-20 border rounded-lg px-2 py-1 text-center"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">빈칸 수: {store.patternSettings.blankCount}개</span>
                  <SegmentButton<string>
                    options={[
                      { value: '1', label: '1개' },
                      { value: '2', label: '2개' },
                      { value: '3', label: '3개' },
                    ]}
                    value={String(store.patternSettings.blankCount)}
                    onChange={(v) => store.setPatternSettings({ blankCount: Number(v) })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── 수학: 패턴채우기 ─── */}
          {(isPattern || (isMath && !isAddition && !isBlank)) && (
            <div className="border-t pt-3">
              <span className="text-lg block mb-2">📐 패턴채우기</span>
              <SegmentButton<'easy' | 'hard'>
                options={[
                  { value: 'easy', label: '쉬움 (5단위)' },
                  { value: 'hard', label: '어려움 (랜덤)' },
                ]}
                value={store.stepPatternSettings.difficulty}
                onChange={(v) => store.setStepPatternSettings({ difficulty: v })}
              />
              <div className="mt-2">
                <span className="text-sm text-gray-500">빈칸 수: {store.stepPatternSettings.blankCount}개</span>
                <SegmentButton<string>
                  options={[
                    { value: '1', label: '1개' },
                    { value: '2', label: '2개' },
                    { value: '3', label: '3개' },
                  ]}
                  value={String(store.stepPatternSettings.blankCount)}
                  onChange={(v) => store.setStepPatternSettings({ blankCount: Number(v) })}
                />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">최대 숫자: {store.stepPatternSettings.maxNum}</span>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={10}
                  value={store.stepPatternSettings.maxNum}
                  onChange={(e) => store.setStepPatternSettings({ maxNum: Number(e.target.value) })}
                  className="w-full mt-1 accent-orange-400"
                />
              </div>
            </div>
          )}

          {/* ─── 영어: 알파벳 ─── */}
          {(isAlphabet || (isEnglish && !isPicture && !isListen)) && (
            <div className="border-t pt-3">
              <span className="text-lg block mb-2">🅰️ 알파벳 모드</span>
              <SegmentButton<AlphabetMode>
                options={[
                  { value: 'upperToLower', label: '대→소' },
                  { value: 'lowerToUpper', label: '소→대' },
                  { value: 'mixed', label: '섞기' },
                ]}
                value={store.englishSettings.alphabetMode}
                onChange={(v) => store.setEnglishSettings({ alphabetMode: v })}
              />
            </div>
          )}

          {/* ─── 영어: 보기 수 & TTS ─── */}
          {(isPicture || isListen || (isEnglish && !isAlphabet)) && (
            <div className="border-t pt-3">
              <span className="text-lg block mb-2">📚 영어 단어</span>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">보기 수</span>
                  <SegmentButton<string>
                    options={[
                      { value: '2', label: '2개' },
                      { value: '4', label: '4개' },
                      { value: '6', label: '6개' },
                    ]}
                    value={String(store.englishSettings.wordCount)}
                    onChange={(v) => store.setEnglishSettings({ wordCount: Number(v) })}
                  />
                </div>
                {(isListen || isEnglish) && (
                  <div>
                    <span className="text-sm text-gray-500">듣기 속도: {store.englishSettings.ttsSpeed.toFixed(2)}</span>
                    <input
                      type="range"
                      min={0.5}
                      max={1.2}
                      step={0.05}
                      value={store.englishSettings.ttsSpeed}
                      onChange={(e) => store.setEnglishSettings({ ttsSpeed: Number(e.target.value) })}
                      className="w-full mt-1 accent-blue-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── 국어: 자음모음 ─── */}
          {(isJamo || (isKorean && !isWord)) && (
            <div className="border-t pt-3">
              <span className="text-lg block mb-2">ㄱㅏ 자음/모음 필터</span>
              <SegmentButton<JamoFilter>
                options={[
                  { value: 'all', label: '전체' },
                  { value: 'consonant', label: '자음만' },
                  { value: 'vowel', label: '모음만' },
                ]}
                value={store.koreanSettings.jamoFilter}
                onChange={(v) => store.setKoreanSettings({ jamoFilter: v })}
              />
            </div>
          )}

          {/* ─── 국어: 단어 길이 ─── */}
          {(isWord || (isKorean && !isJamo)) && (
            <div className="border-t pt-3">
              <span className="text-lg block mb-2">📖 단어 길이</span>
              <SegmentButton<string>
                options={[
                  { value: 'all', label: '전체' },
                  { value: 'short', label: '짧은 (2자)' },
                  { value: 'long', label: '긴 (3자+)' },
                ]}
                value={store.koreanSettings.wordLength}
                onChange={(v) => store.setKoreanSettings({ wordLength: v as 'all' | 'short' | 'long' })}
              />
            </div>
          )}
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
