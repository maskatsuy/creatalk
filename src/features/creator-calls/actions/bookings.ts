'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
        start_at,
        end_at,
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

        if (plan.type === 'queue') {
          // Use new timestamp columns if available, fallback to old columns
          if (plan.start_at && plan.end_at) {
            const planStartDateTime = new Date(plan.start_at)
            const planPreStartDateTime = new Date(planStartDateTime.getTime() - 10 * 60 * 1000) // 10分前
            const planEndDateTime = new Date(plan.end_at)
            
            isCurrentlyActive = now >= planPreStartDateTime && now <= planEndDateTime
          } else if (plan.slot_date && plan.start_time && plan.end_time) {
            // Fallback to old columns for backward compatibility
            const planStartDateTime = new Date(`${plan.slot_date}T${plan.start_time}`)
            const planPreStartDateTime = new Date(planStartDateTime.getTime() - 10 * 60 * 1000) // 10分前
            
            const planEndDateTime = new Date(`${plan.slot_date}T${plan.end_time}`)
            if (plan.end_time < plan.start_time) {
              planEndDateTime.setDate(planEndDateTime.getDate() + 1)
            }
            
            isCurrentlyActive = now >= planPreStartDateTime && now <= planEndDateTime
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
          
          if (plan.type === 'queue' && plan.slot_date && plan.start_time) {
            const planStartDateTime = new Date(`${plan.slot_date}T${plan.start_time}`)
            hasStarted = now >= planStartDateTime
          } else if (plan.type === 'fixed' && plan.available_from) {
            const availableFrom = new Date(plan.available_from)
            hasStarted = now >= availableFrom
          }

          // Map plan to booking format
          activeBookingsArray.push({
            id: `plan-${plan.id}`,
            product_id: plan.id,
            status: hasStarted ? 'in_progress' : 'confirmed',
            call_products: plan,
            title: plan.title,
            duration_minutes: plan.duration_minutes,
            remaining_slots: plan.remaining_slots || 0,
            max_participants: plan.max_participants || 0,
            customer_name: hasStarted ? 
              (plan.remaining_slots === plan.max_participants ? 
                '待機中（参加者なし）' : 
                '複数の参加者') : 
              '開始前',
            customer_email: hasStarted ? 
              (plan.remaining_slots === plan.max_participants ? 
                '' : 
                `${plan.max_participants - (plan.remaining_slots || 0)}人が参加中`) : 
              '',
            isQueuePlan: true,
            hasStarted,
            planId: plan.id
          })
        }
      }
    }

    if (bookingsError) {
      console.error('[getActiveCallBookings] Error fetching bookings:', bookingsError)
      return { error: 'Failed to fetch bookings' }
    }

    // Return sorted active bookings (in_progress first, then confirmed)
    const sortedBookings = activeBookingsArray.sort((a, b) => {
      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
      if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
      return 0
    })

    return { bookings: sortedBookings }
  } catch (error) {
    console.error('[getActiveCallBookings] Error:', error)
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

    // Update reservation status
    const { error: updateError } = await supabase
      .from('call_bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .eq('creator_id', user.id)

    if (updateError) {
      console.error('[updateReservationStatus] Update error:', updateError)
      return { error: 'Failed to update reservation status' }
    }

    revalidatePath('/creator/calls')
    return { success: true }
  } catch (error) {
    console.error('[updateReservationStatus] Error:', error)
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

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('call_products')
      .select('*')
      .eq('id', productId)
      .eq('creator_id', user.id)
      .single()

    if (productError || !product) {
      console.error('[getProductBookingDetails] Product error:', productError)
      return { error: 'Product not found' }
    }

    // Get all bookings for this product
    const { data: bookings, error: bookingsError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        profiles!call_bookings_customer_id_fkey(
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error('[getProductBookingDetails] Bookings error:', bookingsError)
      return { error: 'Failed to fetch bookings' }
    }

    // Calculate summary statistics
    const totalBookings = bookings?.length || 0
    const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0
    const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
    const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0
    const inProgressBookings = bookings?.filter(b => b.status === 'in_progress').length || 0

    return {
      product,
      bookings: bookings || [],
      summary: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        in_progress: inProgressBookings
      }
    }
  } catch (error) {
    console.error('[getProductBookingDetails] Error:', error)
    return { error: 'Internal server error' }
  }
}