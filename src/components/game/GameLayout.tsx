import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Settings } from 'lucide-react'
import TimerBar from './TimerBar'
import ScoreBoard from './ScoreBoard'
import SettingsModal from '@/components/SettingsModal'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import type { ReactNode } from 'react'

interface GameLayoutProps {
  title: string
  backTo: string
  backLabel?: string
  score: number
  total: number
  timerEnabled?: boolean
  timerSeconds?: number
  timerKey?: number
  onTimeUp?: () => void
  children: ReactNode
}

export default function GameLayout({
  title,
  backTo,
  backLabel = '뒤로',
  score,
  total,
  timerEnabled = true,
  timerSeconds = 10,
  timerKey,
  onTimeUp,
  children,
}: GameLayoutProps) {
  useStudyTimer()
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between mb-4">
        <Link to={backTo} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} /> {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-700">{title}</h2>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-full hover:bg-gray-200 transition"
            aria-label="설정"
          >
            <Settings size={18} className="text-gray-400" />
          </button>
        </div>
        <ScoreBoard score={score} total={total} />
      </header>

      {timerEnabled && (
        <TimerBar key={timerKey} seconds={timerSeconds} onTimeUp={onTimeUp} />
      )}

      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        {children}
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
