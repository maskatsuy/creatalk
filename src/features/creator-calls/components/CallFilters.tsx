import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, X } from 'lucide-react'
import type { CallFilters, CallProduct } from '../types'

interface CallFiltersProps {
  filters: CallFilters
  onFiltersChange: (filters: CallFilters) => void
  products: CallProduct[]
}

const statusOptions = [
  { value: '', label: 'すべて' },
  { value: 'pending', label: '決済待ち' },
  { value: 'confirmed', label: '確定済み' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'cancelled', label: 'キャンセル' }
]

export function CallFilters({ filters, onFiltersChange, products }: CallFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof CallFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '')

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">フィルター</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {Object.values(filters).filter(v => v && v !== '').length}件適用中
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              クリア
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '折りたたむ' : '展開'}
          </Button>
        </div>
      </div>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusOptions.map((status) => (
          <Badge
            key={status.value}
            variant={filters.status === status.value ? "default" : "outline"}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleFilterChange('status', status.value)}
          >
            {status.label}
          </Badge>
        ))}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          {/* Product Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">通話プラン</label>
            <Select 
              value={filters.productId || ''} 
              onValueChange={(value) => handleFilterChange('productId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべてのプラン" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべてのプラン</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium mb-2">開始日</label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium mb-2">終了日</label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}