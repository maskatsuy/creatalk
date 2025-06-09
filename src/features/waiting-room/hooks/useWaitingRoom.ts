import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  getWaitingRoomStatus, 
  startQueueCall, 
  endQueueCall,
  addTestParticipant,
  rejoinQueueCall
} from '@/features/creator-calls/actions'
import { WaitingRoomStatus, WaitingRoomActions } from '../types'

export function useWaitingRoom(planId: string) {
  const router = useRouter()
  const [status, setStatus] = useState<WaitingRoomStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const refreshInterval = useRef<NodeJS.Timeout | null>(null)

  // データを取得する関数
  const fetchStatus = useCallback(async () => {
    try {
      const result = await getWaitingRoomStatus(planId)
      
      // resultがundefinedまたはnullの場合の処理
      if (!result) {
        console.error('No result from getWaitingRoomStatus')
        toast.error('データの取得に失敗しました')
        setLoading(false)
        return
      }
      
      if (result.error) {
        // 認証エラーの場合は通知を出さずにリダイレクト
        if (result.error === 'Unauthorized') {
          router.push('/login')
        } else {
          toast.error(result.error)
          router.push('/creator/calls')
        }
        return
      }
      
      const newStatus: WaitingRoomStatus = {
        queue: result.participants || [],
        current_call: result.currentCall ? {
          id: result.currentCall.id,
          participant: result.currentParticipant,
          started_at: result.currentCall.started_at,
          ends_at: result.currentCall.ends_at
        } : null,
        creator_status: result.creatorStatus || 'waiting',
        plan: result.plan
      }
      console.log('[useWaitingRoom] Status fetched:', {
        queueLength: newStatus.queue?.length || 0,
        currentCall: !!newStatus.current_call,
        creatorStatus: newStatus.creator_status,
        plan: newStatus.plan
      })
      
      // 更新前の状態を保存
      setStatus(prevStatus => {
        // 現在の通話が終了した場合、UIを即座に更新
        if (prevStatus?.current_call && !newStatus.current_call) {
          console.log('[useWaitingRoom] Current call ended, updating UI')
        }
        return newStatus
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching waiting room status:', error)
      toast.error('データの取得に失敗しました')
      setLoading(false)
    }
  }, [planId, router])

  // 初回データ取得
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // 定期的にデータを更新
  useEffect(() => {
    refreshInterval.current = setInterval(fetchStatus, 3000) // 3秒ごと
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current)
      }
    }
  }, [fetchStatus])

  // 通話開始
  const startCall = useCallback(async (participantId: string) => {
    setActionLoading(true)
    try {
      const result = await startQueueCall(planId, participantId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.embedUrl) {
        toast.success('通話を開始しました')
        return result.embedUrl
      }
    } catch (error) {
      console.error('Error starting call:', error)
      toast.error('通話の開始に失敗しました')
    } finally {
      setActionLoading(false)
    }
  }, [planId])

  // 通話終了
  const endCall = useCallback(async () => {
    if (!status?.current_call) return

    setActionLoading(true)
    try {
      const result = await endQueueCall(planId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('通話を終了しました')
        
        // 通話終了後、UIをすぐに更新
        setStatus(prev => {
          if (!prev) return prev
          return {
            ...prev,
            current_call: null,
            creator_status: 'waiting'
          }
        })
        
        // 次の参加者がいる場合の通知
        if (result.hasMoreParticipants) {
          toast.info('次の参加者が待機しています')
        }
        
        // 即座に最新データを取得
        console.log('[useWaitingRoom] Fetching status after call end...')
        // 最初の取得は即座に
        fetchStatus()
        // 念のため少し遅延してからも取得
        setTimeout(() => {
          fetchStatus()
        }, 1500)
      }
    } catch (error) {
      console.error('Error ending call:', error)
      toast.error('通話の終了に失敗しました')
    } finally {
      setActionLoading(false)
    }
  }, [status?.current_call, planId, fetchStatus])

  // 通話に復帰
  const rejoinCall = useCallback(async () => {
    if (!status?.current_call) {
      toast.error('進行中の通話がありません')
      return
    }

    setActionLoading(true)
    try {
      const result = await rejoinQueueCall(planId, status.current_call.id)
      if (result.error) {
        toast.error(result.error)
      } else if (result.embedUrl) {
        return result.embedUrl
      }
    } catch (error) {
      console.error('Error rejoining call:', error)
      toast.error('通話への復帰に失敗しました')
    } finally {
      setActionLoading(false)
    }
  }, [status?.current_call, planId])

  // テスト参加者追加
  const addTestUser = useCallback(async () => {
    setActionLoading(true)
    try {
      const result = await addTestParticipant(planId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('テスト参加者を追加しました')
        fetchStatus()
      }
    } catch (error) {
      console.error('Error adding test participant:', error)
      toast.error('テスト参加者の追加に失敗しました')
    } finally {
      setActionLoading(false)
    }
  }, [planId, fetchStatus])

  const actions: WaitingRoomActions = {
    startCall,
    endCall,
    rejoinCall,
    addTestParticipant: addTestUser,
    refreshStatus: fetchStatus,
  }

  return {
    status,
    loading,
    actionLoading,
    actions,
  }
}