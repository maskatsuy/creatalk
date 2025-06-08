'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import type { CreatorProfileData, FollowStatus } from '../types'

export async function getCreatorProfile(creatorId: string): Promise<{
  creator?: CreatorProfileData
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)

    // Get creator application with profile data
    const { data: creatorData, error: creatorError } = await supabase
      .from('creator_applications')
      .select(`
        user_id,
        display_name,
        bio,
        category,
        specialty,
        experience,
        portfolio_url,
        social_twitter,
        social_instagram,
        social_youtube,
        pricing_plan,
        follower_count_real,
        created_at,
        profiles!user_id(
          id,
          email,
          avatar_url
        )
      `)
      .eq('user_id', creatorId)
      .eq('status', 'approved')
      .single()

    if (creatorError || !creatorData) {
      return { error: 'Creator not found' }
    }

    // Get active call products that are still available
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const currentTime = now.toTimeString().substring(0, 8) // HH:MM:SS format

    const { data: allProducts, error: productsError } = await supabase
      .from('call_products')
      .select(`
        id,
        type,
        title,
        description,
        price,
        duration_minutes,
        status,
        created_at,
        slot_date,
        start_time,
        end_time,
        max_participants,
        remaining_slots,
        available_from,
        available_until
      `)
      .eq('creator_id', creatorId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Filter available products based on current date/time
    const productsData = allProducts?.filter(product => {
      if (product.type === 'queue' && product.slot_date && product.end_time) {
        // For queue type: check if slot_date is today or future, and if today, end_time hasn't passed
        const isAvailable = product.slot_date > today || 
                          (product.slot_date === today && product.end_time > currentTime)
        
        return isAvailable
      } else if (product.type === 'fixed' && product.available_until) {
        // For fixed type: check if available_until is in the future
        const isAvailable = new Date(product.available_until) > now
        
        return isAvailable
      }
      return true // Default to show if we can't determine
    }) || []

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    // Calculate basic stats (TODO: implement proper stats calculation)
    const stats = {
      total_calls: 0, // TODO: Count from call_bookings
      average_rating: 4.5, // TODO: Calculate from reviews
      response_rate: 95, // TODO: Calculate response rate
      follower_count: creatorData.follower_count_real || 0,
      following_count: 0 // TODO: Count following
    }

    const creator: CreatorProfileData = {
      id: creatorData.user_id,
      display_name: creatorData.display_name,
      bio: creatorData.bio,
      category: creatorData.category,
      specialty: creatorData.specialty,
      experience: creatorData.experience,
      portfolio_url: creatorData.portfolio_url,
      social_twitter: creatorData.social_twitter,
      social_instagram: creatorData.social_instagram,
      social_youtube: creatorData.social_youtube,
      pricing_plan: creatorData.pricing_plan,
      follower_count_real: creatorData.follower_count_real || 0,
      created_at: creatorData.created_at,
      profiles: Array.isArray(creatorData.profiles) ? creatorData.profiles[0] || null : creatorData.profiles,
      active_products: productsData || [],
      stats
    }

    return { creator }
  } catch (error) {
    console.error('Error in getCreatorProfile:', error)
    return { error: 'Internal server error' }
  }
}

export async function getFollowStatus(creatorId: string): Promise<{
  status?: FollowStatus
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Check if current user is following this creator
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', creatorId)
      .single()

    const is_following = !followError && !!followData

    // Get total follower count
    const { count: followerCount, error: countError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', creatorId)

    if (countError) {
      console.error('Error counting followers:', countError)
    }

    return {
      status: {
        is_following,
        follower_count: followerCount || 0
      }
    }
  } catch (error) {
    console.error('Error in getFollowStatus:', error)
    return { error: 'Internal server error' }
  }
}

export async function toggleFollow(creatorId: string): Promise<{
  success?: boolean
  is_following?: boolean
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'ログインが必要です' }
    }

    // Prevent self-follow
    if (user.id === creatorId) {
      return { error: '自分をフォローすることはできません' }
    }

    // Check current follow status
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', creatorId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking follow status:', checkError)
      return { error: 'フォロー状態の確認に失敗しました' }
    }

    if (existingFollow) {
      // Unfollow
      const { error: unfollowError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', creatorId)

      if (unfollowError) {
        console.error('Error unfollowing:', unfollowError)
        return { error: 'フォロー解除に失敗しました' }
      }

      return { success: true, is_following: false }
    } else {
      // Follow
      const { error: followError } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: creatorId
        })

      if (followError) {
        console.error('Error following:', followError)
        return { error: 'フォローに失敗しました' }
      }

      return { success: true, is_following: true }
    }
  } catch (error) {
    console.error('Error in toggleFollow:', error)
    return { error: 'Internal server error' }
  }
}