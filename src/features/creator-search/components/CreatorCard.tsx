import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Twitter, Instagram, Youtube, Users, Calendar, Video } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Creator } from '../types'

interface CreatorCardProps {
  creator: Creator
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const getCategoryLabel = (category: string | null) => {
    const categoryLabels: Record<string, string> = {
      'gaming': 'ゲーミング',
      'education': '教育',
      'entertainment': 'エンターテイメント',
      'consulting': 'コンサルティング',
      'art': 'アート',
      'music': '音楽',
      'lifestyle': 'ライフスタイル',
      'tech': 'テック',
      'other': 'その他'
    }
    return category ? categoryLabels[category] || category : null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* アバター */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={creator.avatar_url || `https://picsum.photos/64/64?random=${creator.id}`}
            alt={creator.display_name}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        </div>

        {/* メイン情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {creator.display_name}
              </h3>
              {creator.category && (
                <Badge variant="outline" className="mt-1">
                  {getCategoryLabel(creator.category)}
                </Badge>
              )}
            </div>
          </div>

          {/* 自己紹介 */}
          {creator.bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {creator.bio}
            </p>
          )}

          {/* ソーシャルリンク */}
          <div className="flex items-center gap-2 mb-4">
            {creator.social_twitter && (
              <a
                href={`https://twitter.com/${creator.social_twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {creator.social_instagram && (
              <a
                href={`https://instagram.com/${creator.social_instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {creator.social_youtube && (
              <a
                href={`https://youtube.com/@${creator.social_youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {creator.portfolio_url && (
              <a
                href={creator.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* 統計情報 */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{creator.follower_count.toLocaleString()}人</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>登録: {formatDistanceToNow(new Date(creator.created_at), { addSuffix: true, locale: ja })}</span>
            </div>
          </div>

          {/* 最新通話情報 */}
          {creator.last_call_created_at && (
            <div className="flex items-center gap-1 mb-3 text-sm text-blue-600 dark:text-blue-400">
              <Video className="w-4 h-4" />
              <span>最新通話: {formatDistanceToNow(new Date(creator.last_call_created_at), { addSuffix: true, locale: ja })}</span>
            </div>
          )}

          {/* 料金情報 */}
          {creator.pricing_plan && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              料金: {creator.pricing_plan}
            </p>
          )}

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href={`/creator/${creator.id}`}>
                プロフィールを見る
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              通話を予約
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}