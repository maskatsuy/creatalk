import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getUserQueueStatus, leaveQueue } from '../actions'
import type { QueueStatus } from '../types'

export function useUserQueueStatus(planId: string, userId: string) {
  const router = useRouter()
  const [status, setStatus] = useState<QueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const refreshInterval = useRef<NodeJS.Timeout | null>(null)
  const isMounted = useRef(true)
  const previousStatusRef = useRef<QueueStatus | null>(null)

  const fetchStatus = useCallback(async () => {
    // コンポーネントがアンマウントされている場合は処理を中断
    if (!isMounted.current) {
      return
    }
    
    let result;
    
    try {
      result = await getUserQueueStatus(planId, userId)
    } catch (error) {
      if (!isMounted.current) return
      
      console.error('[useUserQueueStatus] Error calling getUserQueueStatus:', error)
      // ログアウトなどで認証エラーになった場合は、静かに処理を終了
      if (error instanceof Error && error.message?.includes('Unauthorized')) {
        router.push('/login')
        return
      }
      toast.error('通信エラーが発生しました')
      setLoading(false)
      router.push('/my-bookings')
      return
    }
    
    if (!isMounted.current) return
    
    if (!result) {
      console.error('[useUserQueueStatus] No result from getUserQueueStatus')
      // ログアウト時など、resultがundefinedの場合は静かに処理を終了
      return
    }
    
    if (result.error) {
      // Unauthorizedエラーの場合は、ログインページへリダイレクト
      if (result.error === 'Unauthorized') {
        router.push('/login')
      } else {
        toast.error(result.error)
        router.push('/my-bookings')
      }
      return
    }
    
    if (result.status) {
      setStatus(result.status)
    }
    
    setLoading(false)
  }, [planId, userId, router])

  const handleLeaveQueue = useCallback(async () => {
    if (leaving) return
    
    const confirmed = window.confirm('本当に待機室を退出しますか？')
    if (!confirmed) return
    
    setLeaving(true)
    
    try {
      const result = await leaveQueue(planId, userId)
      
      if (result.success) {
        toast.success('待機室を退出しました')
        router.push('/my-bookings')
      } else {
        toast.error(result.error || '退出に失敗しました')
        setLeaving(false)
      }
    } catch (error) {
      console.error('Error leaving queue:', error)
      toast.error('退出処理中にエラーが発生しました')
      setLeaving(false)
    }
  }, [planId, userId, router, leaving])

  // 状態変化を検出して副作用を実行
  useEffect(() => {
    const prev = previousStatusRef.current
    const current = status
    
    if (!prev || !current) {
      previousStatusRef.current = current
      return
    }
    
    // 自分の番になったら通知
    if (current.isMyTurn && !prev.isMyTurn) {
      toast.success('あなたの順番です！')
    }
    
    // 通話ルームが利用可能になったら通知
    if (current.callRoom && !prev.callRoom) {
      toast.success('通話ルームに入室します...')
    }
    
    previousStatusRef.current = current
  }, [status])
  
  // 通話ルームへの自動リダイレクト
  useEffect(() => {
    if (!status?.callRoom || !isMounted.current) return
    
    const { url, token } = status.callRoom
    const roomName = url.split('/').pop()
    
    if (!roomName || !token) {
      toast.error('通話ルームへの接続情報が不足しています')
      return
    }
    
    // 少し待ってからリダイレクト（トーストが見えるように）
    const timer = setTimeout(() => {
      if (!isMounted.current) return
      
      console.log('[useUserQueueStatus] Redirecting to call room:', {
        roomName,
        url,
        hasToken: !!token,
        planDuration: status.planDuration
      })
      
      const params = new URLSearchParams({
        url: url,
        t: token,
        duration: status.planDuration?.toString() || '30', // 実際の通話時間を使用
        queue: 'true',
        planId: planId,
        userType: 'user' // ユーザータイプを追加
      })
      
      // 通話の開始・終了時刻を追加
      if (status.callRoom?.startedAt) {
        params.set('startedAt', status.callRoom.startedAt)
      }
      if (status.callRoom?.endsAt) {
        params.set('endsAt', status.callRoom.endsAt)
      }
      
      router.push(`/call/${roomName}?${params.toString()}`)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [status?.callRoom, status?.planDuration, planId, router])

  // 初回データ取得と定期更新
  useEffect(() => {
    isMounted.current = true
    
    fetchStatus()

    // 5秒ごとに更新
    refreshInterval.current = setInterval(fetchStatus, 5000)

    return () => {
      isMounted.current = false
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current)
        refreshInterval.current = null
      }
    }
  }, [fetchStatus])

  return {
    status,
    loading,
    leaving,
    handleLeaveQueue
  }
}