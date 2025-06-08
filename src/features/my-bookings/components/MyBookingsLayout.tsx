'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { useMyBookings } from '../hooks/useMyBookings'
import { BookingCard } from './BookingCard'
import type { BookingFilter } from '../types'

interface MyBookingsLayoutProps {
  userId: string
}

export function MyBookingsLayout({ userId }: MyBookingsLayoutProps) {
  const { bookings, loading, error, filter, setFilter } = useMyBookings(userId)

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

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => ['waiting', 'confirmed'].includes(b.status)).length,
    completed: bookings.filter(b => ['completed', 'cancelled'].includes(b.status)).length
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">予約一覧</h1>
        <p className="text-muted-foreground">
          あなたが予約した通話の一覧です
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
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
            <div className="text-2xl font-bold">{stats.upcoming}</div>
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
      </div>

      {/* Booking Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as BookingFilter)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="upcoming">進行中・予定</TabsTrigger>
          <TabsTrigger value="completed">完了済み</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {filter === 'all' && '予約がありません'}
                  {filter === 'upcoming' && '進行中・予定の予約がありません'}
                  {filter === 'completed' && '完了済みの予約がありません'}
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