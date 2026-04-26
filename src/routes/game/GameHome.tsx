import { Link } from 'react-router-dom'
import { ChevronLeft, Lock, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStudyTimeStore, getTodaySeconds, isGameUnlocked, canPlayGame, getRemainingGameSeconds, REQUIRED_STUDY_SECONDS } from '@/stores/studyTimeStore'
import SubjectCard from '@/components/SubjectCard'

const games = [
  { to: '/game/whack', emoji: '🐹', label: '두더지잡기' },
  { to: '/game/balloon', emoji: '🎈', label: '풍선 터뜨리기' },
  { to: '/game/spot', emoji: '🔍', label: '틀린그림찾기' },
]

export default function GameHome() {
  const todaySeconds = useStudyTimeStore(getTodaySeconds)
  const unlocked = useStudyTimeStore(isGameUnlocked)
  const playable = useStudyTimeStore(canPlayGame)
  const remainingGame = useStudyTimeStore(getRemainingGameSeconds)
  const required = REQUIRED_STUDY_SECONDS

  const mins = Math.floor(todaySeconds / 60)
  const secs = todaySeconds % 60
  const requiredMins = Math.floor(required / 60)
  const progress = Math.min(100, (todaySeconds / required) * 100)
  const remMins = Math.floor(remainingGame / 60)
  const remSecs = remainingGame % 60

  return (
    <div className="min-h-dvh bg-gradient-to-br from-pink-50 to-orange-50 p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-700 mb-6">
        <ChevronLeft size={20} /> 홈으로
      </Link>
      <h1 className="text-4xl font-bold text-pink-600 mb-4 text-center">🎮 게임</h1>

      {/* 공부 시간 프로그레스 */}
      <div className="max-w-xs mx-auto mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>오늘 공부 시간</span>
          <span>{mins}분 {secs}초 / {requiredMins}분</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${unlocked ? 'bg-green-400' : 'bg-orange-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {!unlocked && (
          <p className="text-center text-sm text-gray-400 mt-2">
            {requiredMins}분 이상 공부하면 게임을 할 수 있어요! 🔓
          </p>
        )}
      </div>

      {/* 남은 게임 시간 */}
      {unlocked && (
        <div className="max-w-xs mx-auto mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm">
            <Clock size={18} className={playable ? 'text-green-500' : 'text-red-400'} />
            <span className={`font-bold ${playable ? 'text-green-600' : 'text-red-500'}`}>
              남은 게임 시간: {remMins}분 {remSecs}초
            </span>
          </div>
          {playable ? (
            <p className="text-xs text-gray-400 mt-1">공부한 만큼 게임할 수 있어요!</p>
          ) : (
            <p className="text-xs text-red-400 mt-1">게임 시간을 다 썼어요! 더 공부하면 시간이 늘어나요 📚</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
        {games.map((g, i) =>
          playable ? (
            <SubjectCard key={g.to} {...g} index={i} />
          ) : (
            <div
              key={g.to}
              className="relative flex flex-col items-center justify-center gap-2 rounded-3xl bg-gray-200 text-gray-400 p-8 min-h-[140px]"
            >
              <span className="text-5xl grayscale opacity-50">{g.emoji}</span>
              <span className="text-2xl font-bold">{g.label}</span>
              <Lock size={28} className="absolute top-4 right-4 text-gray-400" />
            </div>
          ),
        )}
      </div>
    </div>
  )
}
