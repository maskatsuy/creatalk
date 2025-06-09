'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useVideoCall } from '@/hooks/useVideoCall'
import { useCallTimer } from '@/hooks/useCallTimer'
import { useCallEndHandler } from '@/hooks/useCallEndHandler'
import { CallHeader } from '@/components/call/CallHeader'
import { VideoContainer } from '@/components/call/VideoContainer'
import type { DailyParticipant, DailyEventObjectFatalError } from '@daily-co/daily-js'

export default function CallPage() {
  const router = useRouter()
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isQueueCall, setIsQueueCall] = useState(false)
  const [planId, setPlanId] = useState<string | null>(null)
  const [isCreator, setIsCreator] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)
  const initializeCallRef = useRef(false)

  // カスタムフックの使用
  const {
    callFrame,
    participants,
    initializing,
    initializeCall
  } = useVideoCall({
    onError: handleVideoError,
    onLeftMeeting: handleLeftMeeting
  })

  const { timeRemaining, setTime, formatTime } = useCallTimer({
    onTimeUp: handleTimeUp
  })

  const { handleEndCall, resetEndingFlag, isEndingCall } = useCallEndHandler({
    isCreator,
    isQueueCall,
    planId,
    bookingId,
    callFrame,
    participants
  })

  // Container ref callback
  const containerCallbackRef = useCallback((element: HTMLDivElement | null) => {
    setContainerElement(element)
  }, [])

  // Component mount/unmount
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      resetEndingFlag()
    }
  }, [resetEndingFlag])

  // URLパラメータの取得と初期設定
  useEffect(() => {
    if (!isMounted) return

    const urlParams = new URLSearchParams(window.location.search)
    const roomUrl = urlParams.get('url')
    const token = urlParams.get('t')
    const duration = urlParams.get('duration')
    const booking = urlParams.get('booking')
    const queueParam = urlParams.get('queue') === 'true'
    const planIdParam = urlParams.get('planId')
    const userTypeParam = urlParams.get('userType')

    if (!roomUrl || !token) {
      toast.error('通話情報が不足しています')
      router.push(userTypeParam === 'user' ? '/my-bookings' : '/creator/calls')
      return
    }

    // State設定
    if (booking) setBookingId(booking)
    setIsQueueCall(queueParam)
    if (planIdParam) setPlanId(planIdParam)
    if (userTypeParam === 'user') setIsCreator(false)

    // 時間設定
    const endsAtParam = urlParams.get('endsAt')
    if (endsAtParam) {
      const endsAt = new Date(endsAtParam)
      const now = new Date()
      const remainingMs = endsAt.getTime() - now.getTime()
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000))
      setTime(remainingSeconds)
    } else if (duration) {
      const durationMinutes = parseInt(duration)
      setTime(durationMinutes * 60 + 10)
    }
  }, [isMounted, router, setTime])

  // 通話の初期化
  useEffect(() => {
    if (!containerElement || !isMounted || initializeCallRef.current) return

    const urlParams = new URLSearchParams(window.location.search)
    const roomUrl = urlParams.get('url')
    const token = urlParams.get('t')

    if (roomUrl && token) {
      initializeCallRef.current = true
      
      const videoEnabled = urlParams.get('videoEnabled') !== 'false'
      const audioEnabled = urlParams.get('audioEnabled') !== 'false'
      const videoDevice = urlParams.get('videoDevice')
      const audioDevice = urlParams.get('audioDevice')

      initializeCall(roomUrl, token, containerElement, {
        videoEnabled,
        audioEnabled,
        videoDevice,
        audioDevice
      }).catch(error => {
        console.error('Failed to initialize call:', error)
        router.push(isCreator ? '/creator/calls' : '/my-bookings')
      })
    }
  }, [containerElement, isMounted, initializeCall, router, isCreator])

  // ビデオエラーハンドラ
  function handleVideoError(event: DailyEventObjectFatalError) {
    const errorMsg = event.errorMsg || (event.error && typeof event.error === 'object' && event.error.msg) || ''
    const errorType = event.error && typeof event.error === 'object' && event.error.type

    if (errorMsg.toLowerCase().includes('meeting has ended') || 
        errorMsg.toLowerCase().includes('room was deleted') ||
        errorType === 'no-room') {
      
      if (isCreator && !isEndingCall()) {
        if (isQueueCall && planId) {
          handleEndCall()
        }
      }
      
      toast.info(isCreator ? '通話は終了しました' : 'クリエイターが通話を終了しました', {
        duration: 3000
      })
      
      setTimeout(() => {
        if (isCreator) {
          router.push(isQueueCall && planId ? `/creator/waiting-room/${planId}` : '/creator/calls')
        } else {
          const params = new URLSearchParams()
          if (bookingId) params.set('bookingId', bookingId)
          const urlParams = new URLSearchParams(window.location.search)
          const duration = urlParams.get('duration')
          if (duration) params.set('duration', duration)
          const creatorParticipant = Object.values(participants).find(p => p.owner)
          if (creatorParticipant?.user_id) params.set('creatorId', creatorParticipant.user_id)
          
          router.push(`/call/completed?${params.toString()}`)
        }
      }, 1000)
      return
    }
    
    toast.error('通話エラーが発生しました')
  }

  // 通話退出ハンドラ
  function handleLeftMeeting() {
    if (!isCreator) {
      toast.info('通話から退室しました')
      const params = new URLSearchParams()
      if (bookingId) params.set('bookingId', bookingId)
      const urlParams = new URLSearchParams(window.location.search)
      const durationParam = urlParams.get('duration')
      if (durationParam) params.set('duration', durationParam)
      const creatorParticipant = Object.values(participants).find((p) => (p as DailyParticipant).owner)
      if (creatorParticipant?.user_id) params.set('creatorId', creatorParticipant.user_id)
      
      router.push(`/call/completed?${params.toString()}`)
    }
  }

  // 時間切れハンドラ
  function handleTimeUp() {
    if (!isEndingCall()) {
      toast.warning('通話時間が終了しました', { duration: 3000 })
      handleEndCall()
    }
  }

  // 待機室に戻るハンドラ
  const handleReturnToWaitingRoom = useCallback(() => {
    if (isQueueCall && planId) {
      router.push(`/creator/waiting-room/${planId}`)
    }
  }, [isQueueCall, planId, router])

  const participantCount = Object.keys(participants).length
  const showLoadingOverlay = initializing

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <CallHeader
        initializing={initializing}
        participantCount={participantCount}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        onEndCall={handleEndCall}
        onReturnToWaitingRoom={isQueueCall && planId ? handleReturnToWaitingRoom : undefined}
        isCreator={isCreator}
        isEndingCall={isEndingCall()}
      />

      <div className="flex-1">
        <VideoContainer 
          ref={containerCallbackRef}
          showLoadingOverlay={showLoadingOverlay}
        />
      </div>
    </div>
  )
}