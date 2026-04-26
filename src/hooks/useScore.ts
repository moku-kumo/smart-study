import { useState, useCallback } from 'react'

export function useScore() {
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const addCorrect = useCallback(() => {
    setScore((s) => s + 1)
    setTotal((t) => t + 1)
  }, [])

  const addWrong = useCallback(() => {
    setTotal((t) => t + 1)
  }, [])

  const reset = useCallback(() => {
    setScore(0)
    setTotal(0)
  }, [])

  return { score, total, addCorrect, addWrong, reset }
}
