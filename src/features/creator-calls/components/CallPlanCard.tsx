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
import { deleteCallProduct } from '../actions'
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

  const handleDelete = async () => {
    if (!confirm('このプランを削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteCallProduct(product.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('プランを削除しました')
        onUpdate()
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error('プランの削除に失敗しました')
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
        return '時間指定'
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
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
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
                -件
              </div>
              <div className="text-xs text-muted-foreground">予約数</div>
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