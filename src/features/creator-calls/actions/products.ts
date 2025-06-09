'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { parse } from 'date-fns'
import { revalidatePath } from 'next/cache'

export async function getCreatorCallProducts(options: {
  status?: 'all' | 'active' | 'completed' | 'cancelled'
  page?: number
  limit?: number
} = {}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    const { status = 'all', page = 1, limit = 10 } = options
    const offset = (page - 1) * limit

    let query = supabase
      .from('call_products')
      .select('*', { count: 'exact' })
      .eq('creator_id', user.id)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: products, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[getCreatorCallProducts] Error:', error)
      return { error: 'Failed to fetch products' }
    }

    // 各商品の予約状況を取得
    const productIds = products?.map(p => p.id) || []
    const { data: bookings } = await supabase
      .from('call_bookings')
      .select('product_id, status')
      .in('product_id', productIds)

    // 商品ごとの予約数を集計
    const bookingCounts = products?.map(product => {
      const productBookings = bookings?.filter(b => b.product_id === product.id) || []
      return {
        ...product,
        booking_counts: {
          total: productBookings.length,
          confirmed: productBookings.filter(b => b.status === 'confirmed').length,
          completed: productBookings.filter(b => b.status === 'completed').length,
          cancelled: productBookings.filter(b => b.status === 'cancelled').length
        }
      }
    })

    return {
      products: bookingCounts || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    }
  } catch (error) {
    console.error('[getCreatorCallProducts] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function deleteCallProduct(productId: string) {
  // Soft delete - just update status to 'deleted'
  return cancelCallProduct(productId, 'deleted')
}

export async function cancelCallProduct(productId: string, reason: string = 'クリエイターによるキャンセル') {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Check product ownership
    const { data: product, error: productError } = await supabase
      .from('call_products')
      .select('*')
      .eq('id', productId)
      .eq('creator_id', user.id)
      .single()

    if (productError || !product) {
      return { error: 'Product not found' }
    }

    // Cancel all confirmed bookings
    const { data: cancelledBookings, error: bookingsError } = await supabase
      .from('call_bookings')
      .update({ 
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('status', 'confirmed')
      .select()

    if (bookingsError) {
      console.error('[cancelCallProduct] Failed to cancel bookings:', bookingsError)
      return { error: 'Failed to cancel bookings' }
    }

    // Update product status
    const newStatus = reason === 'deleted' ? 'deleted' : 'cancelled'
    const { error: updateError } = await supabase
      .from('call_products')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (updateError) {
      console.error('[cancelCallProduct] Failed to update product:', updateError)
      return { error: 'Failed to update product status' }
    }

    revalidatePath('/creator/calls')
    return { 
      success: true,
      affectedBookings: cancelledBookings?.length || 0
    }
  } catch (error) {
    console.error('[cancelCallProduct] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function createCallPlan(data: {
  title: string
  description?: string
  type: 'fixed' | 'queue'
  price: number
  duration_minutes: number
  max_participants?: number
  // For fixed type
  available_from?: string
  available_until?: string
  // For queue type
  slot_date?: string
  start_time?: string
  end_time?: string
  break_minutes?: number
}) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Check for time conflicts
    const conflictCheck = await checkTimeConflict({
      creatorId: user.id,
      type: data.type,
      available_from: data.available_from,
      available_until: data.available_until,
      slot_date: data.slot_date,
      start_time: data.start_time,
      end_time: data.end_time
    })

    if (conflictCheck.hasConflict) {
      return { error: '指定された時間帯に既に予約があります' }
    }

    type ProductData = {
      creator_id: string
      title: string
      description: string
      type: 'fixed' | 'queue'
      price: number
      duration_minutes: number
      status: string
      available_from?: string
      available_until?: string
      slot_date?: string
      start_time?: string
      end_time?: string
      break_minutes?: number
      max_participants?: number
      remaining_slots?: number
      start_at?: string
      end_at?: string
    }

    let productData: ProductData = {
      creator_id: user.id,
      title: data.title,
      description: data.description || '',
      type: data.type,
      price: data.price,
      duration_minutes: data.duration_minutes,
      status: 'active'
    }

    if (data.type === 'fixed') {
      productData = {
        ...productData,
        available_from: data.available_from,
        available_until: data.available_until,
        max_participants: 1,
        remaining_slots: 1
      }
    } else {
      // Queue type
      productData = {
        ...productData,
        slot_date: data.slot_date,
        start_time: data.start_time,
        end_time: data.end_time,
        break_minutes: data.break_minutes || 0,
        max_participants: data.max_participants || 10,
        remaining_slots: data.max_participants || 10
      }

      // Calculate and set start_at and end_at for queue type
      if (data.slot_date && data.start_time && data.end_time) {
        // Assume the input time is in JST (UTC+9)
        // Create date string with explicit timezone
        const startDateTimeJST = `${data.slot_date}T${data.start_time}+09:00`
        productData.start_at = new Date(startDateTimeJST).toISOString()
        
        // Handle end time that might be on the next day
        let endDateTimeJST = `${data.slot_date}T${data.end_time}+09:00`
        if (data.end_time < data.start_time) {
          // End time is on the next day
          const endDate = new Date(data.slot_date)
          endDate.setDate(endDate.getDate() + 1)
          endDateTimeJST = `${endDate.toISOString().split('T')[0]}T${data.end_time}+09:00`
        }
        productData.end_at = new Date(endDateTimeJST).toISOString()
      }
    }

    const { data: product, error: insertError } = await supabase
      .from('call_products')
      .insert(productData)
      .select()
      .single()

    if (insertError) {
      console.error('[createCallPlan] Insert error:', insertError)
      return { error: 'Failed to create call plan' }
    }

    revalidatePath('/creator/calls')
    return { success: true, product }
  } catch (error) {
    console.error('[createCallPlan] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function checkTimeConflict(data: {
  creatorId: string
  type: 'fixed' | 'queue'
  available_from?: string
  available_until?: string
  slot_date?: string
  start_time?: string
  end_time?: string
  excludeProductId?: string
}): Promise<{ hasConflict: boolean; conflictingProducts?: unknown[] }> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)

    // Get all active products for the creator
    let query = supabase
      .from('call_products')
      .select('*')
      .eq('creator_id', data.creatorId)
      .eq('status', 'active')

    if (data.excludeProductId) {
      query = query.neq('id', data.excludeProductId)
    }

    const { data: products, error } = await query

    if (error || !products) {
      return { hasConflict: false }
    }

    const conflictingProducts = []

    for (const product of products) {
      let hasTimeOverlap = false

      if (data.type === 'fixed' && product.type === 'fixed') {
        // Both are fixed type - check time overlap
        if (data.available_from && data.available_until && 
            product.available_from && product.available_until) {
          const newStart = new Date(data.available_from)
          const newEnd = new Date(data.available_until)
          const existingStart = new Date(product.available_from)
          const existingEnd = new Date(product.available_until)

          hasTimeOverlap = !(newEnd <= existingStart || newStart >= existingEnd)
        }
      } else if (data.type === 'queue' && product.type === 'queue') {
        // Both are queue type - check if same date and time overlap
        if (data.slot_date === product.slot_date && 
            data.start_time && data.end_time &&
            product.start_time && product.end_time) {
          // Parse times for comparison
          const newStart = parse(data.start_time, 'HH:mm', new Date())
          const newEnd = parse(data.end_time, 'HH:mm', new Date())
          const existingStart = parse(product.start_time, 'HH:mm', new Date())
          const existingEnd = parse(product.end_time, 'HH:mm', new Date())

          // Handle times that cross midnight
          if (newEnd < newStart) newEnd.setDate(newEnd.getDate() + 1)
          if (existingEnd < existingStart) existingEnd.setDate(existingEnd.getDate() + 1)

          hasTimeOverlap = !(newEnd <= existingStart || newStart >= existingEnd)
        }
      }

      if (hasTimeOverlap) {
        conflictingProducts.push(product)
      }
    }

    return {
      hasConflict: conflictingProducts.length > 0,
      conflictingProducts
    }
  } catch (error) {
    console.error('[checkTimeConflict] Error:', error)
    return { hasConflict: false }
  }
}