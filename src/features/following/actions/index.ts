'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export interface FollowingCreator {
  id: string
  display_name: string
  bio: string | null
  category: string
  specialty: string | null
  avatar_url: string | null
  follower_count_real: number
  active_products_count: number
  followed_at: string
}

interface CreatorApplicationResult {
  user_id: string
  display_name: string
  bio: string | null
  category: string
  specialty: string | null
  follower_count_real: number | null
  profiles: {
    avatar_url: string | null
  } | {
    avatar_url: string | null
  }[] | null
}

export async function getFollowingCreators(): Promise<{
  creators?: FollowingCreator[]
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

    // Get follows first, then join with creator_applications
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false })

    if (followsError) {
      console.error('Error fetching follows:', followsError)
      return { error: 'フォロー情報の取得に失敗しました' }
    }

    if (!followsData || followsData.length === 0) {
      return { creators: [] }
    }

    // Get creator applications for followed users
    const followingIds = followsData.map(f => f.following_id)
    
    const { data: creatorsData, error: creatorsError } = await supabase
      .from('creator_applications')
      .select(`
        user_id,
        display_name,
        bio,
        category,
        specialty,
        follower_count_real,
        profiles!user_id(
          avatar_url
        )
      `)
      .in('user_id', followingIds)
      .eq('status', 'approved') as { data: CreatorApplicationResult[] | null, error: unknown }

    if (creatorsError) {
      console.error('Error fetching creator data:', creatorsError)
      return { error: 'クリエイター情報の取得に失敗しました' }
    }

    if (!creatorsData || creatorsData.length === 0) {
      return { creators: [] }
    }

    // Get active products count for each creator
    const creatorIds = creatorsData.map(c => c.user_id)

    const { data: productsCount, error: productsError } = await supabase
      .from('call_products')
      .select('creator_id')
      .eq('status', 'active')
      .in('creator_id', creatorIds)

    if (productsError) {
      console.error('Error fetching products count:', productsError)
    }

    // Count products per creator
    const productCounts = productsCount?.reduce((acc, product) => {
      acc[product.creator_id] = (acc[product.creator_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Create a map of follow dates
    const followDateMap = followsData.reduce((acc, follow) => {
      acc[follow.following_id] = follow.created_at
      return acc
    }, {} as Record<string, string>)

    // Transform data
    const creators: FollowingCreator[] = creatorsData.map(creator => {
      const profile = Array.isArray(creator.profiles) 
        ? creator.profiles[0] 
        : creator.profiles

      return {
        id: creator.user_id,
        display_name: creator.display_name,
        bio: creator.bio,
        category: creator.category,
        specialty: creator.specialty,
        avatar_url: profile?.avatar_url || null,
        follower_count_real: creator.follower_count_real || 0,
        active_products_count: productCounts[creator.user_id] || 0,
        followed_at: followDateMap[creator.user_id] || ''
      }
    })

    return { creators }
  } catch (error) {
    console.error('Error in getFollowingCreators:', error)
    return { error: 'Internal server error' }
  }
}

export async function unfollowCreator(creatorId: string): Promise<{
  success?: boolean
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

    // Unfollow
    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', creatorId)

    if (unfollowError) {
      console.error('Error unfollowing creator:', unfollowError)
      return { error: 'フォロー解除に失敗しました' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in unfollowCreator:', error)
    return { error: 'Internal server error' }
  }
}