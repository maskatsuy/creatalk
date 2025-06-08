'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { FollowingCreatorCard } from './FollowingCreatorCard'
import { getFollowingCreators } from '../actions'
import type { FollowingCreator } from '../actions'

export function FollowingCreatorsLayout() {
  const [creators, setCreators] = useState<FollowingCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFollowingCreators = async () => {
      try {
        const result = await getFollowingCreators()
        
        if (result.error) {
          setError(result.error)
          return
        }

        setCreators(result.creators || [])
      } catch (error) {
        console.error('Error loading following creators:', error)
        setError('フォロー中のクリエイター取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadFollowingCreators()
  }, [])

  const handleUnfollow = (creatorId: string) => {
    setCreators(prev => prev.filter(creator => creator.id !== creatorId))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold">フォロー中のクリエイター</h1>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold">フォロー中のクリエイター</h1>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                再試行
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold">フォロー中のクリエイター</h1>
            <span className="text-sm text-muted-foreground">
              ({creators.length}人)
            </span>
          </div>
          
          <Button asChild variant="outline">
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              新しいクリエイターを探す
            </Link>
          </Button>
        </div>

        {/* Content */}
        {creators.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                まだクリエイターをフォローしていません
              </h3>
              <p className="text-muted-foreground mb-6">
                お気に入りのクリエイターをフォローして、新しい通話プランの通知を受け取りましょう
              </p>
              <Button asChild>
                <Link href="/search">
                  <Search className="h-4 w-4 mr-2" />
                  クリエイターを探す
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <FollowingCreatorCard
                key={creator.id}
                creator={creator}
                onUnfollow={handleUnfollow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}