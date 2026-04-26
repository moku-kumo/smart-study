import { motion } from 'framer-motion'
import { useTimer } from '@/hooks/useTimer'

interface TimerBarProps {
  seconds: number
  onTimeUp?: () => void
}

export default function TimerBar({ seconds, onTimeUp }: TimerBarProps) {
  const { fraction } = useTimer(seconds, onTimeUp)

  const color = fraction > 0.5 ? 'bg-green-400' : fraction > 0.2 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: '100%' }}
        animate={{ width: `${fraction * 100}%` }}
        transition={{ duration: 0.3, ease: 'linear' }}
      />
    </div>
  )
}
