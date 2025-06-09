export interface CallReservation {
  id: string
  user_id: string
  creator_id: string
  queue_setting_id: string | null
  fixed_slot_id: string | null
  start_time: string
  end_time: string
  scheduled_start?: string
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
  product?: {
    title: string
    type: string
    duration: number
    price: number
    description?: string | null
  }
  status?: {
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress'
    created_at: string
  }
  call_room?: {
    daily_room_url: string
    recording_url: string | null
  }
  room_url?: string
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
  status: 'active' | 'inactive' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  // Schedule information
  slot_date?: string | null  // For queue type (legacy)
  start_time?: string | null  // Time format HH:mm (legacy)
  end_time?: string | null    // Time format HH:mm (legacy)
  start_at?: string | null    // For queue type - ISO datetime with timezone
  end_at?: string | null      // For queue type - ISO datetime with timezone
  available_from?: string | null  // For fixed type - ISO datetime
  available_until?: string | null  // For fixed type - ISO datetime
  max_participants?: number | null
  remaining_slots?: number | null
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
  searchTerm?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}