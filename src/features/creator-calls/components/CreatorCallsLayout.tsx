'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { CallFilters } from './CallFilters'
import { ReservationCard } from './ReservationCard'
import { CreateCallPlanDialog } from './CreateCallPlanDialog'
import { 
  getCreatorReservations, 
  getCreatorCallProducts
} from '../actions'
import type { CallReservation, CallProduct, CallFilters as Filters } from '../types'

export function CreatorCallsLayout() {
  const [reservations, setReservations] = useState<CallReservation[]>([])
  const [products, setProducts] = useState<CallProduct[]>([])
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [reservationsResult, productsResult] = await Promise.all([
        getCreatorReservations(filters),
        getCreatorCallProducts()
      ])

      if (reservationsResult.error) {
        toast.error(reservationsResult.error)
      } else {
        setReservations(reservationsResult.reservations || [])
      }

      if (productsResult.error) {
        toast.error(productsResult.error)
      } else {
        setProducts(productsResult.products || [])
      }
    } catch {
      toast.error('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    loadData(true)
  }

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  const handleReservationUpdate = () => {
    loadData(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
            </div>
          </div>
          
          {/* Filters skeleton */}
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-4">
            <div className="flex flex-wrap gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          
          {/* Reservations list header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          </div>
          
          {/* Reservation cards skeleton */}
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            通話管理
          </h1>
          <p className="text-muted-foreground">
            予約の管理、通話の開始、履歴の確認ができます
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <CreateCallPlanDialog onPlanCreated={handleRefresh} />
        </div>
      </div>

      {/* Filters */}
      <CallFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        products={products}
      />

      {/* Reservations List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            予約一覧 ({reservations.length}件)
          </h2>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg 
                className="mx-auto h-12 w-12" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1l-1 5a2 2 0 01-2 2H6a2 2 0 01-2-2l-1-5V9a2 2 0 012-2h3z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              予約がありません
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              現在の条件では予約が見つかりませんでした
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onStatusUpdate={handleReservationUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}