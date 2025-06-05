import { useEffect, useState, useRef } from 'react'
import { CurrentCall } from '../types'

export function useConnectionTimer(currentCall: CurrentCall | null | undefined) {
  const [connectionTime, setConnectionTime] = useState<number>(0)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)
  const connectionStartTime = useRef<Date | null>(null)

  useEffect(() => {
    if (currentCall) {
      const startedAt = new Date(currentCall.started_at)
      const now = new Date()
      
      // 通話開始から10秒以内は「接続中」とみなす
      const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
      
      if (elapsedSeconds < 10) {
        setIsConnecting(true)
        setConnectionTime(elapsedSeconds)
        connectionStartTime.current = startedAt
      } else {
        setIsConnecting(false)
        setConnectionTime(0)
        connectionStartTime.current = null
      }
    } else {
      setIsConnecting(false)
      setConnectionTime(0)
      connectionStartTime.current = null
    }
  }, [currentCall])

  useEffect(() => {
    if (!isConnecting || !connectionStartTime.current) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
      return
    }

    timerInterval.current = setInterval(() => {
      if (connectionStartTime.current) {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - connectionStartTime.current.getTime()) / 1000)
        
        if (elapsed >= 10) {
          // 10秒経過したら接続完了
          setIsConnecting(false)
          setConnectionTime(0)
        } else {
          setConnectionTime(elapsed)
        }
      }
    }, 1000)

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [isConnecting])

  return {
    isConnecting,
    connectionTime,
    connectionTimeRemaining: Math.max(0, 10 - connectionTime)
  }
}