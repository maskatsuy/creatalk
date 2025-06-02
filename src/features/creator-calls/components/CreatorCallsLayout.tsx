'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { CallFilters } from './CallFilters'
import { ReservationCard } from './ReservationCard'
import { CreateCallPlanDialog } from './CreateCallPlanDialog'
import { CallPlanCard } from './CallPlanCard'
import { ActiveCallAlert } from './ActiveCallAlert'
import { 
  getCreatorReservations, 
  getCreatorCallProducts,
  getActiveCallBookings
} from '../actions'
import type { CallReservation, CallProduct, CallFilters as Filters } from '../types'

export function CreatorCallsLayout() {
  const [reservations, setReservations] = useState<CallReservation[]>([])
  const [products, setProducts] = useState<CallProduct[]>([])
  const [activeBookings, setActiveBookings] = useState<Array<{
    id: string
    status: 'confirmed' | 'in_progress'
    created_at: string
    call_products: {
      title: string
      type: string
      duration_minutes: number
    }
    room_url?: string
  }>>([])
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'plans' | 'reservations'>('plans')

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [reservationsResult, productsResult, activeBookingsResult] = await Promise.all([
        getCreatorReservations(filters),
        getCreatorCallProducts(),
        getActiveCallBookings()
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

      if (activeBookingsResult.error) {
        // Active bookings error is not critical, just log silently
        setActiveBookings([])
      } else {
        setActiveBookings(activeBookingsResult.bookings || [])
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
            作成したプランの管理、予約状況の確認ができます
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

      {/* Active Call Alert */}
      <ActiveCallAlert 
        bookings={activeBookings}
        onUpdate={handleRefresh}
      />

      {/* Filters - only show for reservations tab */}
      {activeTab === 'reservations' && (
        <CallFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          products={products}
        />
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 border rounded-lg mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'plans'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            作成したプラン ({products.length}件)
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'reservations'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            受けた予約 ({reservations.length}件)
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'plans' ? (
          // Plans List
          <div>
            {products.length === 0 ? (
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  プランがありません
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  右上の「プラン作成」ボタンから新しいプランを作成してください
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <CallPlanCard
                    key={product.id}
                    product={product}
                    onUpdate={handleRefresh}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Reservations List
          <div>
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
                  まだ誰もあなたのプランに申し込んでいません
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
        )}
      </div>
    </div>
  )
}