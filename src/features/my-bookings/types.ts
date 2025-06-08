// Supabase table types (until we have proper database types)
export interface QueueParticipant {
  id: string
  position: number
  status: string
  created_at: string
  plan_id: string
  user_id: string
}

export interface CallProduct {
  id: string
  title: string
  duration_minutes: number
  type: string
  slot_date: string | null
  start_time: string | null
  price: number
  creator_id: string
}

export interface CallBooking {
  id: string
  status: string
  created_at: string
  booking_date: string
  start_time: string
  end_time: string
  amount: number
  product_id: string
  creator_id: string
  user_id: string
}

// Application types
export interface UserBooking {
  id: string
  type: 'queue' | 'fixed'
  status: 'waiting' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  // Queue specific
  queuePosition?: number
  planId?: string
  // Fixed booking specific
  bookingDate?: string
  startTime?: string
  endTime?: string
  // Common
  product: {
    id: string
    title: string
    duration_minutes: number
    type: 'queue' | 'fixed'
    slot_date?: string | null
    start_time?: string | null
  }
  creator: {
    id: string
    display_name: string
    profile_image_url?: string | null
  }
  amount: number
}

export type BookingFilter = 'all' | 'upcoming' | 'completed'

