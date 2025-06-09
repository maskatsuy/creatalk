'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { dailyService } from '@/lib/daily'
import { revalidatePath } from 'next/cache'

export async function startCall(bookingId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get booking details with call product
    const { data: booking, error: bookingError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_products!inner(
          id,
          title,
          duration_minutes,
          type
        )
      `)
      .eq('id', bookingId)
      .eq('creator_id', user.id)
      .single()

    if (bookingError || !booking) {
      console.error('[startCall] Booking error:', bookingError)
      return { error: 'Booking not found' }
    }

    if (booking.status !== 'confirmed') {
      return { error: 'Invalid booking status' }
    }

    // Create a Daily.co room for this call
    const roomName = `booking-${bookingId}-${Date.now()}`
    
    try {
      const dailyRoom = await dailyService.createRoom({
        name: roomName,
        properties: {
          exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
          enable_prejoin_ui: false,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false,
          max_participants: 2,
          eject_at_room_exp: false // 時間が来ても自動的に退出させない
        }
      })

      if (!dailyRoom) {
        console.error('[startCall] Daily room creation failed')
        return { error: 'Failed to create video room' }
      }

      // Create call_rooms record
      const { data: callRoom, error: callRoomError } = await supabase
        .from('call_rooms')
        .insert({
          daily_room_name: roomName,
          daily_room_url: dailyRoom.url,
          creator_id: user.id,
          booking_id: bookingId
        })
        .select()
        .single()

      if (callRoomError || !callRoom) {
        console.error('[startCall] Call room insert error:', callRoomError)
        // Try to delete the Daily room if DB insert fails
        await dailyService.deleteRoom(roomName)
        return { error: 'Failed to save call room' }
      }

      // Update booking with room_id and status
      const { error: updateError } = await supabase
        .from('call_bookings')
        .update({ 
          room_id: callRoom.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (updateError) {
        console.error('[startCall] Booking update error:', updateError)
        return { error: 'Failed to update booking status' }
      }

      // Create meeting tokens for both participants
      const creatorToken = await dailyService.createMeetingToken(roomName, {
        user_id: user.id,
        user_name: 'クリエイター',
        is_owner: true
      })

      const participantToken = booking.user_id ? await dailyService.createMeetingToken(roomName, {
        user_id: booking.user_id,
        user_name: 'ゲスト',
        is_owner: false
      }) : null

      // Send notification to participant (implement notification service)
      // await notificationService.sendCallStartNotification(booking.user_id, dailyRoom.url)

      revalidatePath('/creator/calls')
      
      // Create embed URL for creator
      const embedUrl = `/call/${bookingId}?url=${encodeURIComponent(dailyRoom.url)}&t=${creatorToken}&duration=${booking.call_products.duration_minutes}&booking=${bookingId}`

      return { 
        success: true,
        roomUrl: dailyRoom.url,
        creatorToken: creatorToken,
        participantToken: participantToken,
        duration: booking.call_products.duration_minutes,
        embedUrl
      }
    } catch (dailyError) {
      console.error('[startCall] Daily API error:', dailyError)
      return { error: 'Failed to setup video call' }
    }
  } catch (error) {
    console.error('[startCall] Error:', error)
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

    // Get booking with room details
    const { data: booking, error: bookingError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_rooms!call_bookings_room_id_fkey(
          id,
          daily_room_name
        )
      `)
      .eq('id', bookingId)
      .eq('creator_id', user.id)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    if (booking.status !== 'in_progress') {
      return { error: 'Call is not in progress' }
    }

    // Delete the Daily.co room
    if (booking.call_rooms?.daily_room_name) {
      await dailyService.deleteRoom(booking.call_rooms.daily_room_name)
    }

    // Update call room status
    if (booking.room_id) {
      await supabase
        .from('call_rooms')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', booking.room_id)
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('call_bookings')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('[endCall] Update error:', updateError)
      return { error: 'Failed to update booking status' }
    }

    revalidatePath('/creator/calls')
    return { success: true }
  } catch (error) {
    console.error('[endCall] Error:', error)
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

    // Get booking with room details
    const { data: booking, error: bookingError } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_products!inner(duration_minutes),
        call_rooms!call_bookings_room_id_fkey(
          id,
          daily_room_url
        )
      `)
      .eq('id', bookingId)
      .eq('creator_id', user.id)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    if (booking.status !== 'in_progress') {
      return { error: 'Call is not in progress' }
    }

    if (!booking.call_rooms?.daily_room_url) {
      return { error: 'Call room not found' }
    }

    // Create a new meeting token
    const creatorToken = await dailyService.createMeetingToken(
      booking.call_rooms.daily_room_url.split('/').pop() || '',
      {
        user_id: user.id,
        user_name: 'クリエイター',
        is_owner: true
      }
    )

    // Create embed URL for creator
    const embedUrl = `/call/${bookingId}?url=${encodeURIComponent(booking.call_rooms.daily_room_url)}&t=${creatorToken}&duration=${booking.call_products.duration_minutes}&booking=${bookingId}`

    return { 
      success: true,
      roomUrl: booking.call_rooms.daily_room_url,
      creatorToken: creatorToken,
      duration: booking.call_products.duration_minutes,
      embedUrl
    }
  } catch (error) {
    console.error('[rejoinCall] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function createCallRoom() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // 既存のコードをそのまま維持
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // TODO: Implement call room creation
    return { error: 'Not implemented' }
  } catch (error) {
    console.error('[createCallRoom] Error:', error)
    return { error: 'Internal server error' }
  }
}