'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  ExternalLink,
  Twitter,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react'
import { FollowButton } from './FollowButton'
import { CreatorStats } from './CreatorStats'
import { ActiveCallPlans } from './ActiveCallPlans'
import type { CreatorProfileData } from '../types'

interface CreatorProfileLayoutProps {
  creator: CreatorProfileData
}

export function CreatorProfileLayout({ creator }: CreatorProfileLayoutProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return Twitter
      case 'instagram': return Instagram
      case 'youtube': return Youtube
      default: return Globe
    }
  }

  const getSocialUrl = (platform: string, username: string) => {
    switch (platform) {
      case 'twitter': return `https://twitter.com/${username}`
      case 'instagram': return `https://instagram.com/${username}`
      case 'youtube': return `https://youtube.com/@${username}`
      default: return username
    }
  }

  const formatSocialUsername = (username: string | null) => {
    if (!username) return null
    return username.startsWith('@') ? username.slice(1) : username
  }

  const socialLinks = [
    { platform: 'twitter', username: formatSocialUsername(creator.social_twitter) },
    { platform: 'instagram', username: formatSocialUsername(creator.social_instagram) },
    { platform: 'youtube', username: formatSocialUsername(creator.social_youtube) }
  ].filter(link => link.username)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={creator.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {creator.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <FollowButton creatorId={creator.id} />
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{creator.display_name}</h1>
                  <Badge variant="secondary" className="mb-2">
                    {creator.category}
                  </Badge>
                  {creator.specialty && (
                    <p className="text-muted-foreground mb-2">
                      専門分野: {creator.specialty}
                    </p>
                  )}
                  {creator.experience && (
                    <p className="text-muted-foreground mb-2">
                      経験: {creator.experience}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {creator.bio && (
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {creator.bio}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(socialLinks.length > 0 || creator.portfolio_url) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {socialLinks.map(({ platform, username }) => {
                    const Icon = getSocialIcon(platform)
                    return (
                      <Button
                        key={platform}
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a
                          href={getSocialUrl(platform, username!)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon className="h-4 w-4" />
                          @{username}
                        </a>
                      </Button>
                    )
                  })}
                  
                  {creator.portfolio_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a
                        href={creator.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        ポートフォリオ
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Stats */}
              <CreatorStats stats={creator.stats} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Call Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            予約可能な通話プラン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActiveCallPlans products={creator.active_products} />
        </CardContent>
      </Card>
    </div>
  )
}