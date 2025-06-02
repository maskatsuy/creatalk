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
import { startCall } from '../actions'

interface ActiveCallBooking {
  id: string
  status: 'confirmed' | 'in_progress'
  created_at: string
  scheduled_time?: string
  call_products: {
    title: string
    type: string
    duration_minutes: number
  }
  room_url?: string
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

  const handleJoinCall = async (bookingId: string, roomUrl?: string) => {
    if (roomUrl) {
      // 既存の部屋URLがある場合
      window.open(roomUrl, '_blank')
      return
    }

    // 新しい部屋を作成してステータス更新
    setLoadingRoomId(bookingId)
    try {
      const result = await startCall(bookingId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.roomUrl) {
        window.open(result.roomUrl, '_blank')
        toast.success('通話を開始しました')
        onUpdate()
      }
    } catch (error) {
      console.error('Error starting call:', error)
      toast.error('通話の開始に失敗しました')
    } finally {
      setLoadingRoomId(null)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '開始待ち'
      case 'in_progress':
        return '進行中'
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'in_progress':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          通話中・開始待ちの予約
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
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
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
                    onClick={() => handleJoinCall(booking.id, booking.room_url)}
                    disabled={loadingRoomId === booking.id}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loadingRoomId === booking.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        接続中...
                      </>
                    ) : booking.status === 'in_progress' ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        通話に戻る
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        通話を開始
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