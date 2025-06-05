import { useEffect, useState, useRef } from 'react'
import { QueueParticipant } from '../types'

export function useAutoStart(queue: QueueParticipant[], onStart?: (participant: QueueParticipant) => void | Promise<void>) {
  const [autoStartCountdown, setAutoStartCountdown] = useState<number | null>(null)
  const countdownInterval = useRef<NodeJS.Timeout | null>(null)
  const isCountingDown = useRef<boolean>(false)

  // 自動開始カウントダウン
  useEffect(() => {
    if (autoStartCountdown === null || autoStartCountdown <= 0) {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
      return
    }

    countdownInterval.current = setInterval(() => {
      setAutoStartCountdown(prev => {
        if (prev === null || prev <= 1) {
          // カウントダウン終了 - 自動的に通話開始
          isCountingDown.current = false
          const nextParticipant = queue.find(p => p.status === 'waiting')
          if (nextParticipant && onStart) {
            onStart(nextParticipant)
          }
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
    }
  }, [autoStartCountdown, queue, onStart])

  const startCountdown = (seconds: number = 5) => {
    if (!isCountingDown.current) {
      isCountingDown.current = true
      setAutoStartCountdown(seconds)
    }
  }

  const cancelCountdown = () => {
    isCountingDown.current = false
    setAutoStartCountdown(null)
  }

  return {
    autoStartCountdown,
    startCountdown,
    cancelCountdown,
    isCountingDown: isCountingDown.current,
  }
}