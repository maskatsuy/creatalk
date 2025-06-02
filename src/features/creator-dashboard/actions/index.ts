'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import type { DashboardStats, RecentActivity } from '../types'

export async function getDashboardStats(): Promise<{ stats?: DashboardStats, error?: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get call counts for different time periods
    const [todayResult, weekResult, monthResult, pendingResult, confirmedResult] = await Promise.all([
      // Today's completed calls
      supabase
        .from('call_bookings')
        .select('id')
        .eq('creator_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', today.toISOString()),
      
      // This week's completed calls
      supabase
        .from('call_bookings')
        .select('id')
        .eq('creator_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', weekStart.toISOString()),
      
      // This month's completed calls
      supabase
        .from('call_bookings')
        .select('id')
        .eq('creator_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString()),
      
      // Pending calls
      supabase
        .from('call_bookings')
        .select('id')
        .eq('creator_id', user.id)
        .eq('status', 'pending'),
      
      // Confirmed calls
      supabase
        .from('call_bookings')
        .select('id')
        .eq('creator_id', user.id)
        .eq('status', 'confirmed')
    ])

    // Calculate revenue
    const { data: revenueData } = await supabase
      .from('call_bookings')
      .select('amount')
      .eq('creator_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString())

    const totalRevenue = revenueData?.reduce((sum, booking) => {
      return sum + (booking.amount || 0)
    }, 0) || 0

    const stats: DashboardStats = {
      todayCount: todayResult.data?.length || 0,
      weekCount: weekResult.data?.length || 0,
      monthCount: monthResult.data?.length || 0,
      totalRevenue,
      averageRating: 4.5, // TODO: Implement actual rating calculation
      pendingCount: pendingResult.data?.length || 0,
      upcomingCount: confirmedResult.data?.length || 0,
      inProgressCount: 0 // No in_progress status in call_bookings
    }

    return { stats }
  } catch (error) {
    console.error('Error in getDashboardStats:', error)
    return { error: 'Internal server error' }
  }
}

export async function getRecentActivity(): Promise<{ activities?: RecentActivity[], error?: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Simple query without joins to avoid relation errors
    const { error } = await supabase
      .from('call_bookings')
      .select('*')
      .eq('creator_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching recent activity:', error)
      return { error: error.message }
    }

    // For now, return empty array to avoid UI errors
    // TODO: Properly implement with correct database structure
    const activities: RecentActivity[] = []

    return { activities }
  } catch (error) {
    console.error('Error in getRecentActivity:', error)
    return { error: 'Internal server error' }
  }
}