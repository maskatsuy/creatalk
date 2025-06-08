'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { format, parse, isBefore } from 'date-fns'
import { dailyService } from '@/lib/daily'
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

    // Get confirmed/in_progress bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_products!inner(title, type, duration_minutes),
        call_rooms!call_bookings_room_id_fkey(
          id,
          daily_room_url
        )
      `)
      .eq('creator_id', user.id)
      .in('status', ['confirmed', 'in_progress'])
      .order('created_at', { ascending: false })

    // Also check for active call plans (current time within schedule)
    const now = new Date()
    const currentTime = format(now, 'HH:mm')
    const currentDate = format(now, 'yyyy-MM-dd')

    const { data: activePlans } = await supabase
      .from('call_products')
      .select(`
        id,
        title,
        type,
        duration_minutes,
        slot_date,
        start_time,
        end_time,
        available_from,
        available_until,
        max_participants,
        remaining_slots
      `)
      .eq('creator_id', user.id)
      .eq('status', 'active')

    const activeBookingsArray = bookings || []

    // Check if any plans are currently in their scheduled time
    if (activePlans && activePlans.length > 0) {
      for (const plan of activePlans) {
        let isCurrentlyActive = false

        if (plan.type === 'queue' && plan.slot_date && plan.start_time && plan.end_time) {
          // Queue type: check if today matches slot_date and current time is within (start_time - 10 minutes) to end_time
          if (plan.slot_date === currentDate) {
            // Convert time strings to HH:mm format for comparison
            const startTime = plan.start_time.substring(0, 5) // "13:06:00" -> "13:06"
            const endTime = plan.end_time.substring(0, 5)     // "14:57:00" -> "14:57"
            
            // Calculate 10 minutes before start time
            const [startHour, startMin] = startTime.split(':').map(Number)
            const startDate = new Date()
            startDate.setHours(startHour, startMin, 0, 0)
            const preStartDate = new Date(startDate.getTime() - 10 * 60 * 1000) // 10分前
            const preStartTime = preStartDate.toTimeString().substring(0, 5)
            
            // Handle time comparison (considering possible next day)
            if (endTime < preStartTime) {
              // Crosses midnight
              isCurrentlyActive = currentTime >= preStartTime || currentTime <= endTime
            } else {
              // Same day - check if current time is within (start - 10min) to end
              isCurrentlyActive = currentTime >= preStartTime && currentTime <= endTime
            }
          }
        } else if (plan.type === 'fixed' && plan.available_from && plan.available_until) {
          // Fixed type: check if current time is within (available_from - 10 minutes) to available_until
          const availableFrom = new Date(plan.available_from)
          const availableUntil = new Date(plan.available_until)
          const preAvailableFrom = new Date(availableFrom.getTime() - 10 * 60 * 1000) // 10分前
          isCurrentlyActive = now >= preAvailableFrom && now <= availableUntil
        }

        if (isCurrentlyActive) {
          // Check if plan has actually started (not just in pre-start period)
          let hasStarted = false
          
          if (plan.type === 'queue' && plan.slot_date && plan.start_time && plan.end_time) {
            const startTime = plan.start_time.substring(0, 5)
            const endTime = plan.end_time.substring(0, 5)
            
            if (endTime < startTime) {
              // Crosses midnight
              hasStarted = currentTime >= startTime || currentTime <= endTime
            } else {
              // Same day
              hasStarted = currentTime >= startTime && currentTime <= endTime
            }
          } else if (plan.type === 'fixed' && plan.available_from) {
            const availableFrom = new Date(plan.available_from)
            hasStarted = now >= availableFrom
          }
          
          // Calculate remaining time until start
          let minutesUntilStart = 0
          if (!hasStarted) {
            if (plan.type === 'queue' && plan.slot_date && plan.start_time) {
              const startTime = plan.start_time.substring(0, 5)
              const [startHour, startMin] = startTime.split(':').map(Number)
              const startDate = new Date()
              startDate.setHours(startHour, startMin, 0, 0)
              
              // If start time is before current time, assume it's for tomorrow
              if (startDate <= now) {
                startDate.setDate(startDate.getDate() + 1)
              }
              
              minutesUntilStart = Math.max(0, Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60)))
            } else if (plan.type === 'fixed' && plan.available_from) {
              const availableFrom = new Date(plan.available_from)
              minutesUntilStart = Math.max(0, Math.floor((availableFrom.getTime() - now.getTime()) / (1000 * 60)))
            }
          }

          // Create a pseudo-booking object for active plans
          const pseudoBooking = {
            id: `plan-${plan.id}`,
            status: 'confirmed' as const,
            created_at: now.toISOString(),
            plan_id: plan.id,
            call_products: {
              title: plan.title,
              type: plan.type,
              duration_minutes: plan.duration_minutes
            },
            call_rooms: null,
            is_active_plan: true, // Flag to distinguish from real bookings
            is_pre_start: !hasStarted, // Flag to indicate if in pre-start period
            minutes_until_start: minutesUntilStart, // Minutes remaining until start
            remaining_slots: plan.remaining_slots || 0,
            max_participants: plan.max_participants || 0
          }
          
          activeBookingsArray.push(pseudoBooking)
        }
      }
    }

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return { error: bookingsError.message }
    }

    return { bookings: activeBookingsArray }
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

export async function getCreatorCallProducts(options: {
  page?: number
  limit?: number
  status?: 'active' | 'inactive'
} = {}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    const page = options.page || 1
    const limit = options.limit || 10
    const offset = (page - 1) * limit

    let query = supabase
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
        updated_at,
        slot_date,
        start_time,
        end_time,
        available_from,
        available_until,
        max_participants,
        remaining_slots
      `, { count: 'exact' })
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (options.status) {
      query = query.eq('status', options.status)
    }

    const { data, error, count } = await query

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

    const totalPages = Math.ceil((count || 0) / limit)

    return { 
      products: products as CallProduct[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
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

    // Get bookings with user profiles using manual JOIN (user_id matches profiles.id)
    const { data: bookings, error: bookingsError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        profiles!user_id(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: true })

    if (bookingsError) {
      console.error('Error fetching booking details:', bookingsError)
      return { error: bookingsError.message }
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

    // Get booking details
    const { data: bookingData, error: bookingError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_products!inner(
          duration_minutes,
          type,
          title
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !bookingData) {
      return { error: 'Booking details not found' }
    }

    // Create Daily.co room
    const roomName = `call-${bookingId.substring(0, 8)}-${Date.now()}`
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + bookingData.call_products.duration_minutes + 30) // Add 30min buffer

    try {
      const dailyRoom = await dailyService.createRoom({
        name: roomName,
        privacy: 'private',
        properties: {
          max_participants: 2,
          enable_recording: false, // TODO: Check product settings
          enable_chat: true,
          enable_screenshare: true,
          exp: Math.floor(expiresAt.getTime() / 1000),
          lang: 'ja'
        }
      })

      // Create call_rooms record
      const { data: callRoom, error: roomError } = await supabase
        .from('call_rooms')
        .insert({
          booking_id: bookingId,
          creator_id: user.id,
          daily_room_name: roomName,
          daily_room_url: dailyRoom.url,
          max_participants: 2,
          enable_recording: false,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (roomError) {
        // Rollback: Delete Daily.co room if database insert fails
        await dailyService.deleteRoom(roomName).catch(console.error)
        console.error('Error creating call room record:', roomError)
        return { error: 'Failed to create call room' }
      }

      // Update booking status and link to room
      const { error: updateError } = await supabase
        .from('call_bookings')
        .update({ 
          status: 'in_progress',
          room_id: callRoom.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (updateError) {
        // Rollback: Delete room if booking update fails
        await dailyService.deleteRoom(roomName).catch(console.error)
        await supabase.from('call_rooms').delete().eq('id', callRoom.id)
        console.error('Error updating booking:', updateError)
        return { error: updateError.message }
      }

      // Create creator token
      const creatorToken = await dailyService.createMeetingToken(roomName, {
        user_id: user.id,
        user_name: 'クリエイター',
        is_owner: true,
        exp: Math.floor(expiresAt.getTime() / 1000)
      })

      // 埋め込みページのURLを構築
      const embedUrl = `/call/${callRoom.id}?url=${encodeURIComponent(dailyRoom.url)}&t=${creatorToken}&duration=${bookingData.call_products.duration_minutes}&booking=${bookingId}`

      return { 
        roomUrl: `${dailyRoom.url}?t=${creatorToken}`,
        embedUrl,
        roomId: callRoom.id,
        success: true 
      }
    } catch (error) {
      console.error('Error creating Daily.co room:', error)
      return { error: 'Failed to create video room' }
    }
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

    // Get booking and room details
    const { data: booking, error: bookingError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_rooms!inner(
          id,
          daily_room_name,
          status
        )
      `)
      .eq('id', bookingId)
      .eq('creator_id', user.id)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    // End the call room
    if (booking.call_rooms && booking.call_rooms.status === 'active') {
      // Delete Daily.co room
      try {
        await dailyService.deleteRoom(booking.call_rooms.daily_room_name)
      } catch (error) {
        console.error('Error deleting Daily.co room:', error)
        // Continue even if Daily.co deletion fails
      }

      // Update room status
      const { error: roomUpdateError } = await supabase
        .from('call_rooms')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.call_rooms.id)

      if (roomUpdateError) {
        console.error('Error updating room status:', roomUpdateError)
      }
    }

    // Update booking status to completed
    const { error: updateError } = await supabase
      .from('call_bookings')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

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

export async function rejoinCall(bookingId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get booking and room details
    const { data: booking, error: bookingError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_products!inner(
          duration_minutes,
          type,
          title
        ),
        call_rooms!inner(
          id,
          daily_room_name,
          daily_room_url,
          status
        )
      `)
      .eq('id', bookingId)
      .eq('creator_id', user.id)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    if (!booking.call_rooms || booking.call_rooms.status !== 'active') {
      return { error: 'Call room is not active' }
    }

    // Create new token for rejoining
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + booking.call_products.duration_minutes + 30)

    try {
      const creatorToken = await dailyService.createMeetingToken(booking.call_rooms.daily_room_name, {
        user_id: user.id,
        user_name: 'クリエイター',
        is_owner: true,
        exp: Math.floor(expiresAt.getTime() / 1000)
      })

      // 埋め込みページのURLを構築
      const embedUrl = `/call/${booking.call_rooms.id}?url=${encodeURIComponent(booking.call_rooms.daily_room_url)}&t=${creatorToken}&duration=${booking.call_products.duration_minutes}&booking=${bookingId}`

      return { 
        roomUrl: `${booking.call_rooms.daily_room_url}?t=${creatorToken}`,
        embedUrl,
        roomId: booking.call_rooms.id,
        success: true 
      }
    } catch (error) {
      console.error('Error creating rejoin token:', error)
      return { error: 'Failed to create access token' }
    }
  } catch (error) {
    console.error('Error in rejoinCall:', error)
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

    // Parse and validate time slots
    const now = new Date()
    let newStartTime: Date, newEndTime: Date

    if (data.type === 'queue') {
      // For queue type, use today's date with specified times
      newStartTime = parse(data.startTime, 'HH:mm', new Date())
      newEndTime = parse(data.endTime, 'HH:mm', new Date())
      
      // Set today's date
      newStartTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
      newEndTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
      
      // If end time is before start time, assume next day
      if (isBefore(newEndTime, newStartTime)) {
        newEndTime.setDate(newEndTime.getDate() + 1)
      }
    } else {
      // For fixed type, calculate availability window
      newStartTime = parse(data.startTime, 'HH:mm', new Date())
      newEndTime = parse(data.endTime, 'HH:mm', new Date())
      
      // Set today's date
      newStartTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
      newEndTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
      
      // If end time is before start time, assume next day
      if (isBefore(newEndTime, newStartTime)) {
        newEndTime.setDate(newEndTime.getDate() + 1)
      }
    }

    // Check for time conflicts with existing active plans
    console.log('Checking time conflicts...')
    const { data: existingPlans, error: checkError } = await supabase
      .from('call_products')
      .select(`
        id, title, type, slot_date, start_time, end_time, 
        available_from, available_until
      `)
      .eq('creator_id', user.id)
      .eq('status', 'active')

    if (checkError) {
      console.error('Error checking existing plans:', checkError)
      return { error: 'Failed to check existing plans' }
    }

    // Check for conflicts
    for (const existingPlan of existingPlans || []) {
      let existingStart: Date, existingEnd: Date

      if (existingPlan.type === 'queue' && existingPlan.slot_date && existingPlan.start_time && existingPlan.end_time) {
        // Queue type conflict check
        existingStart = new Date(`${existingPlan.slot_date}T${existingPlan.start_time}:00`)
        existingEnd = new Date(`${existingPlan.slot_date}T${existingPlan.end_time}:00`)
      } else if (existingPlan.type === 'fixed' && existingPlan.available_from && existingPlan.available_until) {
        // Fixed type conflict check
        existingStart = new Date(existingPlan.available_from)
        existingEnd = new Date(existingPlan.available_until)
      } else {
        continue // Skip invalid entries
      }

      // Check if times overlap
      const hasConflict = (
        (newStartTime >= existingStart && newStartTime < existingEnd) ||
        (newEndTime > existingStart && newEndTime <= existingEnd) ||
        (newStartTime <= existingStart && newEndTime >= existingEnd)
      )

      if (hasConflict) {
        const conflictTime = existingPlan.type === 'queue' 
          ? `${existingPlan.start_time}〜${existingPlan.end_time}`
          : `${new Date(existingPlan.available_from!).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜${new Date(existingPlan.available_until!).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
        
        return { 
          error: `時間が重複しています。既存のプラン「${existingPlan.title}」(${conflictTime})と重複しています。` 
        }
      }
    }

    // Create call product
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
      productData.slot_date = format(newStartTime, 'yyyy-MM-dd')
      productData.start_time = data.startTime
      productData.end_time = data.endTime
      productData.max_participants = 10 // Default max participants
      productData.remaining_slots = 10 // Default remaining slots
    } else {
      productData.available_from = newStartTime.toISOString()
      productData.available_until = newEndTime.toISOString()
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

export async function checkTimeConflict(data: {
  type: 'queue' | 'fixed'
  startTime: string
  endTime: string
  excludeId?: string  // For editing existing plans
}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Parse new time slots
    const now = new Date()
    const newStartTime = parse(data.startTime, 'HH:mm', new Date())
    const newEndTime = parse(data.endTime, 'HH:mm', new Date())
    
    // Set today's date
    newStartTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
    newEndTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
    
    // If end time is before start time, assume next day
    if (isBefore(newEndTime, newStartTime)) {
      newEndTime.setDate(newEndTime.getDate() + 1)
    }

    // Get existing active plans
    let query = supabase
      .from('call_products')
      .select(`
        id, title, type, slot_date, start_time, end_time, 
        available_from, available_until
      `)
      .eq('creator_id', user.id)
      .eq('status', 'active')

    // Exclude current plan if editing
    if (data.excludeId) {
      query = query.neq('id', data.excludeId)
    }

    const { data: existingPlans, error: checkError } = await query

    if (checkError) {
      return { error: 'Failed to check existing plans' }
    }

    // Check for conflicts
    for (const existingPlan of existingPlans || []) {
      let existingStart: Date, existingEnd: Date

      if (existingPlan.type === 'queue' && existingPlan.slot_date && existingPlan.start_time && existingPlan.end_time) {
        existingStart = new Date(`${existingPlan.slot_date}T${existingPlan.start_time}:00`)
        existingEnd = new Date(`${existingPlan.slot_date}T${existingPlan.end_time}:00`)
      } else if (existingPlan.type === 'fixed' && existingPlan.available_from && existingPlan.available_until) {
        existingStart = new Date(existingPlan.available_from)
        existingEnd = new Date(existingPlan.available_until)
      } else {
        continue
      }

      // Check if times overlap
      const hasConflict = (
        (newStartTime >= existingStart && newStartTime < existingEnd) ||
        (newEndTime > existingStart && newEndTime <= existingEnd) ||
        (newStartTime <= existingStart && newEndTime >= existingEnd)
      )

      if (hasConflict) {
        const conflictTime = existingPlan.type === 'queue' 
          ? `${existingPlan.start_time}〜${existingPlan.end_time}`
          : `${new Date(existingPlan.available_from!).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜${new Date(existingPlan.available_until!).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
        
        return { 
          hasConflict: true,
          conflictPlan: {
            title: existingPlan.title,
            time: conflictTime
          }
        }
      }
    }

    return { hasConflict: false }
  } catch (error) {
    console.error('Error in checkTimeConflict:', error)
    return { error: 'Internal server error' }
  }
}

export async function getWaitingRoomStatus(planId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('id, title, duration_minutes, remaining_slots, max_participants, slot_date, start_time, end_time')
      .eq('id', planId)
      .eq('creator_id', user.id)
      .single()

    if (planError || !plan) {
      return { error: 'Plan not found' }
    }

    // Get queue participants first
    const { data: queueData, error: queueError } = await supabase
      .from('queue_participants')
      .select('*')
      .eq('plan_id', planId)
      .order('position', { ascending: true })

    // If we have participants, get their profiles separately
    let queueWithProfiles = []
    if (queueData && queueData.length > 0) {
      const userIds = queueData.map(p => p.user_id)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds)

      // Merge the data
      queueWithProfiles = queueData.map(participant => {
        const profile = profilesData?.find(p => p.id === participant.user_id)
        return {
          ...participant,
          user_profile: profile || { display_name: null, avatar_url: null }
        }
      })
    }

    if (queueError) {
      console.error('Error fetching queue:', queueError)
      return { error: 'Failed to fetch queue' }
    }

    // Use the merged queue data
    const queue = queueWithProfiles || []

    // Get creator status
    const { data: statusData } = await supabase
      .from('creator_status')
      .select('status')
      .eq('creator_id', user.id)
      .eq('plan_id', planId)
      .single()

    const creator_status = statusData?.status || 'offline'

    // Get current call first
    const { data: currentCallData, error: callError } = await supabase
      .from('current_queue_calls')
      .select('*')
      .eq('plan_id', planId)
      .eq('creator_id', user.id)
      .eq('status', 'active')
      .single()

    let current_call = null
    if (currentCallData && !callError) {
      // Get participant and profile data separately
      const { data: participantData } = await supabase
        .from('queue_participants')
        .select('*')
        .eq('id', currentCallData.participant_id)
        .single()

      if (participantData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', participantData.user_id)
          .single()

        current_call = {
          id: currentCallData.id,
          participant: {
            ...participantData,
            user_profile: profileData || { 
              display_name: null, 
              avatar_url: null 
            }
          },
          started_at: currentCallData.started_at,
          ends_at: currentCallData.ends_at,
          daily_room_name: currentCallData.daily_room_name,
          daily_room_url: currentCallData.daily_room_url
        }
      }
    }

    return {
      status: {
        plan,
        queue,
        creator_status,
        current_call
      }
    }
  } catch (error) {
    console.error('Error in getWaitingRoomStatus:', error)
    return { error: 'Internal server error' }
  }
}

export async function updateCreatorStatus(planId: string, status: 'waiting' | 'break') {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify plan belongs to creator
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('id')
      .eq('id', planId)
      .eq('creator_id', user.id)
      .single()

    if (planError || !plan) {
      return { error: 'Plan not found' }
    }

    // Upsert creator status
    const { error: statusError } = await supabase
      .from('creator_status')
      .upsert({
        creator_id: user.id,
        plan_id: planId,
        status,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'creator_id,plan_id'
      })

    if (statusError) {
      console.error('Error updating creator status:', statusError)
      return { error: 'Failed to update status' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateCreatorStatus:', error)
    return { error: 'Internal server error' }
  }
}

export async function startQueueCall(planId: string, participantId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('duration_minutes, title')
      .eq('id', planId)
      .eq('creator_id', user.id)
      .single()

    if (planError || !plan) {
      return { error: 'Plan not found' }
    }

    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('queue_participants')
      .select('*')
      .eq('id', participantId)
      .eq('plan_id', planId)
      .eq('status', 'waiting')
      .single()

    if (participantError || !participant) {
      return { error: 'Participant not found' }
    }

    // Create Daily.co room
    const roomName = `queue-${planId.substring(0, 8)}-${participant.position}-${Date.now()}`
    const duration = plan.duration_minutes
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + duration + 5) // Add 5min buffer

    try {
      const dailyRoom = await dailyService.createRoom({
        name: roomName,
        privacy: 'private',
        properties: {
          max_participants: 2,
          enable_recording: false,
          enable_chat: true,
          enable_screenshare: true,
          exp: Math.floor(expiresAt.getTime() / 1000),
          lang: 'ja'
        }
      })

      // Create current queue call record
      const callEndsAt = new Date()
      callEndsAt.setMinutes(callEndsAt.getMinutes() + duration)

      const { data: currentCall, error: callError } = await supabase
        .from('current_queue_calls')
        .insert({
          plan_id: planId,
          creator_id: user.id,
          participant_id: participantId,
          daily_room_name: roomName,
          daily_room_url: dailyRoom.url,
          ends_at: callEndsAt.toISOString()
        })
        .select()
        .single()

      if (callError) {
        // Rollback: Delete Daily.co room
        await dailyService.deleteRoom(roomName).catch(console.error)
        console.error('Error creating current call:', callError)
        return { error: 'Failed to create call session' }
      }

      // Update participant status to in_call
      const { error: updateError } = await supabase
        .from('queue_participants')
        .update({
          status: 'in_call',
          call_started_at: new Date().toISOString()
        })
        .eq('id', participantId)

      if (updateError) {
        console.error('Error updating participant status:', updateError)
      }

      // Update creator status to in_call
      await supabase
        .from('creator_status')
        .upsert({
          creator_id: user.id,
          plan_id: planId,
          status: 'in_call',
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'creator_id,plan_id'
        })

      // Create creator token
      const creatorToken = await dailyService.createMeetingToken(roomName, {
        user_id: user.id,
        user_name: 'クリエイター',
        is_owner: true,
        exp: Math.floor(expiresAt.getTime() / 1000)
      })

      // Build embed URL for queue call
      const embedUrl = `/call/${currentCall.id}?url=${encodeURIComponent(dailyRoom.url)}&t=${creatorToken}&duration=${duration}&booking=queue-${participantId}&queue=true&planId=${planId}`

      return {
        roomUrl: `${dailyRoom.url}?t=${creatorToken}`,
        embedUrl,
        callId: currentCall.id,
        success: true
      }
    } catch (error) {
      console.error('Error creating Daily.co room:', error)
      return { error: 'Failed to create video room' }
    }
  } catch (error) {
    console.error('Error in startQueueCall:', error)
    return { error: 'Internal server error' }
  }
}

export async function endQueueCall(planId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get current active call
    const { data: currentCall, error: callError } = await supabase
      .from('current_queue_calls')
      .select('*')
      .eq('plan_id', planId)
      .eq('creator_id', user.id)
      .eq('status', 'active')
      .single()

    if (callError || !currentCall) {
      return { error: 'No active call found' }
    }

    // Delete Daily.co room
    try {
      await dailyService.deleteRoom(currentCall.daily_room_name)
    } catch (error) {
      console.error('Error deleting Daily.co room:', error)
      // Continue even if deletion fails
    }

    // Update current call status to ended
    await supabase
      .from('current_queue_calls')
      .update({ status: 'ended' })
      .eq('id', currentCall.id)

    // Update participant status to completed
    await supabase
      .from('queue_participants')
      .update({
        status: 'completed',
        call_ended_at: new Date().toISOString()
      })
      .eq('id', currentCall.participant_id)

    // Update creator status to break (休憩中)
    await supabase
      .from('creator_status')
      .upsert({
        creator_id: user.id,
        plan_id: planId,
        status: 'break',
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'creator_id,plan_id'
      })

    return { success: true }
  } catch (error) {
    console.error('Error in endQueueCall:', error)
    return { error: 'Internal server error' }
  }
}

export async function addTestParticipant(planId: string, displayName: string = 'テストユーザー') {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Ensure user profile exists
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: displayName,
        avatar_url: null
      }, {
        onConflict: 'id'
      })

    // Get next position in queue
    const { data: lastParticipant } = await supabase
      .from('queue_participants')
      .select('position')
      .eq('plan_id', planId)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (lastParticipant?.position || 0) + 1

    // Create test participant (using creator's user_id for testing)
    const { error: insertError } = await supabase
      .from('queue_participants')
      .insert({
        plan_id: planId,
        user_id: user.id, // Using creator as test participant
        position: nextPosition,
        status: 'waiting'
      })

    if (insertError) {
      console.error('Error adding test participant:', insertError)
      return { error: 'Failed to add test participant' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in addTestParticipant:', error)
    return { error: 'Internal server error' }
  }
}

export async function rejoinQueueCall(planId: string, currentCallId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get current call details
    const { data: currentCall, error: callError } = await supabase
      .from('current_queue_calls')
      .select('*')
      .eq('id', currentCallId)
      .eq('creator_id', user.id)
      .eq('status', 'active')
      .single()

    if (callError || !currentCall) {
      return { error: 'Active call not found' }
    }

    // Get plan details for duration
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('duration_minutes')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return { error: 'Plan not found' }
    }

    // Create new token for rejoining
    const expiresAt = new Date(currentCall.ends_at)
    const creatorToken = await dailyService.createMeetingToken(currentCall.daily_room_name, {
      user_id: user.id,
      user_name: 'クリエイター',
      is_owner: true,
      exp: Math.floor(expiresAt.getTime() / 1000)
    })

    // Build embed URL for rejoining
    const embedUrl = `/call/${currentCall.id}?url=${encodeURIComponent(currentCall.daily_room_url)}&t=${creatorToken}&duration=${plan.duration_minutes}&booking=queue-${currentCall.participant_id}&queue=true&planId=${planId}`

    return {
      roomUrl: `${currentCall.daily_room_url}?t=${creatorToken}`,
      embedUrl,
      callId: currentCall.id,
      success: true
    }
  } catch (error) {
    console.error('Error in rejoinQueueCall:', error)
    return { error: 'Internal server error' }
  }
}