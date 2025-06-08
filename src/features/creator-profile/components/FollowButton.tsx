'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { getFollowStatus, toggleFollow } from '../actions'
import type { FollowStatus } from '../types'

interface FollowButtonProps {
  creatorId: string
}

export function FollowButton({ creatorId }: FollowButtonProps) {
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Load follow status on mount
  useEffect(() => {
    const loadFollowStatus = async () => {
      try {
        const result = await getFollowStatus(creatorId)
        if (result.status) {
          setFollowStatus(result.status)
        }
      } catch (error) {
        console.error('Error loading follow status:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadFollowStatus()
  }, [creatorId])

  const handleToggleFollow = async () => {
    if (!followStatus) return

    setLoading(true)
    try {
      const result = await toggleFollow(creatorId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success && typeof result.is_following === 'boolean') {
        // Update local state
        setFollowStatus(prev => prev ? {
          ...prev,
          is_following: result.is_following!,
          follower_count: result.is_following! 
            ? prev.follower_count + 1 
            : prev.follower_count - 1
        } : null)

        // Show success message
        toast.success(
          result.is_following 
            ? 'フォローしました' 
            : 'フォローを解除しました'
        )
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button disabled size="lg" className="w-32">
          読み込み中...
        </Button>
        <p className="text-sm text-muted-foreground">
          フォロワー: --人
        </p>
      </div>
    )
  }

  if (!followStatus) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleToggleFollow}
        disabled={loading}
        size="lg"
        variant={followStatus.is_following ? "outline" : "default"}
        className={`w-32 gap-2 ${
          followStatus.is_following 
            ? 'text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400' 
            : ''
        }`}
      >
        {followStatus.is_following ? (
          <>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            {loading ? '処理中...' : 'フォロー中'}
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            {loading ? '処理中...' : 'フォロー'}
          </>
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground">
        フォロワー: {followStatus.follower_count.toLocaleString()}人
      </p>
    </div>
  )
}