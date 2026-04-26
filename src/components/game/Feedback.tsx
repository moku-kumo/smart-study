import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface FeedbackProps {
  type: 'correct' | 'wrong' | null
  onDone?: () => void
}

const messages = {
  correct: { text: '정답! 🎉', color: 'text-green-500' },
  wrong: { text: '다시 해봐요! 💪', color: 'text-red-400' },
}

export default function Feedback({ type, onDone }: FeedbackProps) {
  useEffect(() => {
    if (type && onDone) {
      const t = setTimeout(onDone, type === 'correct' ? 1000 : 1500)
      return () => clearTimeout(t)
    }
  }, [type, onDone])

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          className={`text-3xl font-bold ${messages[type].color}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {messages[type].text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
