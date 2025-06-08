import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Video, Hash } from 'lucide-react'
import type { UserBooking } from '../types'

interface BookingCardProps {
  booking: UserBooking
}

export function BookingCard({ booking }: BookingCardProps) {
  const statusConfig = {
    waiting: { label: '待機中', variant: 'secondary' as const, pulse: false },
    confirmed: { label: '確定', variant: 'default' as const, pulse: false },
    in_progress: { label: '進行中', variant: 'default' as const, pulse: true },
    completed: { label: '完了', variant: 'secondary' as const, pulse: false },
    cancelled: { label: 'キャンセル', variant: 'destructive' as const, pulse: false }
  }

  const config = statusConfig[booking.status]

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return null
    try {
      const date = new Date(`${dateStr}T${timeStr}`)
      return format(date, 'M月d日(E) HH:mm', { locale: ja })
    } catch {
      return `${dateStr} ${timeStr}`
    }
  }

  const isUpcoming = ['waiting', 'confirmed'].includes(booking.status)
  const canJoin = booking.status === 'in_progress' || 
    (booking.status === 'confirmed' && booking.type === 'fixed')

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {booking.creator.profile_image_url ? (
              <Image
                src={booking.creator.profile_image_url}
                alt={booking.creator.display_name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{booking.product.title}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.creator.display_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config.pulse && (
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
            )}
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.product.duration_minutes}分</span>
          </div>

          {booking.type === 'queue' && booking.product.slot_date && booking.product.start_time && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(booking.product.slot_date, booking.product.start_time)}</span>
            </div>
          )}

          {booking.type === 'fixed' && booking.bookingDate && booking.startTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(booking.bookingDate, booking.startTime)}</span>
            </div>
          )}

          {booking.type === 'queue' && booking.queuePosition && booking.status === 'waiting' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="h-4 w-4" />
              <span>待機順位: {booking.queuePosition}番目</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">支払い金額: ¥{booking.amount.toLocaleString()}</span>
          </div>
        </div>

        {isUpcoming && (
          <div className="pt-2 space-y-2">
            {booking.type === 'queue' && booking.status === 'waiting' && (
              <Button asChild className="w-full">
                <Link href={`/user/waiting-room/${booking.planId}`}>
                  <Video className="h-4 w-4 mr-2" />
                  待機室に入る
                </Link>
              </Button>
            )}
            {/* デバッグ用 */}
            {booking.type === 'queue' && (
              <p className="text-xs text-muted-foreground">
                Plan ID: {booking.planId}
              </p>
            )}
            {canJoin && booking.type === 'fixed' && (
              <Button asChild className="w-full">
                <Link href={`/call/waiting-room?planId=${booking.product.id}`}>
                  <Video className="h-4 w-4 mr-2" />
                  通話に参加
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}