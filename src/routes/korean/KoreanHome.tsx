import { Link } from 'react-router-dom'
import SubjectCard from '@/components/SubjectCard'
import { ChevronLeft } from 'lucide-react'

const modes = [
  { to: '/korean/jamo', emoji: 'ㄱㅏ', label: '자음/모음' },
  { to: '/korean/word', emoji: '📖', label: '단어읽기' },
  { to: '/korean/batchim', emoji: '📝', label: '받침 단어' },
]

export default function KoreanHome() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-700 mb-6">
        <ChevronLeft size={20} /> 홈으로
      </Link>
      <h1 className="text-4xl font-bold text-purple-600 mb-8 text-center">가 국어</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
        {modes.map((m, i) => (
          <SubjectCard key={m.to} {...m} index={i} />
        ))}
      </div>
    </div>
  )
}
