'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useMyBookings } from '../hooks/useMyBookings'
import { BookingCard } from './BookingCard'
import type { BookingFilter } from '../types'

interface MyBookingsLayoutProps {
  userId: string
}

export function MyBookingsLayout({ userId }: MyBookingsLayoutProps) {
  const { bookings, allBookings, loading, error, filter, setFilter } = useMyBookings(userId)

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats from all bookings (unfiltered)
  const calculateStats = () => {
    const now = new Date()
    let active = 0
    let completed = 0
    let cancelled = 0

    allBookings.forEach(booking => {
      // Check if booking is time-expired
      let isExpired = false
      
      if (booking.type === 'queue' && booking.product.slot_date && booking.product.start_time) {
        const endTime = new Date(`${booking.product.slot_date}T${booking.product.start_time}`)
        endTime.setMinutes(endTime.getMinutes() + booking.product.duration_minutes)
        isExpired = endTime < now
      } else if (booking.type === 'fixed' && booking.bookingDate && booking.startTime) {
        const endTime = new Date(`${booking.bookingDate}T${booking.startTime}`)
        endTime.setMinutes(endTime.getMinutes() + booking.product.duration_minutes)
        isExpired = endTime < now
      }

      if (booking.status === 'cancelled') {
        cancelled++
      } else if (booking.status === 'completed' || (isExpired && ['waiting', 'confirmed'].includes(booking.status))) {
        completed++
      } else if (['waiting', 'confirmed', 'in_progress', 'in_call'].includes(booking.status) && !isExpired) {
        active++
      }
    })

    return {
      total: allBookings.length,
      active,
      completed,
      cancelled
    }
  }

  const stats = calculateStats()

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">予約一覧</h1>
        <p className="text-muted-foreground">
          あなたが予約した通話の一覧です
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全ての予約</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中・予定</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了済み</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">キャンセル</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">重要なお知らせ</p>
              <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                <li>• 予約時間になってもご参加いただけない場合、自動的に「完了」となります</li>
                <li>• 不参加の場合でも返金はございませんので、お時間をお間違えのないようご注意ください</li>
                <li>• 先着制プランの場合、順番が来たら通知されますので、待機室でお待ちください</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as BookingFilter)}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="active">進行中・予定</TabsTrigger>
          <TabsTrigger value="completed">完了済み</TabsTrigger>
          <TabsTrigger value="cancelled">キャンセル</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {filter === 'all' && '予約がありません'}
                  {filter === 'active' && '進行中・予定の予約がありません'}
                  {filter === 'completed' && '完了済みの予約がありません'}
                  {filter === 'cancelled' && 'キャンセルされた予約がありません'}
                </p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}