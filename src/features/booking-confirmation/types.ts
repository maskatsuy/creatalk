export interface CallProduct {
  id: string
  title: string
  description: string | null
  price: number
  duration_minutes: number
  type: 'queue' | 'fixed'
  slot_date: string | null
  start_time: string | null
  end_time: string | null
  available_from: string | null
  available_until: string | null
  max_participants: number | null
  remaining_slots: number | null
  creator_profile: {
    display_name: string
    bio: string | null
    profile_image_url: string | null
  } | null
}

export interface BookingData {
  id: string
  type: 'queue' | 'fixed'
  product: {
    id: string
    title: string
    duration_minutes: number
    type: string
  }
  creator: {
    display_name: string
  }
  amount: number
  status: string
}

export interface CheckoutParams {
  productId: string
  userId: string
  successUrl: string
  cancelUrl: string
}