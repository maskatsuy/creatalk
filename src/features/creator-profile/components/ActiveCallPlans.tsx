import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { CallProduct } from '../types'

interface ActiveCallPlansProps {
  products: CallProduct[]
}

export function ActiveCallPlans({ products }: ActiveCallPlansProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          現在予約可能な通話プランはありません
        </p>
      </div>
    )
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`)
      return format(date, 'M月d日(E) HH:mm', { locale: ja })
    } catch {
      return `${dateStr} ${timeStr}`
    }
  }

  const isAvailable = (product: CallProduct) => {
    const now = new Date()
    
    if (product.type === 'queue') {
      // Check if slots are available
      if ((product.remaining_slots || 0) <= 0) {
        return false
      }
      
      // Check new timestamp field first
      if (product.end_at) {
        const endAt = new Date(product.end_at)
        return endAt > now
      }
      // Fallback to legacy fields
      else if (product.slot_date && product.end_time) {
        const today = now.toISOString().split('T')[0]
        const currentTime = now.toTimeString().substring(0, 8)
        
        if (product.slot_date > today) {
          return true // Future date
        } else if (product.slot_date === today) {
          return product.end_time > currentTime // Today but end time hasn't passed
        }
        return false // Past date
      }
      
      return true // Default if no date info
    } else if (product.type === 'fixed' && product.available_until) {
      return new Date(product.available_until) > now
    }
    
    return true
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg line-clamp-2">
                {product.title}
              </CardTitle>
              <Badge variant={product.type === 'queue' ? 'default' : 'secondary'}>
                {product.type === 'queue' ? '先着制' : '時間制'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Schedule Info */}
            <div className="space-y-2 text-sm">
              {product.type === 'queue' && product.slot_date && product.start_time && product.end_time && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDateTime(product.slot_date, product.start_time)} 〜 {product.end_time}</span>
                </div>
              )}
              
              {product.type === 'fixed' && product.available_from && product.available_until && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(product.available_from), 'M月d日 HH:mm', { locale: ja })} 〜 
                    {format(new Date(product.available_until), 'HH:mm', { locale: ja })}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{product.duration_minutes}分</span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">¥{product.price.toLocaleString()}</span>
              </div>

              {product.type === 'queue' && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    残り{product.remaining_slots || 0}枠 / {product.max_participants || 0}名
                  </span>
                </div>
              )}
            </div>

            {/* Availability Status */}
            {!isAvailable(product) && (
              <Badge variant="outline" className="text-orange-600">
                予約締切
              </Badge>
            )}

            {/* Action Button */}
            <Button 
              asChild 
              className="w-full"
              disabled={!isAvailable(product)}
            >
              <Link href={`/booking/${product.id}`}>
                {isAvailable(product) ? '予約する' : '予約終了'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}