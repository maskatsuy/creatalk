'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Users,
  Calendar,
  Video
} from 'lucide-react'
import type { CallProduct } from '../types'
import { cancelCallProduct } from '../actions'
import { BookingDetailsDialog } from './BookingDetailsDialog'
import { toast } from 'sonner'

interface CallPlanCardProps {
  product: CallProduct
  onUpdate: () => void
}

export function CallPlanCard({ product, onUpdate }: CallPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    // TODO: プラン編集機能を実装
    toast.info('プラン編集機能は開発中です')
  }

  const handleCancel = async () => {
    const reason = prompt('キャンセル理由を入力してください（例：体調不良、緊急事態など）')
    if (!reason) {
      return
    }

    if (!confirm(`このプランをキャンセルしますか？\n\n理由: ${reason}\n\n予約済みのユーザーに通知が送られます。`)) {
      return
    }

    setIsLoading(true)
    try {
      const result = await cancelCallProduct(product.id, reason)
      if (result.error) {
        toast.error(result.error)
      } else {
        if (result.affectedBookings && result.affectedBookings > 0) {
          toast.success(`プランをキャンセルしました。${result.affectedBookings}件の予約に通知を送信しました。`)
        } else {
          toast.success('プランをキャンセルしました')
        }
        // Force immediate UI update
        onUpdate()
        // Additional delay to ensure state updates
        setTimeout(() => {
          onUpdate()
        }, 1000)
      }
    } catch (error) {
      console.error('Error cancelling product:', error)
      toast.error('キャンセルに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'queue':
        return '先着制'
      case 'fixed':
        return '時間指定 (開発中)'
      default:
        return type
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'queue':
        return 'default'
      case 'fixed':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatScheduleInfo = () => {
    if (product.type === 'queue') {
      // Use start_at and end_at timestamps if available (preferred)
      if (product.start_at && product.end_at) {
        const startDate = new Date(product.start_at)
        const endDate = new Date(product.end_at)
        
        const date = startDate.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        })
        const startTime = startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        const endTime = endDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        
        return `${date} ${startTime}〜${endTime}`
      }
      // Fallback to legacy fields
      else if (product.slot_date && product.start_time && product.end_time) {
        const date = new Date(product.slot_date).toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        })
        return `${date} ${product.start_time}〜${product.end_time}`
      }
    }
    
    if (product.type === 'fixed' && product.available_from && product.available_until) {
      const from = new Date(product.available_from)
      const until = new Date(product.available_until)
      
      // Same day
      if (from.toDateString() === until.toDateString()) {
        const date = from.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        })
        const timeFrom = from.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        const timeUntil = until.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        return `${date} ${timeFrom}〜${timeUntil}`
      } else {
        // Different days
        const dateFrom = from.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric'
        })
        const dateUntil = until.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric'
        })
        return `${dateFrom}〜${dateUntil}`
      }
    }
    
    return '日時未設定'
  }

  const getAvailabilityInfo = () => {
    if (product.type === 'queue' && product.remaining_slots !== undefined && product.max_participants !== undefined) {
      return `${product.remaining_slots}/${product.max_participants}枠`
    }
    return '-件'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{product.title}</CardTitle>
              <Badge variant={getTypeBadgeVariant(product.type)}>
                {getTypeLabel(product.type)}
              </Badge>
            </div>
            {product.description && (
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleCancel}
                className="text-destructive focus:text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                キャンセル
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Schedule Information */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {formatScheduleInfo()}
              </div>
              <div className="text-xs text-muted-foreground">
                {product.type === 'queue' ? '開催日時' : '利用可能時間'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 text-muted-foreground font-bold">¥</span>
            <div>
              <div className="text-sm font-medium">
                {formatPrice(product.price)}
              </div>
              <div className="text-xs text-muted-foreground">料金</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {product.duration}分
              </div>
              <div className="text-xs text-muted-foreground">通話時間</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {getAvailabilityInfo()}
              </div>
              <div className="text-xs text-muted-foreground">
                {product.type === 'queue' ? '空き枠' : '予約数'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {product.recording_enabled ? '有効' : '無効'}
              </div>
              <div className="text-xs text-muted-foreground">録画</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            作成日: {new Date(product.created_at).toLocaleDateString('ja-JP')}
          </div>
          <div className="flex gap-2">
            <BookingDetailsDialog
              productId={product.id}
              productTitle={product.title}
              productType={product.type as 'queue' | 'fixed'}
            >
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                予約状況
              </Button>
            </BookingDetailsDialog>
            <Button size="sm">
              詳細表示
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}