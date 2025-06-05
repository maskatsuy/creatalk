'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Video, 
  Users, 
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { startCall, rejoinCall } from '../actions'

interface ActiveCallBooking {
  id: string
  status: 'confirmed' | 'in_progress'
  created_at: string
  scheduled_time?: string
  plan_id?: string
  is_active_plan?: boolean
  is_pre_start?: boolean
  minutes_until_start?: number
  remaining_slots?: number
  max_participants?: number
  call_products: {
    title: string
    type: string
    duration_minutes: number
  }
  call_rooms?: {
    id: string
    daily_room_url: string
  } | null
}

interface ActiveCallAlertProps {
  bookings: ActiveCallBooking[]
  onUpdate: () => void
}

export function ActiveCallAlert({ bookings, onUpdate }: ActiveCallAlertProps) {
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null)

  if (bookings.length === 0) {
    return null
  }

  const handleJoinCall = async (bookingId: string, booking: ActiveCallBooking) => {
    setLoadingRoomId(bookingId)
    
    try {
      // Check if this is an active plan (no actual booking yet)
      if (booking.is_active_plan) {
        // 先着制プランの場合は待機室に移動
        if (booking.call_products.type === 'queue') {
          const planId = booking.plan_id
          window.location.href = `/waiting-room/${planId}`
          return
        } else {
          toast.info('参加者がいません。予約を待機しています。')
          setLoadingRoomId(null)
          return
        }
      }

      let result

      // Check if this is a rejoin (in_progress) or new call (confirmed)
      if (booking.status === 'in_progress' && booking.call_rooms?.daily_room_url) {
        // 既存の通話に戻る
        result = await rejoinCall(bookingId)
      } else {
        // 新しい通話を開始
        result = await startCall(bookingId)
      }

      if (result.error) {
        toast.error(result.error)
      } else if (result.embedUrl) {
        // 埋め込みページへ遷移
        window.location.href = result.embedUrl
        toast.success(booking.status === 'in_progress' ? '通話に戻りました' : '通話を開始しました')
      } else if (result.roomUrl) {
        // フォールバック: 新規タブで開く
        window.open(result.roomUrl, '_blank')
        toast.success(booking.status === 'in_progress' ? '通話に戻りました' : '通話を開始しました')
        onUpdate()
      }
    } catch (error) {
      console.error('Error with call:', error)
      toast.error('通話の処理に失敗しました')
    } finally {
      setLoadingRoomId(null)
    }
  }

  const getStatusLabel = (booking: ActiveCallBooking) => {
    if (booking.is_active_plan) {
      if (booking.is_pre_start && booking.minutes_until_start !== undefined) {
        const minutes = booking.minutes_until_start
        if (minutes === 0) {
          return '開始直前'
        } else if (minutes === 1) {
          return '開始まで1分'
        } else {
          return `開始まで${minutes}分`
        }
      }
      return '開催中'
    }
    switch (booking.status) {
      case 'confirmed':
        return '開始待ち'
      case 'in_progress':
        return '進行中'
      default:
        return booking.status
    }
  }

  const getStatusVariant = (booking: ActiveCallBooking) => {
    if (booking.is_active_plan) {
      return booking.is_pre_start ? 'outline' : 'secondary'
    }
    switch (booking.status) {
      case 'confirmed':
        return 'default'
      case 'in_progress':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getButtonText = (booking: ActiveCallBooking) => {
    if (booking.is_active_plan) {
      if (booking.call_products.type === 'queue') {
        if (booking.is_pre_start) {
          return booking.minutes_until_start === 0 ? '待機室へ' : '待機室で準備'
        }
        return '待機室へ'
      } else {
        return '待機中'
      }
    }
    return booking.status === 'in_progress' ? '通話に戻る' : '通話を開始'
  }

  const getButtonIcon = (booking: ActiveCallBooking) => {
    if (booking.is_active_plan) {
      return <Users className="h-4 w-4 mr-2" />
    }
    return booking.status === 'in_progress' 
      ? <ExternalLink className="h-4 w-4 mr-2" />
      : <Video className="h-4 w-4 mr-2" />
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          通話中・開始待ち・準備中の予約
        </h2>
        <Badge variant="destructive" className="animate-pulse">
          {bookings.length}件
        </Badge>
      </div>

      <div className="space-y-3">
        {bookings.map((booking) => (
          <Card key={booking.id} className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{booking.call_products.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.call_products.type === 'queue' ? '先着制' : '時間指定'} • 
                        {booking.call_products.duration_minutes}分
                        {booking.is_active_plan && booking.call_products.type === 'queue' && booking.remaining_slots !== undefined && (
                          <span className="ml-2">
                            残り{booking.remaining_slots}/{booking.max_participants}枠
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusVariant(booking)}>
                    {getStatusLabel(booking)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {booking.status === 'in_progress' && (
                    <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      通話中
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleJoinCall(booking.id, booking)}
                    disabled={loadingRoomId === booking.id || (booking.is_active_plan && booking.call_products.type !== 'queue')}
                    className={booking.is_active_plan && booking.call_products.type === 'queue'
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : booking.is_active_plan 
                      ? "bg-gray-500 hover:bg-gray-600 text-white" 
                      : "bg-red-600 hover:bg-red-700 text-white"
                    }
                  >
                    {loadingRoomId === booking.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        接続中...
                      </>
                    ) : (
                      <>
                        {getButtonIcon(booking)}
                        {getButtonText(booking)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}