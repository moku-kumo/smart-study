import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface SubjectCardProps {
  to: string
  emoji: string
  label: string
  index: number
}

export default function SubjectCard({ to, emoji, label, index }: SubjectCardProps) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
    >
      <Link
        to={to}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all min-h-[120px] border border-gray-100"
      >
        <span className="text-4xl">{emoji}</span>
        <span className="text-xl font-semibold text-gray-700">{label}</span>
      </Link>
    </motion.div>
  )
}
