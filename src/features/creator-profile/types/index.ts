export interface CreatorProfileData {
  id: string
  display_name: string
  bio: string | null
  category: string
  specialty: string | null
  experience: string | null
  portfolio_url: string | null
  social_twitter: string | null
  social_instagram: string | null
  social_youtube: string | null
  pricing_plan: string | null
  follower_count_real: number
  created_at: string
  profiles: {
    id: string
    email: string
    avatar_url: string | null
  } | null
  active_products: CallProduct[]
  stats: CreatorStats
}

export interface CallProduct {
  id: string
  type: 'queue' | 'fixed'
  title: string
  description: string | null
  price: number
  duration_minutes: number
  status: string
  created_at: string
  // Queue type fields
  slot_date?: string | null
  start_time?: string | null
  end_time?: string | null
  start_at?: string | null    // New timestamp field
  end_at?: string | null      // New timestamp field
  max_participants?: number | null
  remaining_slots?: number | null
  // Fixed type fields
  available_from?: string | null
  available_until?: string | null
}

export interface CreatorStats {
  total_calls: number
  average_rating: number
  response_rate: number
  follower_count: number
  following_count: number
}

export interface FollowStatus {
  is_following: boolean
  follower_count: number
}

export interface SocialLinks {
  twitter?: string | null
  instagram?: string | null
  youtube?: string | null
  portfolio?: string | null
}