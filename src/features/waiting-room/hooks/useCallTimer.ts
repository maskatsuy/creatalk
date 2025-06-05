import { useEffect, useState, useRef } from 'react'
import { CurrentCall } from '../types'

export function useCallTimer(currentCall: CurrentCall | null | undefined, onTimeUp?: () => void) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 通話中の場合、残り時間を計算
    if (currentCall) {
      const endsAt = new Date(currentCall.ends_at)
      const now = new Date()
      const remaining = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000))
      setTimeRemaining(remaining)
    } else {
      setTimeRemaining(null)
    }
  }, [currentCall])

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
      return
    }

    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // 時間切れ - 通話を終了
          if (onTimeUp) {
            onTimeUp()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [timeRemaining, onTimeUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    timeRemaining,
    formattedTime: timeRemaining ? formatTime(timeRemaining) : null,
  }
}