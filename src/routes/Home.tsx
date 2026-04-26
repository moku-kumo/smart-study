import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SettingsModal from '@/components/SettingsModal'
import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useStudyTimeStore, getTodaySeconds, isGameUnlocked, canPlayGame, getRemainingGameSeconds, REQUIRED_STUDY_SECONDS } from '@/stores/studyTimeStore'

const subjects = [
  { to: '/math', emoji: '🔢', label: '수학', color: 'from-blue-400 to-blue-500' },
  { to: '/english', emoji: '🔤', label: '영어', color: 'from-green-400 to-green-500' },
  { to: '/korean', emoji: '가', label: '국어', color: 'from-purple-400 to-purple-500' },
]

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const todaySeconds = useStudyTimeStore(getTodaySeconds)
  const required = REQUIRED_STUDY_SECONDS
  const unlocked = useStudyTimeStore(isGameUnlocked)
  const playable = useStudyTimeStore(canPlayGame)
  const remainingGame = useStudyTimeStore(getRemainingGameSeconds)
  const mins = Math.floor(todaySeconds / 60)
  const progress = Math.min(100, (todaySeconds / required) * 100)
  const remMins = Math.floor(remainingGame / 60)

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50 p-6 relative">
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/70 hover:bg-white shadow-md transition"
        aria-label="설정"
      >
        <Settings size={24} />
      </button>

      <motion.h1
        className="text-5xl font-bold text-orange-500 mb-2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        🎓 SmartStudy
      </motion.h1>
      <p className="text-lg text-gray-500 mb-10">놀면서 배우자!</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg">
        {subjects.map((s, i) => (
          <motion.div
            key={s.to}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 180 }}
          >
            <Link
              to={s.to}
              className={`flex flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br ${s.color} text-white p-8 shadow-lg hover:scale-105 active:scale-95 transition-transform min-h-[140px]`}
            >
              <span className="text-5xl">{s.emoji}</span>
              <span className="text-2xl font-bold">{s.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* 게임 */}
      <motion.div
        className="w-full max-w-lg mt-8"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 180 }}
      >
        <Link
          to="/game"
          className={`flex items-center gap-4 rounded-3xl p-6 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform ${
            playable
              ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white'
              : unlocked
                ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                : 'bg-gray-200 text-gray-400'
          }`}
        >
          <span className="text-5xl">{playable ? '🎮' : unlocked ? '⏰' : '🔒'}</span>
          <div className="flex-1">
            <span className="text-2xl font-bold block">게임</span>
            <div className="mt-1">
              <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs mt-0.5 block opacity-80">
                {playable
                  ? `게임 가능! 남은 시간: ${remMins}분`
                  : unlocked
                    ? '게임 시간을 다 썼어요! 더 공부하면 늘어나요'
                    : `${mins}분 공부함 — ${Math.floor(required / 60)}분 채우면 열려요!`}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
