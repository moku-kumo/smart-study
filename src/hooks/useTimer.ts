import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(seconds: number, onTimeUp?: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUpRef.current?.()
      return
    }
    const id = setInterval(() => {
      setRemaining((r) => {
        const next = r - 0.1
        if (next <= 0) {
          clearInterval(id)
          return 0
        }
        return next
      })
    }, 100)
    return () => clearInterval(id)
  }, [remaining <= 0]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => setRemaining(seconds), [seconds])

  return {
    remaining: Math.max(0, remaining),
    fraction: Math.max(0, remaining / seconds),
    reset,
  }
}
