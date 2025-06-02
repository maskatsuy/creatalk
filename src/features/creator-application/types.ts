export interface CreatorApplicationFormData {
  display_name: string
  bio: string
  category: string
  specialty: string
  experience: string
  portfolio_url: string
  social_twitter: string
  social_instagram: string
  social_youtube: string
  social_other: string
  content_plan: string
  availability: string
  pricing_plan: string
  message: string
  terms_agreed: boolean
  age_verified: boolean
}

export const categories = [
  { value: 'gaming', label: 'ゲーム' },
  { value: 'education', label: '教育・学習' },
  { value: 'entertainment', label: 'エンターテイメント' },
  { value: 'consulting', label: 'コンサルティング' },
  { value: 'art', label: 'アート・デザイン' },
  { value: 'music', label: '音楽' },
  { value: 'lifestyle', label: 'ライフスタイル' },
  { value: 'tech', label: 'テクノロジー' },
  { value: 'other', label: 'その他' }
] as const

export const initialFormData: CreatorApplicationFormData = {
  display_name: '',
  bio: '',
  category: '',
  specialty: '',
  experience: '',
  portfolio_url: '',
  social_twitter: '',
  social_instagram: '',
  social_youtube: '',
  social_other: '',
  content_plan: '',
  availability: '',
  pricing_plan: '',
  message: '',
  terms_agreed: false,
  age_verified: false
}