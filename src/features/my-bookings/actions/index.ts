'use server'

import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import type { 
  UserBooking,
  QueueParticipant,
  CallProduct,
  CallBooking
} from '../types'

export async function getUserBookings(userId: string): Promise<{ bookings: UserBooking[], error?: string }> {
  try {
    console.log('[getUserBookings] Starting with userId:', userId)
    
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)

    // Verify user
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[getUserBookings] Auth user:', user?.id)
    
    if (!user || user.id !== userId) {
      console.log('[getUserBookings] Auth mismatch - returning empty')
      return { bookings: [], error: '認証エラー' }
    }

    // Get queue bookings
    const { data: queueBookings, error: queueError } = await supabase
      .from('queue_participants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    console.log('[getUserBookings] Queue bookings result:', {
      count: queueBookings?.length || 0,
      userId,
      error: queueError
    })

    if (queueError) {
      console.error('Queue bookings error:', queueError)
      return { bookings: [], error: 'キューの予約取得に失敗しました' }
    }

    // Get fixed bookings
    const { data: fixedBookings, error: fixedError } = await supabase
      .from('call_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (fixedError) {
      console.error('Fixed bookings error:', fixedError)
      return { bookings: [], error: '固定枠の予約取得に失敗しました' }
    }

    // Get product IDs
    const productIds = new Set<string>()
    queueBookings?.forEach(booking => {
      if (booking.plan_id) productIds.add(booking.plan_id)
    })
    fixedBookings?.forEach(booking => {
      if (booking.product_id) productIds.add(booking.product_id)
    })

    // Get all products
    let products: CallProduct[] = []
    if (productIds.size > 0) {
      const { data: productsData } = await supabase
        .from('call_products')
        .select('*')
        .in('id', Array.from(productIds))
      
      products = productsData || []
    }

    const productMap = new Map(
      products.map(p => [p.id, p])
    )

    // Get all creator IDs
    const creatorIds = new Set<string>()
    products.forEach(product => {
      if (product.creator_id) {
        creatorIds.add(product.creator_id)
      }
    })
    fixedBookings?.forEach(booking => {
      if (booking.creator_id) {
        creatorIds.add(booking.creator_id)
      }
    })

    // Get creator info
    console.log('[getUserBookings] Fetching creators:', Array.from(creatorIds))
    
    const { data: creators, error: creatorError } = await supabase
      .from('creator_applications')
      .select('user_id, display_name')
      .in('user_id', Array.from(creatorIds))
      .eq('status', 'approved')

    console.log('[getUserBookings] Creators result:', {
      count: creators?.length || 0,
      error: creatorError,
      data: creators
    })

    const creatorMap = new Map(
      creators?.map(c => [c.user_id, c]) || []
    )

    // Transform data
    const bookings: UserBooking[] = []

    console.log('[getUserBookings] Processing bookings:', {
      queueCount: queueBookings?.length || 0,
      fixedCount: fixedBookings?.length || 0,
      productCount: products.length,
      creatorIds: Array.from(creatorIds)
    })

    // Add queue bookings
    queueBookings?.forEach((booking) => {
      const product = productMap.get(booking.plan_id)
      const creatorId = product?.creator_id
      const creator = creatorId ? creatorMap.get(creatorId) : null
      
      console.log('[getUserBookings] Processing queue booking:', {
        bookingId: booking.id,
        planId: booking.plan_id,
        hasProduct: !!product,
        hasCreator: !!creator,
        creatorId
      })
      
      // クリエイター情報がなくても予約を表示する
      if (product) {
        bookings.push({
          id: booking.id,
          type: 'queue',
          status: booking.status as UserBooking['status'],
          createdAt: booking.created_at,
          queuePosition: booking.position,
          planId: booking.plan_id,
          product: {
            id: product.id,
            title: product.title,
            duration_minutes: product.duration_minutes,
            type: product.type as 'queue' | 'fixed',
            slot_date: product.slot_date,
            start_time: product.start_time
          },
          creator: {
            id: creatorId || '',
            display_name: creator?.display_name || 'クリエイター',
            profile_image_url: null
          },
          amount: product.price
        })
      }
    })

    // Add fixed bookings
    fixedBookings?.forEach((booking) => {
      const creator = booking.creator_id ? creatorMap.get(booking.creator_id) : null
      const product = productMap.get(booking.product_id)
      
      // クリエイター情報がなくても予約を表示する
      if (product) {
        bookings.push({
          id: booking.id,
          type: 'fixed',
          status: booking.status as UserBooking['status'],
          createdAt: booking.created_at,
          bookingDate: booking.booking_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          product: {
            id: product.id,
            title: product.title,
            duration_minutes: product.duration_minutes,
            type: product.type as 'queue' | 'fixed'
          },
          creator: {
            id: booking.creator_id || '',
            display_name: creator?.display_name || 'クリエイター',
            profile_image_url: null
          },
          amount: booking.amount
        })
      }
    })

    // Sort by created date
    bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    console.log('[getUserBookings] Final result:', {
      totalBookings: bookings.length,
      bookingIds: bookings.map(b => b.id)
    })

    return { bookings }
  } catch (error) {
    console.error('Get user bookings error:', error)
    return { bookings: [], error: 'Internal server error' }
  }
}