'use client'

import { useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { endCall, endQueueCall } from '@/features/creator-calls/actions'
import type { DailyCall, DailyParticipant } from '@daily-co/daily-js'

interface UseCallEndHandlerProps {
  isCreator: boolean
  isQueueCall: boolean
  planId: string | null
  bookingId: string | null
  callFrame: DailyCall | null
  participants: Record<string, DailyParticipant>
}

export function useCallEndHandler({
  isCreator,
  isQueueCall,
  planId,
  bookingId,
  callFrame,
  participants
}: UseCallEndHandlerProps) {
  const router = useRouter()
  const isEndingCall = useRef(false)

  const handleEndCall = useCallback(async () => {
    console.log('[handleEndCall] Called, isEndingCall.current:', isEndingCall.current)
    
    // 既に終了処理中の場合は何もしない
    if (isEndingCall.current) {
      console.log('[handleEndCall] Already ending call, skipping')
      return
    }
    
    console.log('[handleEndCall] Starting end call process...')
    console.log('[handleEndCall] Current params:', { isCreator, isQueueCall, planId, bookingId })
    isEndingCall.current = true
    
    try {
      // クリエイターのみが通話を終了できる
      if (isCreator) {
        console.log('[handleEndCall] Creator ending call...')
        // 通話終了処理を先に実行（Daily.coの処理より前に）
        if (isQueueCall && planId) {
          console.log('[handleEndCall] Ending queue call, planId:', planId)
          // キューベースの通話
          const result = await endQueueCall(planId)
          console.log('[handleEndCall] endQueueCall result:', result)
          if (result.error) {
            toast.error('通話の終了処理に失敗しました')
          } else {
            toast.success('通話を終了しました')
            
            // 次の参加者がいる場合の通知
            if (result.hasMoreParticipants) {
              toast.info('次の参加者が待機しています', {
                duration: 3000
              })
            }
          }
        } else if (bookingId && !bookingId.startsWith('queue-')) {
          console.log('[handleEndCall] Ending regular call, bookingId:', bookingId)
          // 通常の通話の場合
          const result = await endCall(bookingId)
          console.log('[handleEndCall] endCall result:', result)
          if (result.error) {
            toast.error('通話の終了処理に失敗しました')
          } else {
            toast.success('通話を終了しました')
          }
        } else {
          console.log('[handleEndCall] No valid booking or plan ID found')
          console.log('[handleEndCall] bookingId:', bookingId, 'isQueueCall:', isQueueCall, 'planId:', planId)
        }
      } else {
        console.log('[handleEndCall] User leaving call...')
        // ユーザーの場合も時間切れで退出する
        toast.info('通話時間が終了しました')
      }
    } catch (error) {
      console.error('[handleEndCall] Unexpected error:', error)
      toast.error('通話終了中にエラーが発生しました')
      // エラー時はフラグをリセット
      isEndingCall.current = false
      return // エラー時は早期リターン
    }

    // Daily.coの処理
    console.log('[handleEndCall] Processing Daily.co cleanup...')
    if (callFrame) {
      try {
        console.log('[handleEndCall] Leaving Daily.co room...')
        await callFrame.leave()
        console.log('[handleEndCall] Destroying Daily.co frame...')
        callFrame.destroy()
        console.log('[handleEndCall] Daily.co cleanup completed')
      } catch (error) {
        console.error('[handleEndCall] Error ending Daily.co call:', error)
      }
    }

    // リダイレクト処理
    console.log('[handleEndCall] Redirecting user...')
    if (isCreator) {
      if (isQueueCall && planId) {
        console.log('[handleEndCall] Redirecting to waiting room')
        // 待機室に戻る
        router.push(`/creator/waiting-room/${planId}`)
      } else {
        console.log('[handleEndCall] Redirecting to calls page')
        router.push('/creator/calls')
      }
    } else {
      // ユーザーの場合は退出のみ
      toast.success('通話から退出しました')
      // 通話完了ページへ遷移（可能な限り情報を渡す）
      const params = new URLSearchParams()
      if (bookingId) params.set('bookingId', bookingId)
      const urlParams = new URLSearchParams(window.location.search)
      const duration = urlParams.get('duration')
      if (duration) params.set('duration', duration)
      // クリエイターIDは通話参加者から取得できる場合
      const creatorParticipant = Object.values(participants).find(p => p.owner)
      if (creatorParticipant?.user_id) params.set('creatorId', creatorParticipant.user_id)
      
      router.push(`/call/completed?${params.toString()}`)
    }
  }, [callFrame, isCreator, isQueueCall, planId, bookingId, router, participants])

  const resetEndingFlag = useCallback(() => {
    isEndingCall.current = false
  }, [])

  return {
    handleEndCall,
    resetEndingFlag,
    isEndingCall: () => isEndingCall.current
  }
}