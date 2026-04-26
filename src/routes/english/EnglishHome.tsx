import { Link } from 'react-router-dom'
import SubjectCard from '@/components/SubjectCard'
import { ChevronLeft } from 'lucide-react'

const modes = [
  { to: '/english/alphabet', emoji: '🅰️', label: '알파벳' },
  { to: '/english/picture', emoji: '🖼️', label: '그림단어' },
  { to: '/english/listen', emoji: '🔊', label: '듣기' },
]

export default function EnglishHome() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-green-500 hover:text-green-700 mb-6">
        <ChevronLeft size={20} /> 홈으로
      </Link>
      <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">🔤 영어</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
        {modes.map((m, i) => (
          <SubjectCard key={m.to} {...m} index={i} />
        ))}
      </div>
    </div>
  )
}
