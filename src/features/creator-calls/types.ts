export interface CallReservation {
  id: string
  user_id: string
  creator_id: string
  queue_setting_id: string | null
  fixed_slot_id: string | null
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    email: string
    display_name: string | null
    avatar_url: string | null
  }
  queue_setting?: {
    name: string
    description: string | null
    price: number
    duration: number
    is_recording_enabled: boolean
  }
  fixed_slot?: {
    name: string
    description: string | null
    price: number
    duration: number
    is_recording_enabled: boolean
  }
  status?: {
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    created_at: string
  }
  call_room?: {
    daily_room_url: string
    recording_url: string | null
  }
}

export interface CallProduct {
  id: string
  creator_id: string
  type: string
  title: string
  description: string | null
  price: number
  duration: number
  recording_enabled: boolean
  created_at: string
  updated_at: string
}

export interface CallStats {
  todayCount: number
  weekCount: number
  monthCount: number
  totalRevenue: number
  averageRating: number
  pendingCount: number
  upcomingCount: number
  inProgressCount: number
}

export interface CallFilters {
  status?: string
  dateFrom?: string
  dateTo?: string
  productId?: string
}