'use client'

import { DevicePreview } from '@/features/device-preview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, LogOut, Hash, Video } from 'lucide-react'
import { useUserQueueStatus } from '../hooks/useUserQueueStatus'
import Link from 'next/link'

interface UserWaitingRoomLayoutProps {
  planId: string
  userId: string
}

export function UserWaitingRoomLayout({ planId, userId }: UserWaitingRoomLayoutProps) {
  const { status, loading, leaving, handleLeaveQueue } = useUserQueueStatus(planId, userId)

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">待機情報が見つかりませんでした</p>
            <Button asChild>
              <Link href="/my-bookings">予約一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">待機室</h1>
        <p className="text-muted-foreground">
          {status.planTitle} - {status.creatorName}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左側: 待機状況 */}
        <div className="space-y-6">
          {/* 順番カード */}
          <Card className={status.isMyTurn ? 'border-green-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  あなたの順番
                </span>
                {status.isMyTurn && (
                  <Badge className="bg-green-500">次の番です！</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl font-bold mb-2">
                  {status.myPosition}
                </div>
                <p className="text-muted-foreground">
                  {status.totalWaiting}人中 {status.myPosition}番目
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 待ち時間 */}
          {status.estimatedWaitTime && !status.isMyTurn && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  推定待ち時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-semibold">
                    約{status.estimatedWaitTime}分
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    ※実際の時間は前後する場合があります
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 現在の通話状況 */}
          {status.currentCall && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  現在の通話
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {status.currentCall.participantPosition}番の方が通話中
                </p>
              </CardContent>
            </Card>
          )}

          {/* 退出ボタン */}
          <Button
            variant="destructive"
            onClick={handleLeaveQueue}
            disabled={leaving}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {leaving ? '退出中...' : '待機室を退出'}
          </Button>
        </div>

        {/* 右側: デバイス設定 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>デバイス設定</CardTitle>
            </CardHeader>
            <CardContent>
              <DevicePreview />
              {status.isMyTurn && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    まもなくあなたの番です。カメラとマイクの準備をお願いします。
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    クリエイターが通話を開始すると、自動的に通話ルームに入室します。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}