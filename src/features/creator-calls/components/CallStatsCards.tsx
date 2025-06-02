import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock, DollarSign, Star, Video, AlertCircle } from 'lucide-react'
import type { CallStats } from '../types'

interface CallStatsCardsProps {
  stats: CallStats
}

export function CallStatsCards({ stats }: CallStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Active Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">進行中の通話</CardTitle>
          <Video className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.inProgressCount}</div>
          <p className="text-xs text-muted-foreground">
            現在通話中
          </p>
        </CardContent>
      </Card>

      {/* Pending Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">予約待ち</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
          <p className="text-xs text-muted-foreground">
            決済待ち
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今後の通話</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.upcomingCount}</div>
          <p className="text-xs text-muted-foreground">
            確定済み予約
          </p>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今月の収益</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">¥{stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.monthCount}件の通話完了
          </p>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今日の通話</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayCount}</div>
          <p className="text-xs text-muted-foreground">
            今週: {stats.weekCount}件
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">平均評価</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1">
            {stats.averageRating}
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            全通話の平均
          </p>
        </CardContent>
      </Card>
    </div>
  )
}