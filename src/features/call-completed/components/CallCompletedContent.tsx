'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle2, 
  Heart, 
  Home,
  Twitter,
  Instagram,
  ExternalLink,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { toggleFollow } from '@/features/creator-profile/actions'
import Link from 'next/link'

interface Booking {
  call_products?: {
    title: string
    duration_minutes: number
  }
}

interface CallCompletedContentProps {
  booking?: Booking | null
  creator?: {
    user_id: string
    display_name: string
    bio: string | null
    social_twitter: string | null
    social_instagram: string | null
  } | null
  isFollowing: boolean
  duration?: number
}

export function CallCompletedContent({ 
  booking, 
  creator, 
  isFollowing: initialIsFollowing,
  duration 
}: CallCompletedContentProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const handleFollow = async () => {
    if (!creator) return

    setIsFollowLoading(true)
    try {
      const result = await toggleFollow(creator.user_id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsFollowing(result.is_following ?? !isFollowing)
        toast.success(result.is_following ? 'フォローしました' : 'フォローを解除しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsFollowLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? `${mins}分` : ''}`
    }
    return `${mins}分`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            通話が終了しました
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            ご利用いただきありがとうございました！
          </p>
        </div>

        {/* Call Summary */}
        {(booking || creator || duration) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>通話の概要</CardTitle>
              <CardDescription>今回の通話情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {creator && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">クリエイター</p>
                    <p className="font-medium">{creator.display_name}</p>
                  </div>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'フォロー中' : 'フォローする'}
                  </Button>
                </div>
              )}

              {booking?.call_products && (
                <div>
                  <p className="text-sm text-muted-foreground">プラン</p>
                  <p className="font-medium">{booking.call_products.title}</p>
                </div>
              )}

              {duration && (
                <div>
                  <p className="text-sm text-muted-foreground">通話時間</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{formatDuration(duration)}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">日時</p>
                <p className="font-medium">
                  {new Date().toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Creator Info */}
        {creator && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{creator.display_name}さんについて</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {creator.bio && (
                <p className="text-gray-600 dark:text-gray-400">{creator.bio}</p>
              )}
              
              <div className="flex gap-4">
                {creator.social_twitter && (
                  <Link
                    href={`https://twitter.com/${creator.social_twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Twitter className="h-4 w-4" />
                    @{creator.social_twitter}
                  </Link>
                )}
                {creator.social_instagram && (
                  <Link
                    href={`https://instagram.com/${creator.social_instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Instagram className="h-4 w-4" />
                    @{creator.social_instagram}
                  </Link>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => router.push(`/creator/${creator.user_id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  プロフィールを見る
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push('/')}
          >
            <Home className="h-5 w-5" />
            ホームに戻る
          </Button>
        </div>

        {/* Feedback Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            通話品質に関するご意見・ご要望がございましたら、
            <Link href="/support" className="text-primary hover:underline ml-1">
              サポートページ
            </Link>
            よりお聞かせください。
          </p>
        </div>
      </div>
    </div>
  )
}