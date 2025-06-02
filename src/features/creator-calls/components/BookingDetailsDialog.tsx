'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  Users, 
  RefreshCw
} from 'lucide-react'
import { getProductBookingDetails } from '../actions'
import { toast } from 'sonner'

interface BookingDetailsDialogProps {
  productId: string
  productTitle: string
  productType: 'queue' | 'fixed'
  children: React.ReactNode
}

interface BookingDetail {
  id: string
  status: string
  created_at: string
  scheduled_time?: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  }
}

interface ProductDetail {
  type: 'queue' | 'fixed'
  slot_date?: string
  start_time?: string
  end_time?: string
  duration_minutes: number
  max_participants?: number
  remaining_slots?: number
}

export function BookingDetailsDialog({ productId, productTitle, productType, children }: BookingDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<BookingDetail[]>([])
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    in_progress: 0,
  })

  const loadBookingDetails = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getProductBookingDetails(productId)
      if (result.error) {
        toast.error(result.error)
      } else {
        setBookings(result.bookings || [])
        setProduct(result.product)
        setStats(result.stats || {
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          in_progress: 0,
        })
      }
    } catch (error) {
      console.error('Error loading booking details:', error)
      toast.error('予約詳細の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (isOpen) {
      loadBookingDetails()
    }
  }, [isOpen, loadBookingDetails])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '決済待ち'
      case 'confirmed': return '確定済み'
      case 'in_progress': return '進行中'
      case 'completed': return '完了'
      case 'cancelled': return 'キャンセル'
      default: return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline'
      case 'confirmed': return 'default'
      case 'in_progress': return 'destructive'
      case 'completed': return 'secondary'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  const getUserInitials = (displayName: string | null) => {
    if (!displayName) return 'U'
    return displayName.slice(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderQueueBookings = () => {
    if (!product) return null

    const activeBookings = bookings.filter(b => 
      ['pending', 'confirmed', 'in_progress'].includes(b.status)
    )

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="font-medium">
              {product.slot_date && new Date(product.slot_date).toLocaleDateString('ja-JP')}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.start_time} - {product.end_time}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">{activeBookings.length}</span>
            <span className="text-muted-foreground">/{product.max_participants} 名</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            参加者一覧（先着順）
          </h4>
          
          {activeBookings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              まだ参加者がいません
            </div>
          ) : (
            <div className="space-y-2">
              {activeBookings.map((booking, index) => (
                <div key={booking.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={booking.profiles.avatar_url || undefined} />
                    <AvatarFallback>
                      {getUserInitials(booking.profiles.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {booking.profiles.display_name || 'ユーザー'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(booking.created_at)}
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFixedBookings = () => {
    if (!product) return null

    // 時間指定プランの利用可能時間枠を生成
    const generateTimeSlots = () => {
      if (!product.available_from || !product.available_until) return []
      
      const startTime = new Date(product.available_from)
      const endTime = new Date(product.available_until)
      const duration = product.duration_minutes
      const slots = []
      
      let currentTime = new Date(startTime)
      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000)
        if (slotEnd <= endTime) {
          slots.push({
            start: new Date(currentTime),
            end: slotEnd,
            id: currentTime.toISOString()
          })
        }
        currentTime = new Date(currentTime.getTime() + duration * 60000)
      }
      
      return slots
    }

    const timeSlots = generateTimeSlots()
    
    // 予約を時間枠にマッピング
    const groupedBookings = bookings.reduce((acc, booking) => {
      // 実際の scheduled_time がない場合は created_at で代用
      const bookingTime = booking.scheduled_time || booking.created_at
      const timeKey = new Date(bookingTime).toISOString()
      if (!acc[timeKey]) {
        acc[timeKey] = []
      }
      acc[timeKey].push(booking)
      return acc
    }, {} as Record<string, BookingDetail[]>)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <h4 className="font-medium">利用可能時間枠</h4>
          </div>
          <div className="text-sm text-muted-foreground">
            {product.duration_minutes}分枠
          </div>
        </div>

        {timeSlots.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            利用可能な時間枠が設定されていません
          </div>
        ) : (
          <div className="space-y-3">
            {timeSlots.map((slot) => {
              const slotBookings = groupedBookings[slot.id] || []
              const isAvailable = slotBookings.length === 0
              
              return (
                <div 
                  key={slot.id} 
                  className={`border rounded-lg p-3 ${
                    isAvailable 
                      ? 'border-gray-200 dark:border-gray-700' 
                      : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">
                      {slot.start.toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {slot.end.toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <Badge variant={isAvailable ? 'default' : 'secondary'} 
                           className={isAvailable ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : ''}>
                      {isAvailable ? '空き' : `${slotBookings.length}件の予約`}
                    </Badge>
                  </div>
                  
                  {slotBookings.length > 0 && (
                    <div className="space-y-2">
                      {slotBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={booking.profiles.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(booking.profiles.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-sm">
                            {booking.profiles.display_name || 'ユーザー'}
                          </div>
                          <Badge variant={getStatusVariant(booking.status)} className="text-xs">
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            予約詳細 - {productTitle}
            <Badge variant="outline">
              {productType === 'queue' ? '先着制' : '時間指定'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">読み込み中...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">総予約数</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.confirmed + stats.in_progress}
                </div>
                <div className="text-sm text-muted-foreground">アクティブ</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.completed}
                </div>
                <div className="text-sm text-muted-foreground">完了済み</div>
              </div>
            </div>

            {/* Detailed Bookings */}
            {productType === 'queue' ? renderQueueBookings() : renderFixedBookings()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}