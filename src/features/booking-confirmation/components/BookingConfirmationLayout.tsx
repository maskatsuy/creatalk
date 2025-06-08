'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Calendar, Video, User as UserIcon, CreditCard, AlertCircle } from 'lucide-react'
import { useStripeCheckout } from '../hooks/useStripeCheckout'
import type { User } from '@supabase/supabase-js'
import type { CallProduct } from '../types'

interface BookingConfirmationLayoutProps {
  product: CallProduct
  user: User
}

export function BookingConfirmationLayout({ product, user }: BookingConfirmationLayoutProps) {
  const router = useRouter()
  const { handleCheckout, loading } = useStripeCheckout()

  const formatDateTime = (dateStr: string, timeStr: string) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`)
      return format(date, 'M月d日(E) HH:mm', { locale: ja })
    } catch {
      return `${dateStr} ${timeStr}`
    }
  }

  const onCheckout = () => {
    handleCheckout({
      productId: product.id,
      userId: user.id,
      successUrl: `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: window.location.href
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">予約内容の確認</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 左側: 予約詳細 */}
          <div className="space-y-6">
            {/* クリエイター情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  クリエイター
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {product.creator_profile?.profile_image_url && (
                    <Image
                      src={product.creator_profile.profile_image_url}
                      alt={product.creator_profile.display_name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-lg">
                      {product.creator_profile?.display_name || 'クリエイター'}
                    </p>
                    {product.creator_profile?.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.creator_profile.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 通話プラン詳細 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  通話プラン
                </CardTitle>
                <CardDescription>{product.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.description && (
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>通話時間</span>
                    </div>
                    <span className="font-medium">{product.duration_minutes}分</span>
                  </div>

                  {product.type === 'queue' && product.slot_date && product.start_time && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>開催日時</span>
                      </div>
                      <span className="font-medium text-sm">
                        {formatDateTime(product.slot_date, product.start_time)}
                      </span>
                    </div>
                  )}

                  {product.type === 'queue' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">参加形式</span>
                      <Badge>先着順</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右側: 支払い情報 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  お支払い内容
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">通話料金</span>
                    <span className="font-medium">¥{product.price.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">合計金額</span>
                    <span className="text-xl font-bold">¥{product.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium mb-1">テスト決済について</p>
                      <p>現在テストモードで動作しています。</p>
                      <p>カード番号: 4242 4242 4242 4242</p>
                      <p>有効期限: 任意の将来の日付</p>
                      <p>CVC: 任意の3桁</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={onCheckout}
                  disabled={loading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? '処理中...' : '決済画面へ進む'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  決済はStripeを通じて安全に処理されます
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading}
              >
                キャンセルして戻る
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}