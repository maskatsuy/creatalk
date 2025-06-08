'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Calendar, Video, Loader2 } from 'lucide-react'
import { useBookingVerification } from '@/features/booking-confirmation/hooks/useBookingVerification'

export function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { loading, error, bookingData } = useBookingVerification(sessionId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">予約を処理しています...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">エラーが発生しました</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">予約が完了しました！</h1>
          <p className="text-muted-foreground">
            決済が正常に処理され、通話の予約が確定しました
          </p>
        </div>

        {bookingData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                予約内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">予約番号</span>
                <span className="font-mono text-sm">{bookingData.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">通話プラン</span>
                <span className="font-medium">{bookingData.product.title}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">クリエイター</span>
                <span className="font-medium">{bookingData.creator.display_name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">通話時間</span>
                <span className="font-medium">{bookingData.product.duration_minutes}分</span>
              </div>

              {bookingData.product.type === 'queue' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">参加形式</span>
                  <Badge>先着順</Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">支払い金額</span>
                <span className="font-medium">¥{bookingData.amount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              予約確認メールをご登録のメールアドレスに送信しました。
            </p>
            <p className="text-blue-800 dark:text-blue-200 mt-2">
              通話開始時間になりましたら、メールまたはマイページからご参加ください。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/my-bookings">
                <Calendar className="h-4 w-4 mr-2" />
                予約一覧を見る
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                ホームに戻る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}