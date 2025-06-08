'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Users, Calendar, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import { unfollowCreator } from '../actions'
import type { FollowingCreator } from '../actions'

interface FollowingCreatorCardProps {
  creator: FollowingCreator
  onUnfollow: (creatorId: string) => void
}

export function FollowingCreatorCard({ creator, onUnfollow }: FollowingCreatorCardProps) {
  const [isUnfollowing, setIsUnfollowing] = useState(false)

  const handleUnfollow = async () => {
    setIsUnfollowing(true)
    try {
      const result = await unfollowCreator(creator.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success(`${creator.display_name}のフォローを解除しました`)
        onUnfollow(creator.id)
      }
    } catch (error) {
      console.error('Error unfollowing creator:', error)
      toast.error('フォロー解除に失敗しました')
    } finally {
      setIsUnfollowing(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={creator.avatar_url || undefined} alt={creator.display_name} />
            <AvatarFallback>
              {creator.display_name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link 
                  href={`/creator/${creator.id}`}
                  className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {creator.display_name}
                </Link>
                <Badge variant="secondary" className="mt-1">
                  {creator.category}
                </Badge>
              </div>
              
              <Button
                onClick={handleUnfollow}
                disabled={isUnfollowing}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 shrink-0"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500 mr-1" />
                {isUnfollowing ? '解除中...' : 'フォロー中'}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Bio */}
        {creator.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {creator.bio}
          </p>
        )}

        {/* Specialty */}
        {creator.specialty && (
          <p className="text-sm">
            <strong>専門分野:</strong> {creator.specialty}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{creator.follower_count_real.toLocaleString()}人</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>{creator.active_products_count}件の通話プラン</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(creator.followed_at), 'M月d日', { locale: ja })}からフォロー
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button asChild className="w-full">
            <Link href={`/creator/${creator.id}`}>
              プロフィールを見る
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}