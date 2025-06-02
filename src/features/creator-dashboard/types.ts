export interface DashboardStats {
  todayCount: number
  weekCount: number
  monthCount: number
  totalRevenue: number
  averageRating: number
  pendingCount: number
  upcomingCount: number
  inProgressCount: number
}

export interface RecentActivity {
  id: string
  type: 'reservation' | 'completion' | 'cancellation'
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
}

export interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: string
  urgent?: boolean
}