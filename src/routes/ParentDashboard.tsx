import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStatsStore, getSessionsByDate, getRecentDays, MODE_NAMES, type SessionRecord } from '@/stores/statsStore'
import { useStudyTimeStore } from '@/stores/studyTimeStore'
import { randInt } from '@/lib/random'

function genMathProblem() {
  const a = randInt(2, 9)
  const b = randInt(2, 9)
  return { a, b, answer: a * b }
}

function DaySummary({ date, sessions }: { date: string; sessions: SessionRecord[] }) {
  const totalCorrect = sessions.reduce((s, r) => s + r.correct, 0)
  const totalQ = sessions.reduce((s, r) => s + r.total, 0)
  const totalMin = Math.round(sessions.reduce((s, r) => s + r.durationSec, 0) / 60)
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0

  const d = new Date(date)
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  const label = `${d.getMonth() + 1}/${d.getDate()}(${dayName})`

  if (sessions.length === 0) {
    return (
      <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50">
        <span className="text-sm text-gray-400 w-20">{label}</span>
        <span className="text-sm text-gray-300">학습 기록 없음</span>
      </div>
    )
  }

  // 모드별 그룹
  const byMode: Record<string, { correct: number; total: number }> = {}
  sessions.forEach(s => {
    if (!byMode[s.mode]) byMode[s.mode] = { correct: 0, total: 0 }
    byMode[s.mode].correct += s.correct
    byMode[s.mode].total += s.total
  })

  return (
    <div className="py-3 px-4 rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-700">{label}</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-500">📝 {totalQ}문제</span>
          <span className="text-green-500">✅ {accuracy}%</span>
          <span className="text-orange-500">⏱ {totalMin}분</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(byMode).map(([mode, data]) => {
          const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
          return (
            <span key={mode} className={`text-xs px-2 py-1 rounded-full ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {MODE_NAMES[mode] ?? mode} {pct}%
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function ParentDashboard() {
  const sessions = useStatsStore(s => s.sessions)
  const dailySeconds = useStudyTimeStore(s => s.dailySeconds)

  // 곱하기 인증
  const [authed, setAuthed] = useState(false)
  const [problem, setProblem] = useState(() => genMathProblem())
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(false)

  const checkAnswer = useCallback(() => {
    if (Number(answer) === problem.answer) {
      setAuthed(true)
    } else {
      setError(true)
      setProblem(genMathProblem())
      setAnswer('')
    }
  }, [answer, problem.answer])

  const days = getRecentDays(7)

  // 주간 요약
  const weekSessions = days.flatMap(d => getSessionsByDate(sessions, d))
  const weekCorrect = weekSessions.reduce((s, r) => s + r.correct, 0)
  const weekTotal = weekSessions.reduce((s, r) => s + r.total, 0)
  const weekAccuracy = weekTotal > 0 ? Math.round((weekCorrect / weekTotal) * 100) : 0
  const weekStudyMin = Math.round(days.reduce((s, d) => s + (dailySeconds[d] ?? 0), 0) / 60)
  const activeDays = days.filter(d => getSessionsByDate(sessions, d).length > 0).length

  if (!authed) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} /> 홈으로
        </Link>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">👨‍👩‍👧 부모 인증</h2>
          <p className="text-center text-sm text-gray-400 mb-6">곱하기 문제를 풀어 부모 모드에 접근하세요</p>
          <p className="text-4xl font-bold text-center mb-6">
            {problem.a} × {problem.b} = ?
          </p>
          {error && <p className="text-center text-red-500 text-sm mb-3">틀렸어요! 다시 풀어보세요</p>}
          <input
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={e => { setAnswer(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
            placeholder="답을 입력하세요"
            className="w-full text-center text-2xl font-bold border-2 border-blue-200 rounded-xl py-3 mb-4 focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={checkAnswer}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-blue-50 p-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Link to="/" className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 mb-6">
        <ChevronLeft size={20} /> 홈으로
      </Link>
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">📊 학습 통계</h1>

      {/* 주간 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-500">{activeDays}<span className="text-sm text-gray-400">/7일</span></p>
          <p className="text-xs text-gray-400 mt-1">학습일</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-500">{weekAccuracy}<span className="text-sm text-gray-400">%</span></p>
          <p className="text-xs text-gray-400 mt-1">정답률</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-purple-500">{weekTotal}<span className="text-sm text-gray-400">문제</span></p>
          <p className="text-xs text-gray-400 mt-1">풀은 문제</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-orange-500">{weekStudyMin}<span className="text-sm text-gray-400">분</span></p>
          <p className="text-xs text-gray-400 mt-1">총 공부시간</p>
        </motion.div>
      </div>

      {/* 일별 상세 */}
      <div className="max-w-lg mx-auto space-y-2">
        <h2 className="text-lg font-bold text-gray-600 mb-2">📅 최근 7일</h2>
        {days.map(d => (
          <DaySummary key={d} date={d} sessions={getSessionsByDate(sessions, d)} />
        ))}
      </div>

      {sessions.length === 0 && (
        <p className="text-center text-gray-400 mt-8">아직 학습 기록이 없어요. 공부를 시작해보세요! 📚</p>
      )}
    </div>
  )
}
