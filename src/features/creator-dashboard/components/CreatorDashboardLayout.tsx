'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus, Video, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { DashboardStatsCards } from './DashboardStatsCards'
import { RecentActivityFeed } from './RecentActivityFeed'
import { getDashboardStats, getRecentActivity } from '../actions'
import type { DashboardStats, RecentActivity } from '../types'

export function CreatorDashboardLayout() {
  const [stats, setStats] = useState<DashboardStats>({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingCount: 0,
    upcomingCount: 0,
    inProgressCount: 0
  })
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [statsResult, activitiesResult] = await Promise.all([
        getDashboardStats(),
        getRecentActivity()
      ])

      if (statsResult.error) {
        toast.error(statsResult.error)
      } else if (statsResult.stats) {
        setStats(statsResult.stats)
      }

      if (activitiesResult.error) {
        toast.error(activitiesResult.error)
      } else {
        setActivities(activitiesResult.activities || [])
      }
    } catch {
      toast.error('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    loadData(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            </div>
          </div>
          
          {/* Stats cards skeleton - 3x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border rounded-lg p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
          
          {/* Main content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent activity skeleton - 2 columns */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border rounded-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick actions skeleton - 1 column */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 border rounded-lg p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded w-28 mb-2"></div>
                <div className="h-16 bg-blue-200 dark:bg-blue-800 rounded"></div>
              </div>
            </div>
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
            ダッシュボード
          </h1>
          <p className="text-muted-foreground">
            あなたの通話活動とパフォーマンスの概要
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
          <Link href="/creator/calls">
            <Button>
              <Video className="h-4 w-4 mr-2" />
              通話管理
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivityFeed activities={activities} />
        </div>
        
        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
            <div className="space-y-3">
              <Link href="/creator/calls" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  通話管理
                </Button>
              </Link>
              <Link href="/creator/analytics" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  分析レポート
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                新しいプラン作成
              </Button>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 今日のヒント
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              定期的なフォローアップや感謝のメッセージで、ファンとの良好な関係を築きましょう。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}