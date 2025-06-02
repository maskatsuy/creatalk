export interface Creator {
  id: string
  display_name: string
  bio: string | null
  category: string | null
  portfolio_url: string | null
  social_twitter: string | null
  social_instagram: string | null
  social_youtube: string | null
  pricing_plan: string | null
  avatar_url?: string | null
  follower_count: number
  created_at: string
  last_call_created_at: string | null
  profiles: {
    email: string
  } | null
}

export interface CreatorSearchParams {
  query?: string
  category?: string
  sortBy?: 'followers' | 'created_at' | 'last_call'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreatorSearchResult {
  creators: Creator[]
  total: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  error?: string
}