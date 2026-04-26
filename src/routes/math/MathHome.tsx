import { Link } from 'react-router-dom'
import SubjectCard from '@/components/SubjectCard'
import { ChevronLeft } from 'lucide-react'

const modes = [
  { to: '/math/addition', emoji: '➕', label: '더하기' },
  { to: '/math/blank', emoji: '⬜', label: '빈칸채우기' },
  { to: '/math/pattern', emoji: '🧩', label: '패턴채우기' },
]

export default function MathHome() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 mb-6">
        <ChevronLeft size={20} /> 홈으로
      </Link>
      <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">🔢 수학</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
        {modes.map((m, i) => (
          <SubjectCard key={m.to} {...m} index={i} />
        ))}
      </div>
    </div>
  )
}
