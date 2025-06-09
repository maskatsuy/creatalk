'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import type { CallStats, CallFilters } from '../types'

export async function getCreatorCallStats(): Promise<{ stats?: CallStats, error?: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get all bookings for the creator
    const { data: bookings, error: bookingsError } = await supabase
      .from('call_bookings')
      .select('status, price, created_at')
      .eq('creator_id', user.id)

    if (bookingsError) {
      console.error('[getCreatorCallStats] Bookings error:', bookingsError)
      return { error: 'Failed to fetch booking stats' }
    }

    // Calculate statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const todayBookings = bookings?.filter(b => new Date(b.created_at) >= today) || []
    const weekBookings = bookings?.filter(b => new Date(b.created_at) >= weekAgo) || []
    const monthBookings = bookings?.filter(b => new Date(b.created_at) >= monthAgo) || []

    const stats: CallStats = {
      todayCount: todayBookings.length,
      weekCount: weekBookings.length,
      monthCount: monthBookings.length,
      totalRevenue: bookings?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0) || 0,
      averageRating: 0, // TODO: Implement ratings
      pendingCount: bookings?.filter(b => b.status === 'pending').length || 0,
      upcomingCount: bookings?.filter(b => b.status === 'confirmed').length || 0,
      inProgressCount: bookings?.filter(b => b.status === 'in_progress').length || 0
    }

    // Active products count is not part of CallStats type anymore

    return { stats }
  } catch (error) {
    console.error('[getCreatorCallStats] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function getCreatorReservations(filters: CallFilters = {}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Build query
    let query = supabase
      .from('call_bookings')
      .select(`
        *,
        call_products!inner(
          id,
          title,
          type,
          duration_minutes,
          price
        )
      `)
      .eq('creator_id', user.id)

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    if (filters.searchTerm) {
      query = query.or(`
        call_products.title.ilike.%${filters.searchTerm}%
      `)
    }

    // Sort by created_at descending
    query = query.order('created_at', { ascending: false })

    const { data: reservations, error } = await query

    if (error) {
      console.error('[getCreatorReservations] Error:', error)
      return { error: 'Failed to fetch reservations' }
    }

    // Get user profiles for all reservations
    if (reservations && reservations.length > 0) {
      const userIds = [...new Set(reservations.map(r => r.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds)

      // Map profiles to reservations
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      const reservationsWithProfiles = reservations.map(r => ({
        ...r,
        profiles: profileMap.get(r.user_id) || null
      }))

      return { reservations: reservationsWithProfiles }
    }

    return { reservations: reservations || [] }
  } catch (error) {
    console.error('[getCreatorReservations] Error:', error)
    return { error: 'Internal server error' }
  }
}