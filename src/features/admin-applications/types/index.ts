export type Application = {
  id: string
  user_id: string
  display_name: string
  bio: string | null
  category: string
  specialty: string | null
  experience: string | null
  portfolio_url: string | null
  social_twitter: string | null
  social_instagram: string | null
  social_youtube: string | null
  social_other: string | null
  content_plan: string | null
  availability: string | null
  pricing_plan: string | null
  status: string
  created_at: string
  updated_at: string
  reviewed_by: string | null
  admin_feedback: string | null
  message: string | null
  terms_agreed: boolean
  age_verified: boolean
  rejection_reason?: string | null
  x_username?: string | null
  instagram_username?: string | null
  tiktok_username?: string | null
  price_per_session?: number | null
  content_description?: string | null
  profiles: {
    email: string
  } | null
}

export interface ApplicationsListProps {
  applications: Application[]
}