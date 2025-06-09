'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface UseCallTimerProps {
  initialTime?: number | null
  onTimeUp?: () => void
  warningThresholds?: {
    minutes5?: boolean
    minutes1?: boolean
  }
}

export function useCallTimer({ 
  initialTime = null, 
  onTimeUp,
  warningThresholds = { minutes5: true, minutes1: true }
}: UseCallTimerProps = {}) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialTime)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef({ minutes5: false, minutes1: false })

  // 時間を設定する関数
  const setTime = useCallback((time: number | null) => {
    setTimeRemaining(time)
    // 警告フラグをリセット
    warningShownRef.current = { minutes5: false, minutes1: false }
  }, [])

  // タイマーを開始する関数
  const startTimer = useCallback(() => {
    if (timeRemaining === null || timeRemaining <= 0 || timerRef.current) return


    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null
        
        if (prev <= 1) {
          return 0
        }
        
        // 残り5分で警告（310秒 = 5分10秒から10秒引いた値）
        if (prev === 310 && !warningShownRef.current.minutes5 && warningThresholds.minutes5) {
          warningShownRef.current.minutes5 = true
          toast.warning('通話終了まで残り5分です')
        }
        // 残り1分で警告（70秒 = 1分10秒から10秒引いた値）
        if (prev === 70 && !warningShownRef.current.minutes1 && warningThresholds.minutes1) {
          warningShownRef.current.minutes1 = true
          toast.warning('通話終了まで残り1分です')
        }
        
        return prev - 1
      })
    }, 1000)
  }, [timeRemaining, warningThresholds])

  // タイマーを停止する関数
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 時間のフォーマット関数
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // タイマーの自動開始
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !timerRef.current) {
      startTimer()
    }

    return () => {
      stopTimer()
    }
  }, [timeRemaining, startTimer, stopTimer])

  // 時間切れの処理
  useEffect(() => {
    if (timeRemaining === 0 && onTimeUp) {
      onTimeUp()
    }
  }, [timeRemaining, onTimeUp])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return {
    timeRemaining,
    setTime,
    startTimer,
    stopTimer,
    formatTime
  }
}