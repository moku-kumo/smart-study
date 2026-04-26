import { useState } from 'react'
import { Link } from 'react-router-dom'
import SubjectCard from '@/components/SubjectCard'
import SettingsModal from '@/components/SettingsModal'
import { ChevronLeft, Settings } from 'lucide-react'

const modes = [
  { to: '/english/alphabet', emoji: '🅰️', label: '알파벳' },
  { to: '/english/picture', emoji: '🖼️', label: '그림단어' },
  { to: '/english/listen', emoji: '🔊', label: '듣기' },
]

export default function EnglishHome() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div className="min-h-dvh bg-gradient-to-br from-green-50 to-emerald-50 p-6 relative">
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/70 hover:bg-white shadow-md transition"
        aria-label="설정"
      >
        <Settings size={24} className="text-gray-500" />
      </button>
      <Link to="/" className="inline-flex items-center gap-1 text-green-500 hover:text-green-700 mb-6">
        <ChevronLeft size={20} /> 홈으로
      </Link>
      <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">🔤 영어</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
        {modes.map((m, i) => (
          <SubjectCard key={m.to} {...m} index={i} />
        ))}
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
