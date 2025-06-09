'use server'

import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'

export async function createBookingFromPayment(params: {
  productId: string
  userId: string
  stripePaymentIntentId: string
  stripeSessionId: string
}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)

    // Verify user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== params.userId) {
      return { error: '認証エラー' }
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('call_products')
      .select('*')
      .eq('id', params.productId)
      .single()

    if (productError || !product) {
      return { error: '商品が見つかりません' }
    }

    // Get creator info separately
    const { data: creatorInfo } = await supabase
      .from('creator_applications')
      .select('display_name')
      .eq('user_id', product.creator_id)
      .eq('status', 'approved')
      .single()

    // Create booking based on product type
    if (product.type === 'queue') {
      // For queue type, add to queue_participants
      const { data: lastParticipant } = await supabase
        .from('queue_participants')
        .select('position')
        .eq('plan_id', params.productId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

      const nextPosition = (lastParticipant?.position || 0) + 1

      console.log('[createBookingFromPayment] Creating queue participant:', {
        plan_id: params.productId,
        user_id: user.id,
        position: nextPosition,
        status: 'waiting'
      })

      const { data: participant, error: participantError } = await supabase
        .from('queue_participants')
        .insert({
          plan_id: params.productId,
          user_id: user.id,
          position: nextPosition,
          status: 'waiting'
        })
        .select()
        .single()

      if (participantError) {
        console.error('Queue participant creation error:', participantError)
        return { error: '予約の作成に失敗しました' }
      }

      console.log('[createBookingFromPayment] Queue participant created:', participant)

      // Record payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          product_id: params.productId,
          amount: product.price,
          stripe_payment_intent_id: params.stripePaymentIntentId,
          stripe_session_id: params.stripeSessionId,
          status: 'completed'
        })

      if (paymentError) {
        console.error('Payment record error:', paymentError.message || paymentError)
        // Don't fail the booking if payment record fails
      }

      // Check if the plan is currently active
      const now = new Date()
      let isPlanActive = false
      
      if (product.start_at && product.end_at) {
        const startAt = new Date(product.start_at)
        const endAt = new Date(product.end_at)
        isPlanActive = now >= startAt && now <= endAt
      } else if (product.slot_date && product.start_time && product.end_time) {
        // Handle JST timezone properly
        const startDateTimeJST = `${product.slot_date}T${product.start_time}+09:00`
        const endDateTimeJST = `${product.slot_date}T${product.end_time}+09:00`
        const startDateTime = new Date(startDateTimeJST)
        const endDateTime = new Date(endDateTimeJST)
        
        if (product.end_time < product.start_time) {
          endDateTime.setDate(endDateTime.getDate() + 1)
        }
        isPlanActive = now >= startDateTime && now <= endDateTime
      }

      return {
        booking: {
          id: participant.id,
          type: 'queue',
          product: {
            id: product.id,
            title: product.title,
            duration_minutes: product.duration_minutes,
            type: product.type
          },
          creator: {
            display_name: creatorInfo?.display_name || 'クリエイター'
          },
          amount: product.price,
          status: 'waiting',
          planId: product.id,
          isPlanActive
        }
      }
    } else {
      // For fixed type, create a booking
      const { data: booking, error: bookingError } = await supabase
        .from('call_bookings')
        .insert({
          user_id: user.id,
          creator_id: product.creator_id,
          product_id: params.productId,
          amount: product.price,
          status: 'confirmed',
          payment_intent_id: params.stripePaymentIntentId
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Booking creation error:', bookingError)
        return { error: '予約の作成に失敗しました' }
      }

      // Record payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          product_id: params.productId,
          amount: product.price,
          stripe_payment_intent_id: params.stripePaymentIntentId,
          stripe_session_id: params.stripeSessionId,
          status: 'completed'
        })

      if (paymentError) {
        console.error('Payment record error:', paymentError)
      }

      return {
        booking: {
          id: booking.id,
          type: 'fixed',
          product: {
            id: product.id,
            title: product.title,
            duration_minutes: product.duration_minutes,
            type: product.type
          },
          creator: {
            display_name: creatorInfo?.display_name || 'クリエイター'
          },
          amount: product.price,
          status: 'confirmed'
        }
      }
    }
  } catch (error) {
    console.error('Booking creation error:', error)
    return { error: 'Internal server error' }
  }
}