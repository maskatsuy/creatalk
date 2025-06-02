import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, Star, Video, AlertCircle, ArrowRight, BarChart3 } from 'lucide-react'
import type { DashboardStats } from '../types'

interface DashboardStatsCardsProps {
  stats: DashboardStats
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Active & Urgent Calls */}
      <Card className={stats.inProgressCount > 0 ? 'ring-2 ring-green-500' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">進行中の通話</CardTitle>
          <Video className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.inProgressCount}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">現在通話中</p>
            {stats.inProgressCount > 0 && (
              <Link href="/creator/calls?status=in_progress">
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  参加 <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Calls */}
      <Card className={stats.pendingCount > 0 ? 'ring-2 ring-yellow-500' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">予約待ち</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">決済待ち</p>
            {stats.pendingCount > 0 && (
              <Link href="/creator/calls?status=pending">
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  確認 <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
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
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">確定済み予約</p>
            <Link href="/creator/calls?status=confirmed">
              <Button size="sm" variant="ghost" className="h-6 text-xs">
                詳細 <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
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
          <p className="text-xs text-muted-foreground mt-2">
            {stats.monthCount}件の通話完了
          </p>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">パフォーマンス</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold flex items-center gap-1">
                {stats.averageRating}
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground">平均評価</p>
            </div>
            <div>
              <div className="text-lg font-bold">{stats.weekCount}</div>
              <p className="text-xs text-muted-foreground">今週の通話数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">クイックアクション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/creator/calls">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                通話管理
              </Button>
            </Link>
            <Link href="/creator/analytics">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                分析
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}