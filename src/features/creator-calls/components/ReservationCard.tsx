import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Video, 
  Clock, 
  DollarSign, 
  Calendar,
  ExternalLink,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone
} from 'lucide-react'
import { updateReservationStatus, startCall, rejoinCall } from '../actions'
import { toast } from 'sonner'
import type { CallReservation } from '../types'

interface ReservationCardProps {
  reservation: CallReservation
  onStatusUpdate?: () => void
}

const statusConfig = {
  pending: { 
    label: '決済待ち', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: AlertCircle
  },
  confirmed: { 
    label: '確定済み', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: CheckCircle
  },
  in_progress: { 
    label: '進行中', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: Video
  },
  completed: { 
    label: '完了', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'キャンセル', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle
  }
}

export function ReservationCard({ reservation, onStatusUpdate }: ReservationCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const currentStatus = reservation.status?.status || 'pending'
  const status = statusConfig[currentStatus as keyof typeof statusConfig]
  const StatusIcon = status.icon

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'M月d日(E) HH:mm', { locale: ja })
  }

  const isUpcoming = () => {
    if (!reservation.scheduled_start) return false
    const now = new Date()
    const start = new Date(reservation.scheduled_start)
    const timeDiff = start.getTime() - now.getTime()
    return timeDiff > 0 && timeDiff <= 15 * 60 * 1000 // Within 15 minutes
  }

  const canStartCall = () => {
    return reservation.status?.status === 'confirmed' && 
           reservation.scheduled_start && 
           new Date(reservation.scheduled_start) <= new Date()
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const result = await updateReservationStatus(reservation.id, newStatus)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('ステータスを更新しました')
        onStatusUpdate?.()
      }
    } catch {
      toast.error('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleStartCall = async () => {
    setLoading(true)
    try {
      const result = await startCall(reservation.id)
      if (result.error) {
        toast.error(result.error)
      } else if (result.embedUrl) {
        toast.success('通話室を作成しました')
        router.push(result.embedUrl)
        onStatusUpdate?.()
      }
    } catch {
      toast.error('通話開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`${isUpcoming() ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={reservation.user?.avatar_url || ''} />
              <AvatarFallback>
                {reservation.user?.display_name?.charAt(0) || 
                 reservation.user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {reservation.user?.display_name || reservation.user?.email || 'ユーザー名未設定'}
              </h3>
              <p className="text-sm text-muted-foreground">{reservation.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUpcoming() && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                まもなく開始
              </Badge>
            )}
            <Badge className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <h4 className="font-medium mb-2">{reservation.product?.title}</h4>
          {reservation.product?.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {reservation.product.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {reservation.product?.duration}分
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              ¥{reservation.product?.price?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>開始予定: {reservation.scheduled_start ? formatDateTime(reservation.scheduled_start) : '未定'}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {reservation.status?.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleStatusChange('confirmed')}
                disabled={loading}
              >
                確定する
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange('cancelled')}
                disabled={loading}
              >
                キャンセル
              </Button>
            </>
          )}
          
          {canStartCall() && (
            <Button 
              size="sm"
              onClick={handleStartCall}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              通話開始
            </Button>
          )}
          
          {reservation.status?.status === 'in_progress' && (
            <Button 
              size="sm"
              onClick={async () => {
                setLoading(true)
                try {
                  const result = await rejoinCall(reservation.id)
                  if (result.error) {
                    toast.error(result.error)
                  } else if (result.embedUrl) {
                    toast.success('通話に接続しています...')
                    router.push(result.embedUrl)
                  }
                } catch {
                  toast.error('通話への接続に失敗しました')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-4 w-4 mr-1" />
              通話に参加
            </Button>
          )}
          
          {reservation.status?.status === 'in_progress' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
            >
              通話終了
            </Button>
          )}
          
          {reservation.status?.status === 'completed' && reservation.call_room?.recording_url && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => reservation.call_room?.recording_url && window.open(reservation.call_room.recording_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              録画を見る
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}