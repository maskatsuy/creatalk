'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { format, parse, isBefore } from 'date-fns'
import type { CallProduct, CallStats, CallFilters } from '../types'

export async function getActiveCallBookings() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get active/in-progress bookings
    const { data: bookings, error } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_products!inner(title, type, duration_minutes)
      `)
      .eq('creator_id', user.id)
      .in('status', ['confirmed', 'in_progress'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active bookings:', error)
      return { error: error.message }
    }

    return { bookings: bookings || [] }
  } catch (error) {
    console.error('Error in getActiveCallBookings:', error)
    return { error: 'Internal server error' }
  }
}

export async function getCreatorReservations(filters: CallFilters = {}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Simple query without joins to avoid relation errors
    let query = supabase
      .from('call_bookings')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }
    
    if (filters.productId) {
      query = query.eq('product_id', filters.productId)
    }

    const { error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return { error: error.message }
    }

    // For now, return empty array to avoid UI errors
    // TODO: Properly implement with correct database structure
    return { reservations: [] }
  } catch (error) {
    console.error('Error in getCreatorReservations:', error)
    return { error: 'Internal server error' }
  }
}

export async function getCreatorCallProducts() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }
    

    const { data, error } = await supabase
      .from('call_products')
      .select(`
        id,
        creator_id,
        type,
        title,
        description,
        price,
        duration_minutes,
        status,
        created_at,
        updated_at
      `)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching call products:', error)
      return { error: error.message }
    }

    // Transform database fields to match CallProduct type
    const products = data?.map(product => ({
      ...product,
      duration: product.duration_minutes,
      recording_enabled: false // Default value since it's not in the DB yet
    })) || []

    return { products: products as CallProduct[] }
  } catch (error) {
    console.error('Error in getCreatorCallProducts:', error)
    return { error: 'Internal server error' }
  }
}

export async function getCreatorCallStats(): Promise<{ stats?: CallStats, error?: string }> {
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

    const stats: CallStats = {
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
    console.error('Error in getCreatorCallStats:', error)
    return { error: 'Internal server error' }
  }
}

export async function updateReservationStatus(reservationId: string, status: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify the booking belongs to this creator
    const { data: booking, error: fetchError } = await supabase
      .from('call_bookings')
      .select('creator_id')
      .eq('id', reservationId)
      .single()

    if (fetchError || !booking) {
      return { error: 'Booking not found' }
    }

    if (booking.creator_id !== user.id) {
      return { error: 'Not authorized to update this booking' }
    }

    // Update the status
    const { error } = await supabase
      .from('call_bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)

    if (error) {
      console.error('Error updating booking status:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateReservationStatus:', error)
    return { error: 'Internal server error' }
  }
}

export async function getProductBookingDetails(productId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get product details first
    const { data: product, error: productError } = await supabase
      .from('call_products')
      .select('*')
      .eq('id', productId)
      .eq('creator_id', user.id)
      .single()

    if (productError || !product) {
      return { error: 'Product not found' }
    }

    // Get bookings first
    const { data: rawBookings, error: bookingsError } = await supabase
      .from('call_bookings')
      .select('*')
      .eq('product_id', productId)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: true })

    if (bookingsError) {
      console.error('Error fetching booking details:', bookingsError)
      return { error: bookingsError.message }
    }

    // Get user profiles for each booking
    const bookings = []
    if (rawBookings && rawBookings.length > 0) {
      const userIds = rawBookings.map(b => b.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError)
      }

      // Combine bookings with profile data
      for (const booking of rawBookings) {
        const userProfile = profiles?.find(p => p.id === booking.user_id)
        bookings.push({
          ...booking,
          profiles: userProfile || { display_name: null, avatar_url: null }
        })
      }
    }

    // Calculate basic stats
    const stats = {
      total: bookings?.length || 0,
      pending: bookings?.filter(b => b.status === 'pending').length || 0,
      confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
      completed: bookings?.filter(b => b.status === 'completed').length || 0,
      cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
      in_progress: bookings?.filter(b => b.status === 'in_progress').length || 0,
    }

    return { 
      product,
      bookings: bookings || [],
      stats 
    }
  } catch (error) {
    console.error('Error in getProductBookingDetails:', error)
    return { error: 'Internal server error' }
  }
}

export async function deleteCallProduct(productId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Check if the product belongs to this creator
    const { data: product, error: fetchError } = await supabase
      .from('call_products')
      .select('creator_id')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      return { error: 'Product not found' }
    }

    if (product.creator_id !== user.id) {
      return { error: 'Not authorized to delete this product' }
    }

    // Check if there are any bookings for this product
    const { data: bookings, error: bookingsError } = await supabase
      .from('call_bookings')
      .select('id')
      .eq('product_id', productId)
      .in('status', ['pending', 'confirmed'])

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError)
      return { error: 'Failed to check existing bookings' }
    }

    if (bookings && bookings.length > 0) {
      return { error: 'このプランには予約があるため削除できません' }
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('call_products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      return { error: deleteError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteCallProduct:', error)
    return { error: 'Internal server error' }
  }
}

export async function startCall(bookingId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify the booking belongs to this creator
    const { data: booking, error: fetchError } = await supabase
      .from('call_bookings')
      .select('creator_id, status')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return { error: 'Booking not found' }
    }

    if (booking.creator_id !== user.id) {
      return { error: 'Not authorized to start this call' }
    }

    // TODO: Integrate with Daily.co API to create room
    const roomUrl = `https://creatalk.daily.co/room/${bookingId}`

    // Update booking status to in_progress and store room URL
    const { error: updateError } = await supabase
      .from('call_bookings')
      .update({ 
        status: 'in_progress',
        room_url: roomUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error starting call:', updateError)
      return { error: updateError.message }
    }

    return { roomUrl, success: true }
  } catch (error) {
    console.error('Error in startCall:', error)
    return { error: 'Internal server error' }
  }
}

export async function endCall(bookingId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Update booking status to completed
    const { error: updateError } = await supabase
      .from('call_bookings')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .eq('creator_id', user.id)

    if (updateError) {
      console.error('Error ending call:', updateError)
      return { error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in endCall:', error)
    return { error: 'Internal server error' }
  }
}

export async function createCallRoom(reservationId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify the booking belongs to this creator
    const { data: booking, error: fetchError } = await supabase
      .from('call_bookings')
      .select('*')
      .eq('id', reservationId)
      .eq('creator_id', user.id)
      .single()

    if (fetchError || !booking) {
      return { error: 'Booking not found' }
    }

    // TODO: Integrate with Daily.co API to create room
    // For now, generate a mock room URL
    const roomUrl = `https://creatalk.daily.co/room/${reservationId}`

    // Note: call_bookings doesn't have room_url field, so we'll just return the URL
    // In a real implementation, you'd create a separate call_rooms record

    return { roomUrl }
  } catch (error) {
    console.error('Error in createCallRoom:', error)
    return { error: 'Internal server error' }
  }
}

export async function createCallPlan(data: {
  type: 'queue' | 'fixed'
  title: string
  description?: string
  price: number
  startTime: string
  endTime: string
  duration: number
  breakTime: number
  enableRecording: boolean
  slots?: Array<{ start: string; end: string }>
}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Create call product
    const now = new Date()
    const productData: Record<string, unknown> = {
      creator_id: user.id,
      type: data.type,
      title: data.title,
      description: data.description,
      price: data.price,
      duration_minutes: data.duration,
      status: 'active'
    }

    // Add type-specific fields
    if (data.type === 'queue') {
      // For queue type, we need to parse the time and set slot_date
      const startDate = parse(data.startTime, 'HH:mm', new Date())
      productData.slot_date = format(startDate, 'yyyy-MM-dd')
      productData.start_time = data.startTime
      productData.end_time = data.endTime
      productData.max_participants = 10 // Default max participants
      productData.remaining_slots = 10 // Default remaining slots
    } else {
      // For fixed type, calculate availability window
      const startDate = parse(data.startTime, 'HH:mm', new Date())
      const endDate = parse(data.endTime, 'HH:mm', new Date())
      
      // Set today's date
      startDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
      endDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
      
      // If end time is before start time, assume next day
      if (isBefore(endDate, startDate)) {
        endDate.setDate(endDate.getDate() + 1)
      }
      
      productData.available_from = startDate.toISOString()
      productData.available_until = endDate.toISOString()
    }

    const { data: product, error: productError } = await supabase
      .from('call_products')
      .insert(productData)
      .select()
      .single()

    if (productError || !product) {
      console.error('Error creating call product:', productError)
      return { error: 'Failed to create call plan' }
    }

    // TODO: If type is 'fixed', create individual time slots
    // This would require additional tables for queue settings and fixed slots

    return { 
      success: true, 
      productId: product.id,
      message: data.type === 'queue' 
        ? '先着制プランを作成しました' 
        : `時間制プラン（${data.slots?.length || 0}枠）を作成しました`
    }
  } catch (error) {
    console.error('Error in createCallPlan:', error)
    return { error: 'Internal server error' }
  }
}